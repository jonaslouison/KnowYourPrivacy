import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'kyp-theme'

function getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(getInitialTheme())

export function useTheme() {
    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', theme.value)
        localStorage.setItem(STORAGE_KEY, theme.value)
    }

    return { theme, toggleTheme }
}
