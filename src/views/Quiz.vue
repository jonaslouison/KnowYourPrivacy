<template>
    <div class="quiz container">
        <div class="quiz-header">
            <h1>Privacy Quiz</h1>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="progress-text">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
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
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'

const router = useRouter()
const quizStore = useQuizStore()

const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const quizCompleted = ref(false)

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

const selectAnswer = (value) => {
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
}

.quiz-header h1 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
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
</style>
