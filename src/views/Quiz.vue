<template>
    <div class="quiz container">
        <div class="quiz-header">
            <h1>Privacy Quiz</h1>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="progress-text">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
            <button class="btn btn-danger btn-small" @click="showDeleteConfirm = true" title="Delete All Data">
                🗑️ Delete All Data
            </button>
        </div>

        <div v-if="!quizCompleted" class="quiz-content">
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
                    <button class="btn btn-outline" @click="previousQuestion" :disabled="currentQuestionIndex === 0">
                        Previous
                    </button>
                    <button class="btn btn-primary" @click="nextQuestion" :disabled="!selectedAnswer">
                        {{ isLastQuestion ? 'Finish' : 'Next' }}
                    </button>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'

const router = useRouter()
const quizStore = useQuizStore()

const currentQuestionIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const quizCompleted = ref(false)
const showDeleteConfirm = ref(false)

const questions = quizStore.questions

const currentQuestion = computed(() => questions[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.length - 1)
const progressPercentage = computed(() => ((currentQuestionIndex.value + 1) / questions.length) * 100)

// Load existing answer if available
const loadExistingAnswer = () => {
    const existingAnswer = quizStore.getAnswer(currentQuestion.value.id)
    selectedAnswer.value = existingAnswer || null
}

loadExistingAnswer()

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
        router.push('/dashboard')
    } else {
        currentQuestionIndex.value++
        loadExistingAnswer()
    }
}

const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
        loadExistingAnswer()
    }
}

const confirmDelete = () => {
    quizStore.resetQuiz()
    showDeleteConfirm.value = false
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

.btn-small {
    position: absolute;
    top: 0;
    right: 0;
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
}

.quiz-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    color: var(--danger-color);
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.modal-content p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    line-height: 1.6;
}

.modal-content p strong {
    color: var(--text-primary);
}

.modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
}
</style>
