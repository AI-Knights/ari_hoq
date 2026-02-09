import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                midnight: '#0A1A3A',
                indigo: '#1a1a4a',
                gold: '#daa756',
                taupe: '#b4aba6',
            },
            fontFamily: {
                sans: ['var(--font-montserrat)', 'sans-serif'],
                heading: ['var(--font-poppins)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
