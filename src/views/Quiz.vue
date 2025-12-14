<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseModal from '../components/BaseModal.vue'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'
import { useReloadGuard } from '../composables/useReloadGuard'

const router = useRouter()
const quizStore = useQuizStore()
const { openPasswordModal } = useReloadGuard()

const selectedAnswer = ref<string | null>(null)
const quizCompleted = ref(false)
const showQuiz = ref(true)
const quizResumedBanner = ref(false)
const showDeleteConfirm = ref(false)
const showRestartConfirm = ref(false)

const questions = quizStore.questions

const currentQuestion = computed(() => questions[quizStore.currentQuestionIndex])
const isLastQuestion = computed(() => quizStore.currentQuestionIndex === questions.length - 1)
const progressPercentage = computed(() => ((quizStore.currentQuestionIndex + 1) / questions.length) * 100)

onMounted(() => {
    if (quizStore.isCompleted) {
        quizCompleted.value = true
        showQuiz.value = false
    } else {
        loadExistingAnswer()
    }

    if (quizStore.isLoadedFromFile && !quizStore.isCompleted) {
        quizResumedBanner.value = true
    }
})

const loadExistingAnswer = () => {
    const existingAnswer = quizStore.getAnswer(currentQuestion.value.id)
    selectedAnswer.value = existingAnswer || null
}

const selectAnswer = (value: string) => {
    selectedAnswer.value = value
    if (quizResumedBanner.value) quizResumedBanner.value = false
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
    openPasswordModal()
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

<template>
    <div class="quiz container">
        <!-- Quiz Header -->
        <div v-if="!quizCompleted && showQuiz" class="quiz-header">
            <div class="quiz-header-top">
                <h1>Privacy Quiz</h1>
                <div class="header-buttons">
                    <BaseButton variant="outline" size="small" @click="showRestartConfirm = true" title="Restart Quiz">
                        🔄 Restart
                    </BaseButton>
                    <BaseButton variant="secondary" size="small" @click="exportDuringQuiz" title="Save Progress">
                        💾 Save Progress
                    </BaseButton>
                    <BaseButton variant="danger" size="small" @click="showDeleteConfirm = true" title="Delete All Data">
                        🗑️ Delete All Data
                    </BaseButton>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="progress-text">Question {{ quizStore.currentQuestionIndex + 1 }} of {{ questions.length }}</p>
        </div>

        <!-- Transient Unfinished Quiz Indicator (only right after resume) -->
        <div v-if="quizResumedBanner" class="info-banner">
            <div class="info-content">
                <span class="info-icon">ℹ️</span>
                <div class="info-text">
                    <strong>Continuing Your Quiz</strong>
                    <p>You're resuming from where you left off. Answer this question to dismiss this notice.</p>
                </div>
            </div>
        </div>

        <!-- Quiz Content -->
        <div v-if="!quizCompleted && showQuiz" class="quiz-content">
            <div class="question-card card">
                <h2>{{ currentQuestion.question }}</h2>
                <p class="question-category">{{ currentQuestion.category }}</p>

                <div class="options">
                    <BaseButton
                        v-for="option in currentQuestion.options"
                        :key="option.value"
                        variant="ghost"
                        class="option-btn"
                        :class="{ selected: selectedAnswer === option.value }"
                        @click="selectAnswer(option.value)"
                        type="button"
                    >
                        {{ option.label }}
                    </BaseButton>
                </div>

                <div class="quiz-actions">
                    <BaseButton
                        variant="outline"
                        :disabled="quizStore.currentQuestionIndex === 0"
                        @click="previousQuestion"
                    >
                        Previous
                    </BaseButton>
                    <BaseButton variant="primary" :disabled="!selectedAnswer" @click="nextQuestion">
                        {{ isLastQuestion ? 'Finish' : 'Next' }}
                    </BaseButton>
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
                    <BaseButton variant="primary" size="medium" @click="viewDashboard">
                        📊 View Your Dashboard
                    </BaseButton>
                </div>
            </div>
        </div>

        <BaseModal v-model:visible="showRestartConfirm" title="Restart Quiz?">
            <p>This will clear your current progress. Continue?</p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelRestart">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmRestart">Restart</BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model:visible="showDeleteConfirm" title="Delete All Data?">
            <p>All answers will be permanently removed. Are you sure?</p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelDelete">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
            </template>
        </BaseModal>

    </div>
</template>

<style scoped>
.quiz {
    max-width: 800px;
    margin: 0 auto;
    padding-top: 2rem;
}

.quiz-header {
    margin-bottom: 1.25rem;
}

.quiz-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.quiz-header h1 {
    color: var(--primary-color);
    margin: 0;
    font-size: 1.8rem;
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

@media (max-width: 640px) {
    .options {
        grid-template-columns: 1fr;
    }
}

.header-buttons .base-button {
    white-space: nowrap;
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
