<template>
    <div class="home container">
        <section class="hero">
            <h1>🔒 Know Your Privacy</h1>
            <p class="subtitle">Discover how private your digital life really is</p>
            <p class="description">
                Take our privacy quiz to get a personalized privacy score and actionable recommendations.
                All data stays on your device - encrypted and secure.
            </p>
            <button class="btn btn-primary btn-large" @click="startQuiz">
                Start Privacy Quiz
            </button>
            <button class="btn btn-secondary btn-large" @click="loadDashboard">
                📥 Load Saved Data
            </button>
        </section>

        <section class="features">
            <div class="feature-grid">
                <div class="feature card">
                    <div class="feature-icon">🔐</div>
                    <h3>Client-Side Encryption</h3>
                    <p>Your data never leaves your device. Everything is encrypted with your password.</p>
                </div>

                <div class="feature card">
                    <div class="feature-icon">🚫</div>
                    <h3>No Tracking</h3>
                    <p>No analytics, no cookies, no accounts. Your privacy is respected.</p>
                </div>

                <div class="feature card">
                    <div class="feature-icon">📊</div>
                    <h3>Personalized Insights</h3>
                    <p>Get a custom threat model and privacy score based on your answers.</p>
                </div>

                <div class="feature card">
                    <div class="feature-icon">💡</div>
                    <h3>Actionable Recommendations</h3>
                    <p>Learn which apps and tools can improve your digital privacy.</p>
                </div>
            </div>
        </section>

        <section class="how-it-works">
            <h2>How It Works</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <h3>Take the Quiz</h3>
                    <p>Answer questions about your app usage and threat model</p>
                </div>

                <div class="step">
                    <div class="step-number">2</div>
                    <h3>Get Your Score</h3>
                    <p>See your personalized privacy score and threat model</p>
                </div>

                <div class="step">
                    <div class="step-number">3</div>
                    <h3>View Recommendations</h3>
                    <p>Discover privacy-focused alternatives for your apps</p>
                </div>

                <div class="step">
                    <div class="step-number">4</div>
                    <h3>Save Securely</h3>
                    <p>Export your encrypted data to keep track of your progress</p>
                </div>
            </div>
        </section>

        <!-- Password Input Modal -->
        <div v-if="showPasswordModal" class="modal-overlay" @click="cancelPasswordInput">
            <div class="modal-content" @click.stop>
                <h3>🔐 Enter Password</h3>
                <p>Enter your password to decrypt the file:</p>
                <input
                    v-model="passwordInput"
                    type="password"
                    class="password-input"
                    placeholder="Enter password"
                    @keyup.enter="submitPassword"
                    ref="passwordInputRef"
                />
                <div class="modal-buttons">
                    <button class="btn btn-outline" @click="cancelPasswordInput">Cancel</button>
                    <button class="btn btn-primary" @click="submitPassword" :disabled="!passwordInput">Decrypt</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'

const router = useRouter()
const quizStore = useQuizStore()
const showPasswordModal = ref(false)
const passwordInput = ref('')
const passwordInputRef = ref<HTMLInputElement | null>(null)
let pendingFile: File | null = null

const startQuiz = () => {
    router.push('/quiz')
}

const loadDashboard = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        pendingFile = file
        passwordInput.value = ''
        showPasswordModal.value = true
        nextTick(() => {
            passwordInputRef.value?.focus()
        })
    }

    fileInput.click()
}

const submitPassword = async () => {
    if (!passwordInput.value || !pendingFile) return

    try {
        await quizStore.importEncryptedData(pendingFile, passwordInput.value)
        showPasswordModal.value = false
        showToast('Data loaded successfully!', 'success')
        router.push('/dashboard')
    } catch (error) {
        const err = error as Error
        showToast('Error loading data: ' + err.message, 'error')
    } finally {
        pendingFile = null
        passwordInput.value = ''
    }
}

const cancelPasswordInput = () => {
    showPasswordModal.value = false
    pendingFile = null
    passwordInput.value = ''
}
</script>

<style scoped>
.home {
    padding-top: 3rem;
}

.hero {
    text-align: center;
    padding: 3rem 0;
    max-width: 800px;
    margin: 0 auto;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.subtitle {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.description {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
    line-height: 1.8;
}

.btn-large {
    font-size: 1.2rem;
    padding: 1rem 2rem;
}

.features {
    margin: 4rem 0;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature {
    text-align: center;
    transition: transform 0.2s;
}

.feature:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature h3 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.how-it-works {
    margin: 4rem 0;
    text-align: center;
}

.how-it-works h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.step {
    padding: 2rem;
}

.step-number {
    width: 60px;
    height: 60px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto 1rem;
}

.step h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.step p {
    color: var(--text-secondary);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    margin: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.modal-content p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.password-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    transition: border-color 0.2s;
}

.password-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}
</style>
