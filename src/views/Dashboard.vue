<template>
    <div class="dashboard container">
        <div v-if="!hasAnswers" class="empty-state card">
            <h2>No Quiz Data</h2>
            <p>You haven't completed the quiz yet. Take the quiz to see your privacy dashboard.</p>
            <button class="btn btn-primary" @click="router.push('/quiz')">Start Quiz</button>
        </div>

        <div v-else>
            <section class="score-section">
                <div class="score-card card">
                    <h1>Your Privacy Score</h1>
                    <div class="score-circle">
                        <div class="score-value">{{ privacyScore }}</div>
                        <div class="score-label">/ 100</div>
                    </div>
                    <p class="score-description">{{ scoreDescription }}</p>
                </div>
            </section>

            <section class="threat-model-section">
                <div class="card">
                    <h2>Your Threat Model</h2>
                    <div class="threat-chips">
                        <span v-for="threat in threatModel" :key="threat" class="chip">
                            {{ threat }}
                        </span>
                    </div>
                </div>
            </section>

            <section class="apps-section">
                <h2>Your Apps</h2>
                <div class="app-categories">
                    <div v-for="category in appCategories" :key="category.name" class="app-category card">
                        <div class="category-header">
                            <h3>{{ category.icon }} {{ category.name }}</h3>
                            <span class="category-score" :class="category.scoreClass">
                                {{ category.score }}
                            </span>
                        </div>
                        <p class="current-app">Currently using: <strong>{{ category.currentApp }}</strong></p>
                        <div v-if="category.recommendations.length" class="recommendations">
                            <h4>Privacy-focused alternatives:</h4>
                            <ul>
                                <li v-for="rec in category.recommendations" :key="rec">
                                    {{ rec }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section class="actions-section">
                <div class="card">
                    <h2>Save Your Data</h2>
                    <p>Export your encrypted quiz results to keep track of your privacy journey.</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" @click="exportData">
                            💾 Export Encrypted Data
                        </button>
                        <button class="btn btn-outline" @click="importData">
                            📥 Import Data
                        </button>
                        <button class="btn btn-outline" @click="resetData">
                            🔄 Retake Quiz
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'

const router = useRouter()
const quizStore = useQuizStore()

const hasAnswers = computed(() => quizStore.answers.length > 0)
const privacyScore = computed(() => quizStore.calculatePrivacyScore())
const threatModel = computed(() => quizStore.getThreatModel())
const appCategories = computed(() => quizStore.getAppCategories())

const scoreDescription = computed(() => {
    const score = privacyScore.value
    if (score >= 80) return 'Excellent! You have strong privacy practices.'
    if (score >= 60) return 'Good! There\'s room for improvement.'
    if (score >= 40) return 'Fair. Consider implementing more privacy tools.'
    return 'Needs attention. Many improvements can be made.'
})

const exportData = async () => {
    const password = prompt('Enter a password to encrypt your data:')
    if (!password) return

    try {
        await quizStore.exportEncryptedData(password)
        alert('Data exported successfully!')
    } catch (error) {
        alert('Error exporting data: ' + error.message)
    }
}

const importData = async () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const password = prompt('Enter your password to decrypt:')
        if (!password) return

        try {
            await quizStore.importEncryptedData(file, password)
            alert('Data imported successfully!')
        } catch (error) {
            alert('Error importing data: ' + error.message)
        }
    }

    fileInput.click()
}

const resetData = () => {
    if (confirm('This will delete all your quiz data. Are you sure?')) {
        quizStore.resetQuiz()
        router.push('/quiz')
    }
}
</script>

<style scoped>
.dashboard {
    padding-top: 2rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
}

.empty-state h2 {
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.score-section {
    margin-bottom: 2rem;
}

.score-card {
    text-align: center;
    padding: 2.5rem;
}

.score-card h1 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

.score-circle {
    display: inline-flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0;
}

.score-value {
    font-size: 5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.score-label {
    font-size: 2rem;
    color: var(--text-secondary);
}

.score-description {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-top: 1rem;
}

.threat-model-section {
    margin-bottom: 2rem;
}

.threat-model-section h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.threat-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.chip {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.apps-section {
    margin-bottom: 2rem;
}

.apps-section>h2 {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

.app-categories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.app-category {
    padding: 1.5rem;
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.category-header h3 {
    color: var(--text-primary);
    font-size: 1.2rem;
}

.category-score {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
}

.category-score.good {
    background: #d1fae5;
    color: var(--success-color);
}

.category-score.medium {
    background: #fed7aa;
    color: var(--warning-color);
}

.category-score.poor {
    background: #fee2e2;
    color: var(--danger-color);
}

.current-app {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.recommendations h4 {
    font-size: 0.9rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.recommendations ul {
    list-style: none;
    padding-left: 0;
}

.recommendations li {
    padding: 0.5rem 0;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
}

.recommendations li:last-child {
    border-bottom: none;
}

.actions-section h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.actions-section p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}
</style>
