"use server";

import { serverApi } from '../server-api';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function updateProfileServerAction(formData: FormData) {
    try {
        const response = await serverApi.put('/auth/profile/', {
            body: formData,
        });
        
        if (!response.success) {
            return { 
                success: false, 
                error: response.error?.detail || response.error?.error || response.error || 'Failed to update profile' 
            };
        }
        
        // Revalidate the profile page so the next render fetches fresh data
        revalidatePath('/profile');
        
        return { success: true, data: response.data };
    } catch (err: any) {
        return { success: false, error: err.message || 'An unexpected error occurred' };
    }
}

export async function changePasswordServerAction(data: any) {
    try {
        const response = await serverApi.post('/auth/change-password/', {
            body: JSON.stringify(data),
            requiresAuth: true,
        });

        if (!response.success) {
            return { 
                success: false, 
                error: response.error?.detail || response.error?.error || response.error || 'Failed to change password' 
            };
        }

        return { success: true, data: response.data };
    } catch (err: any) {
        return { success: false, error: err.message || 'An unexpected error occurred' };
    }
}

export async function deleteAccountServerAction(data: any) {
    try {
        const response = await serverApi.delete('/auth/delete-account/', {
            body: JSON.stringify(data),
            requiresAuth: true,
        });

        if (!response.success) {
            return { 
                success: false, 
                error: response.error?.detail || response.error?.error || response.error || 'Failed to delete account' 
            };
        }

        // On successful deletion, clear the cookies
        const cookieStore = await cookies();
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'An unexpected error occurred' };
    }
}
