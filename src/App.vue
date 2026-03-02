<template>
    <div id="app">
        <header class="header">
            <nav class="nav container">
                <div class="logo">
                    <router-link to="/">🔒 KnowYourPrivacy</router-link>
                </div>
                <button class="burger-menu" @click="mobileMenuOpen = !mobileMenuOpen" :class="{ active: mobileMenuOpen }" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <!-- Mobile Navigation Backdrop -->
                <div v-if="mobileMenuOpen" class="nav-backdrop" @click="mobileMenuOpen = false"></div>
                <div class="nav-links" :class="{ open: mobileMenuOpen }">
                    <router-link to="/" @click="mobileMenuOpen = false">Home</router-link>
                    <router-link to="/quiz" @click="mobileMenuOpen = false">Quiz</router-link>
                    <router-link to="/dashboard" @click="mobileMenuOpen = false">Dashboard</router-link>
                    <router-link to="/wiki/email" @click="mobileMenuOpen = false">Wiki</router-link>
                </div>
                <div class="timer-display">
                    <div v-if="timerStore.quizTimerActive" class="timer-item" :class="{ running: timerStore.quizTimerRunning, completed: timerStore.quizTimerCompleted }">
                        <span class="timer-label">Quiz:</span>
                        <span class="timer-value">{{ timerStore.quizElapsedFormatted }}</span>
                        <button v-if="timerStore.quizTimerCompleted" class="copy-btn" @click="copyQuizTime" title="Copy to clipboard">📋</button>
                    </div>
                    <div v-if="timerStore.loadTimerActive" class="timer-item" :class="{ running: timerStore.loadTimerRunning, completed: timerStore.loadTimerCompleted }">
                        <span class="timer-label">Load:</span>
                        <span class="timer-value">{{ timerStore.loadElapsedFormatted }}</span>
                        <button v-if="timerStore.loadTimerCompleted" class="copy-btn" @click="copyLoadTime" title="Copy to clipboard">📋</button>
                    </div>
                </div>
            </nav>
        </header>
        
        <main>
            <router-view />
        </main>
        
        <footer class="footer">
            <div class="container footer-content">
                <div class="footer-links">
                    <router-link to="/#how-it-works">How It Works</router-link>
                    <router-link to="/#philosophy">Philosophy</router-link>
                    <router-link to="/#faq">FAQ</router-link>
                    <router-link to="/wiki/email">Wiki</router-link>
                    <a href="https://github.com/jonaslouison/KnowYourPrivacy" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
                <p class="footer-tagline">🔐 All data is encrypted and stored locally. No tracking. Open source.</p>
                <p class="footer-credits">Made with ❤️ for privacy</p>
                <p class="footer-version">v{{ appVersion }}</p>
            </div>
        </footer>
        
        <ToastContainer />
        <BaseModal v-model:visible="showReloadConfirm" title="Are you sure?">
            <p class="modal-description">
                Reloading will discard unsaved answers. Save before leaving to keep your progress.
            </p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelReload">Cancel</BaseButton>
                <BaseButton variant="secondary" @click="saveAndReload">Save & reload</BaseButton>
                <BaseButton variant="danger" @click="confirmReload">Discard & reload</BaseButton>
            </template>
        </BaseModal>
        
        <BaseModal v-model:visible="showPasswordModal" title="🔐 Save Your Progress">
            <p class="modal-description">Enter a password to encrypt your quiz progress.</p>
            <BaseInput
                v-model="passwordInput"
                :ref="passwordInputRef"
                type="password"
                placeholder="Choose a password"
            />
            <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelPasswordInput">Cancel</BaseButton>
                <BaseButton variant="secondary" @click="submitPassword">Save</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue'
import BaseModal from './components/BaseModal.vue'
import BaseButton from './components/BaseButton.vue'
import BaseInput from './components/BaseInput.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
    registerReloadGuardListeners,
    unregisterReloadGuardListeners,
    useReloadGuard
} from './composables/useReloadGuard'
import { useTimerStore } from './stores/timer'
import { showToast } from './utils/toast'

declare const __APP_VERSION__: string
const appVersion = __APP_VERSION__

const timerStore = useTimerStore()
const mobileMenuOpen = ref(false)

const copyQuizTime = async () => {
    await timerStore.copyQuizTime()
    showToast('Quiz time copied!', 'success')
}

const copyLoadTime = async () => {
    await timerStore.copyLoadTime()
    showToast('Load time copied!', 'success')
}

const reloadGuard = useReloadGuard()
const {
    showReloadConfirm,
    showPasswordModal,
    passwordInput,
    passwordError,
    cancelPasswordInput,
    submitPassword,
    cancelReload,
    saveAndReload,
    confirmReload
} = reloadGuard

const passwordInputRef = reloadGuard.passwordInputRef

onMounted(registerReloadGuardListeners)
onBeforeUnmount(unregisterReloadGuardListeners)
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
    justify-content: center;
    align-items: center;
    padding: 1rem 2rem;
    position: relative;
}

.logo {
    position: absolute;
    left: 2rem;
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

.timer-display {
    position: absolute;
    right: 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
}

.timer-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--color-surface, #f3f4f6);
    border: 1px solid var(--border-color);
}

.timer-item.running {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
    animation: pulse 1s infinite;
}

.timer-item.completed {
    background: rgba(34, 197, 94, 0.1);
    border-color: #22c55e;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.timer-label {
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.7rem;
    text-transform: uppercase;
}

.timer-value {
    font-weight: 700;
    color: var(--text-primary);
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.15rem;
    font-size: 0.85rem;
    opacity: 0.7;
    transition: opacity 0.15s;
}

.copy-btn:hover {
    opacity: 1;
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

.footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.footer-links {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
}

.footer-links a {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.footer-links a:hover {
    color: var(--primary-color);
}

.footer-tagline {
    margin: 0;
    color: var(--text-secondary);
}

.footer-credits {
    margin: 0;
    color: var(--text-tertiary, #9ca3af);
    font-size: 0.85rem;
}

.footer-version {
    margin: 0.25rem 0 0;
    color: var(--text-tertiary, #9ca3af);
    font-size: 0.75rem;
    opacity: 0.7;
}

.footer a {
    color: var(--primary-color);
    text-decoration: none;
}

/* Mobile Navigation */
.burger-menu {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    z-index: 101;
}

.burger-menu span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--primary-color);
    transition: transform 0.3s, opacity 0.3s;
}

.burger-menu.active span:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
}

.burger-menu.active span:nth-child(2) {
    opacity: 0;
}

.burger-menu.active span:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
}

@media (max-width: 768px) {
    .nav {
        padding: 1rem;
    }

    .logo {
        position: static;
        font-size: 1.2rem;
    }

    .burger-menu {
        display: flex;
        position: absolute;
        right: 1rem;
    }

    .nav-links {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: var(--card-bg);
        flex-direction: column;
        padding: 1rem;
        gap: 0;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 99;
    }

    .nav-links.open {
        transform: translateX(0);
    }

    .nav-links a {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .nav-links a:last-child {
        border-bottom: none;
    }

    .nav-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 98;
    }

    .timer-display {
        display: none;
    }

    .container {
        padding: 1rem;
    }

    .footer-links {
        flex-direction: column;
        gap: 1rem;
    }
}

.footer a:hover {
    text-decoration: underline;
}

</style>
