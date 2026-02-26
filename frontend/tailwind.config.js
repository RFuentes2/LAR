/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "orange-accent": "rgb(var(--accent-rgb) / <alpha-value>)",
                "orange-hover": "rgb(var(--accent-hover-rgb, var(--accent-rgb)) / <alpha-value>)",
                "dark-bg": "rgb(var(--bg-rgb) / <alpha-value>)",
                "dark-card": "rgb(var(--card-rgb) / <alpha-value>)",
                "dark-border": "rgb(var(--border-rgb) / <alpha-value>)",
                "dark-text": "rgb(var(--text-rgb) / <alpha-value>)",
                "dark-muted": "rgb(var(--muted-rgb) / <alpha-value>)",
                "light-bg": "rgb(var(--bg-rgb) / <alpha-value>)",
                "light-card": "rgb(var(--card-rgb) / <alpha-value>)",
                "light-border": "rgb(var(--border-rgb) / <alpha-value>)",
                "light-text": "rgb(var(--text-rgb) / <alpha-value>)",
                "light-muted": "rgb(var(--muted-rgb) / <alpha-value>)",
            },
        },
    },
    plugins: [],
}
