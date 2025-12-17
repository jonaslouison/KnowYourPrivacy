<template>
    <div class="home container">
        <section class="hero">
            <h1>🔒 Know Your Privacy</h1>
            <p class="subtitle">Discover how private your digital life really is</p>
            <p class="description">
                Take our privacy quiz to get a personalized privacy score and actionable recommendations.
                All data stays on your device - encrypted and secure.
            </p>
            <BaseButton variant="primary" class="btn-large" @click="goToQuiz">
                {{ primaryCtaLabel }}
            </BaseButton>
            <BaseButton variant="secondary" class="btn-large" @click="loadDashboard">
                📥 Load Saved Data
            </BaseButton>
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

        <BaseModal v-model:visible="showPasswordModal" title="🔐 Enter Password" :hideCloseButton="true">
            <div class="file-info">
                <p class="file-label">Selected file:</p>
                <div class="file-name">
                    <p>📄 {{ fileName }}</p>
                    <BaseButton variant="outline" size="small" class="change-file" @click="loadDifferentFile">
                        📂 Change File
                    </BaseButton>
                </div>
            </div>
            <p>Enter your password to decrypt the file:</p>
            <BaseInput
                v-model="passwordInput"
                type="password"
                class="password-input"
                :class="{ error: passwordError }"
                @keyup.enter="submitPassword"
                ref="passwordInputRef"
            />
            <div v-if="passwordError" class="error-message">
                ⚠️ {{ passwordError }}
            </div>
            <template #footer>
                <BaseButton variant="outline" size="small" @click="cancelPasswordInput">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="submitPassword" :disabled="!passwordInput">Decrypt</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import { useQuizStore } from '../stores/quiz'
import { useTimerStore } from '../stores/timer'
import { showToast } from '../utils/toast'
import { validateExportFile } from '../utils/crypto'

const router = useRouter()
const quizStore = useQuizStore()
const timerStore = useTimerStore()
const showPasswordModal = ref(false)
const fileName = ref('')
const passwordInput = ref('')
const passwordError = ref('')
const passwordInputRef = ref<{ focus: () => void } | null>(null)
let pendingFile: File | null = null

const primaryCtaLabel = computed(() => {
    if (quizStore.isLoadedFromFile || quizStore.isCompleted) {
        return '👁️ See Quiz Answers'
    }

    return '🎯 Start Privacy Quiz'
})

const goToQuiz = () => {
    if (quizStore.isLoadedFromFile || quizStore.isCompleted) {
        router.push('/dashboard')
        return
    }

    // Reset and start quiz timer when user begins the quiz
    timerStore.resetQuizTimer()
    timerStore.startQuizTimer()
    router.push('/quiz')
}

const loadDashboard = () => {
    // Reset and start load timer when user initiates file loading
    timerStore.resetLoadTimer()
    timerStore.startLoadTimer()

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) {
            showToast('File selection cancelled', 'warning')
            timerStore.resetLoadTimer()
            return
        }

        try {
            // Validate file format first
            await validateExportFile(file)
            pendingFile = file
            fileName.value = file.name
            passwordInput.value = ''
            passwordError.value = ''
            showPasswordModal.value = true
            nextTick(() => {
                passwordInputRef.value?.focus()
            })
        } catch (error) {
            const err = error as Error
            showToast(err.message, 'error')
            // Re-open file picker automatically
            fileInput.click()
        }
    }

    fileInput.click()
}

const submitPassword = async () => {
    if (!passwordInput.value || !pendingFile) return

    try {
        await quizStore.importEncryptedData(pendingFile, passwordInput.value)
        showPasswordModal.value = false
        
        // Stop load timer on successful import
        timerStore.stopLoadTimer()
        showToast('Data loaded successfully!', 'success')

        // Route based on completion state so unfinished quizzes resume where left off
        if (quizStore.isCompleted) {
            router.push('/dashboard')
        } else {
            router.push('/quiz')
        }

        // Only clear on success
        pendingFile = null
        passwordInput.value = ''
        passwordError.value = ''
    } catch (error) {
        const err = error as Error
        passwordError.value = err.message
        // Do NOT clear password, allow user to retry
    }
}

const cancelPasswordInput = () => {
    showPasswordModal.value = false
    pendingFile = null
    fileName.value = ''
    passwordInput.value = ''
    passwordError.value = ''
    // Reset load timer when user cancels
    timerStore.resetLoadTimer()
}

const loadDifferentFile = () => {
    cancelPasswordInput()
    loadDashboard()
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

.password-input .base-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    transition: border-color 0.2s;
    background: var(--card-bg);
}

.password-input .base-input:focus {
    border-color: var(--primary-color);
}

.password-input.error .base-input {
    border-color: var(--danger-color);
    background-color: rgba(220, 38, 38, 0.05);
}

.error-message {
    color: var(--danger-color);
    font-size: 0.875rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: rgba(220, 38, 38, 0.1);
    border-radius: 6px;
    border-left: 3px solid var(--danger-color);
}

.file-info {
    background-color: #f5f5f5;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.file-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0 0 0.5rem 0;
}

.file-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-primary);
    font-weight: 600;
    margin: 0;
}

.file-name p {
    margin: 0;
    flex: 1;
    word-break: break-word;
}

.file-name .change-file {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
}
</style>
