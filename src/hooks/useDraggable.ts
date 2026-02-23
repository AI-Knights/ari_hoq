import { useState, useEffect, useRef, RefObject } from 'react';

export function useDraggable(ref: RefObject<HTMLElement | null>) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const positionRef = useRef(position);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const initialOffset = useRef({ x: 0, y: 0 });

    // Keep ref in sync with state
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging.current = true;
            startPos.current = { x: e.clientX, y: e.clientY };
            initialOffset.current = { ...positionRef.current };
            element.style.cursor = 'grabbing';
            // e.preventDefault(); // Don't prevent default here to allow focus/etc if needed, but usually good for drag
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            
            setPosition({
                x: initialOffset.current.x + dx,
                y: initialOffset.current.y + dy
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            if (element) element.style.cursor = 'grab';
        };

        const handleTouchStart = (e: TouchEvent) => {
            isDragging.current = true;
            const touch = e.touches[0];
            startPos.current = { x: touch.clientX, y: touch.clientY };
            initialOffset.current = { ...positionRef.current };
            // e.preventDefault(); // Might block scrolling if not careful
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging.current) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startPos.current.x;
            const dy = touch.clientY - startPos.current.y;
            setPosition({
                x: initialOffset.current.x + dx,
                y: initialOffset.current.y + dy
            });
            e.preventDefault(); // Prevent scrolling while dragging
        };

        const handleTouchEnd = () => {
            isDragging.current = false;
        };

        element.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        element.style.cursor = 'grab';

        return () => {
            element.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            
            element.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [ref]); // Removed position dependency

    return { position };
}
