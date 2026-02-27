// FILE: frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Paleta Medieval/RPG
                realmDark: '#120f09',      // Fundo quase preto (pedra úmida)
                realmStone: '#2a261f',     // Cards (pedra lavrada)
                realmParchment: '#f4e4bc', // Fundo de inputs (pergaminho antigo)
                realmGold: '#daa520',      // Destaques e Ouro brilhante
                realmGoldDark: '#9e7b1a',  // Borda de ouro velho
                realmIron: '#3e392f',      // Detalhes em ferro
                realmText: '#e0d8c3',      // Texto principal (creme desbotado)
                realmRed: '#b71c1c',       // Botões e Lacre de cera
            },
            fontFamily: {
                brand: ['"Cinzel Decorative"', 'serif'], // Título principal
                heading: ['MedievalSharp', 'cursive'],  // Subtítulos
                body: ['Spectral', 'serif'],            // Textos longos e inputs
            },
            boxShadow: {
                // Efeitos de iluminação
                'torch': '0 0 15px rgba(218, 165, 32, 0.3), 0 0 30px rgba(183, 28, 28, 0.1)',
                'gold-glow': '0 0 10px rgba(218, 165, 32, 0.5)',
                'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
            },
        },
    },
    plugins: [],
}