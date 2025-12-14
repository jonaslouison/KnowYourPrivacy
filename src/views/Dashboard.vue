<template>
    <div class="dashboard container">
        <div v-if="!hasAnswers" class="empty-state card">
            <h2>No Quiz Data</h2>
            <p>You haven't started the quiz yet. Begin to see your privacy dashboard.</p>
            <div class="action-buttons">
                <BaseButton variant="primary" @click="router.push('/quiz')">Start Quiz</BaseButton>
                <BaseButton variant="secondary" @click="loadDashboard">📥 Load Saved Data</BaseButton>
            </div>
        </div>

        <div v-else-if="shouldContinueQuiz" class="continue-state card">
            <h2>Continue Your Quiz</h2>
            <p>You have unfinished answers. Resume to pick up where you left off.</p>
            <p class="progress-hint">Current position: Question {{ quizStore.currentQuestionIndex + 1 }} of {{ quizStore.questions.length }}</p>
            <div class="action-buttons">
                <BaseButton variant="primary" @click="router.push('/quiz')">➡️ Continue Quiz</BaseButton>
                <BaseButton variant="secondary" @click="loadDashboard">📥 Load a Different File</BaseButton>
            </div>
        </div>

        <div v-else>
            <!-- Unsaved Data Warning Banner -->
            <div v-if="hasUnsavedChanges && !quizStore.isLoadedFromFile" class="warning-banner">
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <div class="warning-text">
                        <strong>Unsaved Data</strong>
                        <p>Your quiz results haven't been exported yet. Export them to save your progress!</p>
                    </div>
                    <BaseButton variant="primary" size="small" @click="exportData">
                        💾 Export Now
                    </BaseButton>
                </div>
            </div>

            <!-- Saved File Success Banner -->
            <div v-if="quizStore.isLoadedFromFile" class="success-banner">
                <div class="success-content">
                    <span class="success-icon">✅</span>
                    <div class="success-text">
                        <strong>Your Quiz is currently saved in this file</strong>
                        <p>Your progress and results are securely stored.</p>
                    </div>
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
                        <BaseButton variant="primary" @click="exportData">
                            💾 Export Encrypted Data
                        </BaseButton>
                        <BaseButton variant="outline" @click="importData">
                            📥 Import Data
                        </BaseButton>
                        <BaseButton variant="outline" @click="resetData">
                            🔄 Retake Quiz
                        </BaseButton>
                        <BaseButton variant="danger" @click="showDeleteConfirm = true">
                            🗑️ Delete All Data
                        </BaseButton>
                    </div>
                </div>
            </section>
        </div>

        <BaseModal v-model:visible="showDeleteConfirm" title="⚠️ Delete All Data?" :hideCloseButton="true">
            <p>This will permanently delete all your quiz answers and results. This action cannot be undone.</p>
            <p><strong>Make sure you've exported your data if you want to keep it!</strong></p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelDelete">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmDelete">Delete Everything</BaseButton>
            </template>
        </BaseModal>

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

        <BaseModal v-model:visible="showExportModal" title="🔐 Set Password" :hideCloseButton="true">
            <p>Choose a strong password to encrypt your data:</p>
            <BaseInput
                v-model="passwordInput"
                type="password"
                class="password-input"
                :class="{ error: exportPasswordError }"
                @keyup.enter="submitExport"
                ref="exportPasswordInputRef"
            />
            <div v-if="exportPasswordError" class="error-message">
                ⚠️ {{ exportPasswordError }}
            </div>
            <p class="hint">Remember this password - you'll need it to load your data later!</p>
            <template #footer>
                <BaseButton variant="outline" size="small" @click="cancelExport">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="submitExport" :disabled="!passwordInput">Encrypt & Export</BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model:visible="showExportConfirmModal" title="🔐 Create Export Password" :hideCloseButton="true">
            <p>Create a strong password to encrypt your data:</p>
            <BaseInput
                v-model="passwordInput"
                type="password"
                class="password-input"
                :class="{ error: exportPasswordError }"
                placeholder="Enter password"
                @keyup.enter="submitExportConfirm"
                ref="exportPasswordInputRef"
            />
            <p class="confirm-hint">Re-enter your password to confirm:</p>
            <BaseInput
                v-model="confirmPassword"
                type="password"
                class="password-input"
                :class="{ error: exportPasswordError }"
                placeholder="Confirm password"
                @keyup.enter="submitExportConfirm"
            />
            <div v-if="exportPasswordError" class="error-message">
                ⚠️ {{ exportPasswordError }}
            </div>
            <p class="hint">Remember this password - you'll need it to load your data later!</p>
            <template #footer>
                <BaseButton variant="outline" size="small" @click="cancelExportConfirm">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="submitExportConfirm" :disabled="!passwordInput || !confirmPassword">Encrypt & Export</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'
import { validateExportFile } from '../utils/crypto'

const router = useRouter()
const quizStore = useQuizStore()
const showDeleteConfirm = ref(false)
const showPasswordModal = ref(false)
const showExportModal = ref(false)
const showExportConfirmModal = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const exportPasswordError = ref('')
const fileName = ref('')
const passwordInputRef = ref<{ focus: () => void } | null>(null)
const exportPasswordInputRef = ref<{ focus: () => void } | null>(null)
const confirmPassword = ref('')
const lastExportTime = ref<number | null>(null)
let pendingFile: File | null = null
let isLoadAction = false

const hasAnswers = computed(() => quizStore.answers.length > 0)
const isCompleted = computed(() => quizStore.isCompleted)
const shouldContinueQuiz = computed(() => hasAnswers.value && !isCompleted.value)
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

    fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) {
            showToast('File selection cancelled', 'warning')
            return
        }

        try {
            // Validate file format first
            await validateExportFile(file)
            pendingFile = file
            fileName.value = file.name
            isLoadAction = true
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

const exportData = () => {
    if (lastExportTime.value === null) {
        // First time export - ask for password confirmation
        passwordInput.value = ''
        confirmPassword.value = ''
        exportPasswordError.value = ''
        showExportConfirmModal.value = true
        nextTick(() => {
            exportPasswordInputRef.value?.focus()
        })
    } else {
        // Already exported before - just ask for password
        passwordInput.value = ''
        exportPasswordError.value = ''
        showExportModal.value = true
        nextTick(() => {
            exportPasswordInputRef.value?.focus()
        })
    }
}

const submitExport = async () => {
    if (!passwordInput.value) return

    try {
        const success = await quizStore.exportEncryptedData(passwordInput.value)
        if (!success) {
            exportPasswordError.value = 'Failed to export file. Please try again.'
            return
        }
        lastExportTime.value = Date.now()
        showExportModal.value = false
        showToast('Data exported successfully!', 'success')
        // Only clear on success
        passwordInput.value = ''
        exportPasswordError.value = ''
    } catch (error) {
        const err = error as Error
        exportPasswordError.value = err.message
        // Do NOT clear password, allow user to retry
    }
}

const cancelExport = () => {
    showExportModal.value = false
    passwordInput.value = ''
    exportPasswordError.value = ''
}

const submitExportConfirm = async () => {
    if (!passwordInput.value || !confirmPassword.value) return

    // Validate passwords match
    if (passwordInput.value !== confirmPassword.value) {
        exportPasswordError.value = 'Passwords do not match. Please try again.'
        return
    }

    try {
        const success = await quizStore.exportEncryptedData(passwordInput.value)
        if (!success) {
            exportPasswordError.value = 'Failed to export file. Please try again.'
            return
        }
        lastExportTime.value = Date.now()
        showExportConfirmModal.value = false
        showToast('Data exported successfully!', 'success')
        // Only clear on success
        passwordInput.value = ''
        confirmPassword.value = ''
        exportPasswordError.value = ''
    } catch (error) {
        const err = error as Error
        exportPasswordError.value = err.message
        // Do NOT clear passwords, allow user to retry
    }
}

const cancelExportConfirm = () => {
    showExportConfirmModal.value = false
    passwordInput.value = ''
    confirmPassword.value = ''
    exportPasswordError.value = ''
}

const importData = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) {
            showToast('File selection cancelled', 'warning')
            return
        }

        try {
            // Validate file format first
            await validateExportFile(file)
            pendingFile = file
            fileName.value = file.name
            isLoadAction = false
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
        const message = isLoadAction ? 'Data loaded successfully!' : 'Data imported successfully!'
        showToast(message, 'success')

        // Route based on completion state so unfinished quizzes resume where left off
        if (quizStore.isCompleted) {
            // Stay on dashboard (already here), but ensure data reflects loaded state
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
}

const loadDifferentFile = () => {
    if (isLoadAction) {
        cancelPasswordInput()
        loadDashboard()
    } else {
        cancelPasswordInput()
        importData()
    }
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

.continue-state {
    text-align: center;
    padding: 3rem;
    border: 2px dashed var(--primary-color);
    background: #f5f7ff;
    border-radius: 12px;
    margin-bottom: 2rem;
}

.continue-state h2 {
    color: var(--primary-color);
    margin-bottom: 0.75rem;
}

.progress-hint {
    color: var(--text-secondary);
    margin: 0.5rem 0 1.5rem;
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

.success-banner {
    background: linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%);
    border: 2px solid #28a745;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
}

.success-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.success-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.success-text {
    flex: 1;
}

.success-text strong {
    display: block;
    color: #155724;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
}

.success-text p {
    color: #155724;
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

.hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-style: italic;
    margin-top: -1rem;
    margin-bottom: 1rem;
}

.confirm-hint {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
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
}

.file-name p {
    color: var(--text-primary);
    font-weight: 600;
    margin: 0;
    word-break: break-word;
    flex: 1;
}

.file-name .change-file {
    white-space: nowrap;
    flex-shrink: 0;
}
</style>
