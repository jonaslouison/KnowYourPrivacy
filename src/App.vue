<template>
    <div id="app">
        <header class="header">
            <nav class="nav container">
                <div class="logo">
                    <router-link to="/">🔒 KnowYourPrivacy</router-link>
                </div>
                <div class="nav-links">
                    <router-link to="/">Home</router-link>
                    <router-link to="/quiz">Quiz</router-link>
                    <router-link to="/dashboard" v-if="hasCompletedQuiz">Dashboard</router-link>
                </div>
            </nav>
        </header>

        <main>
            <router-view />
        </main>

        <footer class="footer">
            <div class="container">
                <p>🔐 All data is encrypted and stored locally on your device. No tracking. Open source.</p>
                <p>
                    <a href="https://github.com/Nepholis/KnowYourPrivacy" target="_blank" rel="noopener noreferrer">
                        View on GitHub
                    </a>
                </p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from './stores/quiz'

const quizStore = useQuizStore()
const hasCompletedQuiz = computed(() => quizStore.isCompleted)
</script>

<style scoped>
.header {
    background: var(--card-bg);
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
}

.logo a {
    text-decoration: none;
    color: var(--primary-color);
}

.nav-links {
    display: flex;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
    color: var(--primary-color);
}

main {
    min-height: calc(100vh - 200px);
}

.footer {
    background: var(--card-bg);
    border-top: 1px solid var(--border-color);
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-top: 4rem;
}

.footer p {
    margin: 0.5rem 0;
}

.footer a {
    color: var(--primary-color);
    text-decoration: none;
}

.footer a:hover {
    text-decoration: underline;
}
</style>
