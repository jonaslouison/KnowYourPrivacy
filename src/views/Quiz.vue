<template>
    <div class="quiz container">
        <!-- Quiz Header -->
        <div v-if="!quizCompleted && showQuiz" class="quiz-header">
            <h1>Privacy Quiz</h1>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="progress-text">Question {{ quizStore.currentQuestionIndex + 1 }} of {{ questions.length }}</p>
            <div class="header-buttons">
                <button class="btn btn-outline btn-small" @click="showRestartConfirm = true" title="Restart Quiz">
                    🔄 Restart
                </button>
                <button class="btn btn-danger btn-small" @click="showDeleteConfirm = true" title="Delete All Data">
                    🗑️ Delete All Data
                </button>
            </div>
        </div>

        <!-- Unfinished Quiz Indicator -->
        <div v-if="!quizCompleted && showQuiz && quizStore.isLoadedFromFile" class="info-banner">
            <div class="info-content">
                <span class="info-icon">ℹ️</span>
                <div class="info-text">
                    <strong>Continuing Your Quiz</strong>
                    <p>You're resuming from where you left off. Continue answering to complete the quiz.</p>
                </div>
            </div>
        </div>

        <!-- Quiz Content -->
        <div v-if="!quizCompleted && showQuiz" class="quiz-content">
            <div class="question-card card">
                <h2>{{ currentQuestion.question }}</h2>
                <p class="question-category">{{ currentQuestion.category }}</p>

                <div class="options">
                    <button v-for="option in currentQuestion.options" :key="option.value" class="option-btn"
                        :class="{ selected: selectedAnswer === option.value }" @click="selectAnswer(option.value)">
                        {{ option.label }}
                    </button>
                </div>

                <div class="quiz-actions">
                    <button class="btn btn-outline" @click="previousQuestion" :disabled="quizStore.currentQuestionIndex === 0">
                        Previous
                    </button>
                    <button class="btn btn-secondary" @click="exportDuringQuiz" title="Save your progress">
                        💾 Save Progress
                    </button>
                    <button class="btn btn-primary" @click="nextQuestion" :disabled="!selectedAnswer">
                        {{ isLastQuestion ? 'Finish' : 'Next' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Quiz Completion Screen -->
        <div v-if="quizCompleted && !showQuiz" class="completion-screen">
            <div class="completion-card card">
                <div class="congratulations">
                    <h1>🎉 Congratulations!</h1>
                    <p>You've completed the Privacy Quiz</p>
                    <p class="completion-message">
                        You now have a personalized privacy score and recommendations for your digital security.
                    </p>
                    <button class="btn btn-primary btn-large" @click="viewDashboard">
                        📊 View Your Dashboard
                    </button>
                </div>
            </div>
        </div>

        <!-- Password Modal for Saving Progress -->
        <div v-if="showPasswordModal" class="modal-overlay" @click="cancelPasswordInput">
            <div class="modal-content" @click.stop>
                <h3>🔐 Save Your Progress</h3>
                <p class="modal-description">Enter a password to encrypt and save your quiz progress.</p>
                <input
                    v-model="passwordInput"
                    type="password"
                    placeholder="Enter password"
                    @keyup.enter="submitPassword"
                    ref="passwordInputRef"
                    class="password-input"
                />
                <div v-if="passwordError" class="error-message">
                    ⚠️ {{ passwordError }}
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-outline" @click="cancelPasswordInput">Cancel</button>
                    <button class="btn btn-primary" @click="submitPassword" :disabled="!passwordInput">Save</button>
                </div>
            </div>
        </div>

        <!-- Restart Confirmation Dialog -->
        <div v-if="showRestartConfirm" class="modal-overlay" @click="cancelRestart">
            <div class="modal-content" @click.stop>
                <h3>🔄 Restart Quiz?</h3>
                <p>This will clear all your answers and start the quiz from the beginning.</p>
                <div class="modal-buttons">
                    <button class="btn btn-outline" @click="cancelRestart">Cancel</button>
                    <button class="btn btn-primary" @click="confirmRestart">Restart Quiz</button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
            <div class="modal-content" @click.stop>
                <h3>⚠️ Delete All Data?</h3>
                <p>This will permanently delete all your quiz answers and results. This action cannot be undone.</p>
                <p><strong>Make sure you've exported your data if you want to keep it!</strong></p>
                <div class="modal-buttons">
                    <button class="btn btn-outline" @click="cancelDelete">Cancel</button>
                    <button class="btn btn-danger" @click="confirmDelete">Delete Everything</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'

const router = useRouter()
const quizStore = useQuizStore()

const selectedAnswer = ref<string | null>(null)
const quizCompleted = ref(false)
const showQuiz = ref(true)
const showPasswordModal = ref(false)
const showDeleteConfirm = ref(false)
const showRestartConfirm = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const passwordInputRef = ref<HTMLInputElement>()

const questions = quizStore.questions

const currentQuestion = computed(() => questions[quizStore.currentQuestionIndex])
const isLastQuestion = computed(() => quizStore.currentQuestionIndex === questions.length - 1)
const progressPercentage = computed(() => ((quizStore.currentQuestionIndex + 1) / questions.length) * 100)

// Load existing answer when current question changes
const loadExistingAnswer = () => {
    const existingAnswer = quizStore.getAnswer(currentQuestion.value.id)
    selectedAnswer.value = existingAnswer || null
}

// Initialize: restore quiz state if loaded from file
onMounted(() => {
    // Restore quiz completion state
    if (quizStore.isCompleted) {
        quizCompleted.value = true
        showQuiz.value = false
    } else {
        // Load the answer for current question
        loadExistingAnswer()
    }
})

const selectAnswer = (value: string) => {
    selectedAnswer.value = value
}

const nextQuestion = () => {
    if (!selectedAnswer.value) return

    quizStore.saveAnswer({
        questionId: currentQuestion.value.id,
        answer: selectedAnswer.value
    })

    if (isLastQuestion.value) {
        quizStore.completeQuiz()
        quizCompleted.value = true
        showQuiz.value = false
    } else {
        quizStore.currentQuestionIndex++
        loadExistingAnswer()
    }
}

const previousQuestion = () => {
    if (quizStore.currentQuestionIndex > 0) {
        quizStore.currentQuestionIndex--
        loadExistingAnswer()
    }
}

const exportDuringQuiz = () => {
    showPasswordModal.value = true
    passwordInput.value = ''
    passwordError.value = ''
    setTimeout(() => passwordInputRef.value?.focus(), 100)
}

const submitPassword = async () => {
    if (!passwordInput.value) return

    try {
        passwordError.value = ''
        const success = await quizStore.exportEncryptedData(passwordInput.value)
        if (success) {
            showPasswordModal.value = false
            passwordInput.value = ''
            showToast('Quiz progress saved successfully!', 'success')
        }
    } catch (error) {
        passwordError.value = error instanceof Error ? error.message : 'Failed to save progress'
    }
}

const cancelPasswordInput = () => {
    showPasswordModal.value = false
    passwordInput.value = ''
    passwordError.value = ''
}

const viewDashboard = () => {
    router.push('/dashboard')
}

const confirmRestart = () => {
    quizStore.resetQuiz()
    quizCompleted.value = false
    showQuiz.value = true
    showRestartConfirm.value = false
    loadExistingAnswer()
    showToast('Quiz restarted', 'success')
}

const cancelRestart = () => {
    showRestartConfirm.value = false
}

const confirmDelete = () => {
    quizStore.resetQuiz()
    showDeleteConfirm.value = false
    quizCompleted.value = false
    showQuiz.value = true
    showToast('All data deleted successfully', 'success')
    router.push('/')
}

const cancelDelete = () => {
    showDeleteConfirm.value = false
}
</script>

<style scoped>
.quiz {
    max-width: 800px;
    margin: 0 auto;
    padding-top: 2rem;
}

.quiz-header {
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
}

.quiz-header h1 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

.header-buttons {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    gap: 0.5rem;
}

.btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
}

.progress-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.info-banner {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #e3f2fd;
    border-left: 4px solid var(--primary-color);
    border-radius: 6px;
}

.info-content {
    display: flex;
    gap: 1rem;
}

.info-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-text {
    flex: 1;
}

.info-text strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 0.25rem;
}

.info-text p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

.question-card {
    padding: 2.5rem;
}

.question-card h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.question-category {
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 2rem;
    text-transform: uppercase;
}

.options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.option-btn {
    padding: 1rem 1.5rem;
    border: 2px solid var(--border-color);
    background: var(--card-bg);
    border-radius: 8px;
    text-align: left;
    font-size: 1rem;
    transition: all 0.2s;
    cursor: pointer;
}

.option-btn:hover {
    border-color: var(--primary-color);
    background: #f0f1ff;
}

.option-btn.selected {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
    font-weight: 500;
}

.quiz-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.quiz-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.completion-screen {
    padding-top: 4rem;
    text-align: center;
}

.completion-card {
    padding: 4rem 2rem;
    text-align: center;
}

.congratulations {
    animation: slideUp 0.5s ease-out;
}

.congratulations h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.congratulations p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.completion-message {
    color: var(--text-primary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
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
    margin: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.modal-description {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.modal-content p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    line-height: 1.6;
}

.modal-content p strong {
    color: var(--text-primary);
}

.password-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    font-size: 1rem;
    margin-bottom: 0.75rem;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.password-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.error-message {
    color: var(--danger-color);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #ffebee;
    border-radius: 4px;
}

.modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
