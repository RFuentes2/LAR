/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                orange: {
                    accent: "#FF6B35",
                    hover: "#E85A2A",
                },
                dark: {
                    bg: "#000000",
                    card: "#121212",
                    border: "#2A2A2A",
                    text: "#E0E0E0",
                    muted: "#9CA3AF",
                }
            },
        },
    },
    plugins: [],
}
