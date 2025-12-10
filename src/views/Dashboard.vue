<template>
    <div class="dashboard container">
        <div v-if="!hasAnswers" class="empty-state card">
            <h2>No Quiz Data</h2>
            <p>You haven't completed the quiz yet. Take the quiz to see your privacy dashboard.</p>
            <div class="action-buttons">
                <button class="btn btn-primary" @click="router.push('/quiz')">Start Quiz</button>
                <button class="btn btn-secondary" @click="loadDashboard">📥 Load Saved Data</button>
            </div>
        </div>

        <div v-else>
            <!-- Unsaved Data Warning Banner -->
            <div v-if="hasUnsavedChanges" class="warning-banner">
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <div class="warning-text">
                        <strong>Unsaved Data</strong>
                        <p>Your quiz results haven't been exported yet. Export them to save your progress!</p>
                    </div>
                    <button class="btn btn-primary btn-small" @click="exportData">
                        💾 Export Now
                    </button>
                </div>
            </div>

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
                        <button class="btn btn-danger" @click="showDeleteConfirm = true">
                            🗑️ Delete All Data
                        </button>
                    </div>
                </div>
            </section>
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

        <!-- Export Password Modal -->
        <div v-if="showExportModal" class="modal-overlay" @click="cancelExport">
            <div class="modal-content" @click.stop>
                <h3>🔐 Set Password</h3>
                <p>Choose a strong password to encrypt your data:</p>
                <input
                    v-model="passwordInput"
                    type="password"
                    class="password-input"
                    placeholder="Enter password"
                    @keyup.enter="submitExport"
                    ref="exportPasswordInputRef"
                />
                <p class="hint">Remember this password - you'll need it to load your data later!</p>
                <div class="modal-buttons">
                    <button class="btn btn-outline" @click="cancelExport">Cancel</button>
                    <button class="btn btn-primary" @click="submitExport" :disabled="!passwordInput">Encrypt & Export</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'

const router = useRouter()
const quizStore = useQuizStore()
const showDeleteConfirm = ref(false)
const showPasswordModal = ref(false)
const showExportModal = ref(false)
const passwordInput = ref('')
const passwordInputRef = ref<HTMLInputElement | null>(null)
const exportPasswordInputRef = ref<HTMLInputElement | null>(null)
const lastExportTime = ref<number | null>(null)
let pendingFile: File | null = null
let isLoadAction = false

const hasAnswers = computed(() => quizStore.answers.length > 0)
const privacyScore = computed(() => quizStore.calculatePrivacyScore())
const threatModel = computed(() => quizStore.getThreatModel())
const appCategories = computed(() => quizStore.getAppCategories())
const hasUnsavedChanges = computed(() => hasAnswers.value && lastExportTime.value === null)

const scoreDescription = computed(() => {
    const score = privacyScore.value
    if (score >= 80) return 'Excellent! You have strong privacy practices.'
    if (score >= 60) return 'Good! There\'s room for improvement.'
    if (score >= 40) return 'Fair. Consider implementing more privacy tools.'
    return 'Needs attention. Many improvements can be made.'
})

const loadDashboard = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        pendingFile = file
        isLoadAction = true
        passwordInput.value = ''
        showPasswordModal.value = true
        nextTick(() => {
            passwordInputRef.value?.focus()
        })
    }

    fileInput.click()
}

const exportData = () => {
    passwordInput.value = ''
    showExportModal.value = true
    nextTick(() => {
        exportPasswordInputRef.value?.focus()
    })
}

const submitExport = async () => {
    if (!passwordInput.value) return

    try {
        await quizStore.exportEncryptedData(passwordInput.value)
        lastExportTime.value = Date.now()
        showExportModal.value = false
        showToast('Data exported successfully!', 'success')
    } catch (error) {
        const err = error as Error
        showToast('Error exporting data: ' + err.message, 'error')
    } finally {
        passwordInput.value = ''
    }
}

const cancelExport = () => {
    showExportModal.value = false
    passwordInput.value = ''
}

const importData = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        pendingFile = file
        isLoadAction = false
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
        const message = isLoadAction ? 'Data loaded successfully!' : 'Data imported successfully!'
        showToast(message, 'success')
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

const resetData = () => {
    showDeleteConfirm.value = true
}

const confirmDelete = () => {
    quizStore.resetQuiz()
    showDeleteConfirm.value = false
    showToast('All data deleted successfully', 'success')
    router.push('/quiz')
}

const cancelDelete = () => {
    showDeleteConfirm.value = false
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

.warning-banner {
    background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
    border: 2px solid #ffc107;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.15);
}

.warning-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.warning-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.warning-text {
    flex: 1;
}

.warning-text strong {
    display: block;
    color: #856404;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
}

.warning-text p {
    color: #856404;
    margin: 0;
    font-size: 0.95rem;
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

.hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-style: italic;
    margin-top: -1rem;
    margin-bottom: 1rem;
}
</style>
