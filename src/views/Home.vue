<template>
    <div class="home container">
        <section class="hero">
            <div class="hero-badge">🛡️ Privacy-First</div>
            <h1>Know Your Privacy</h1>
            <p class="subtitle">Discover how private your digital life really is</p>
            <div class="hero-buttons">
                <BaseButton variant="primary" class="btn-large" @click="goToQuiz">
                    {{ primaryCtaLabel }}
                </BaseButton>
                <BaseButton variant="secondary" class="btn-large" @click="loadDashboard">
                    📥 Load Saved Data
                </BaseButton>
            </div>
            <div class="hero-trust">
                <span class="trust-item">✓ No account required</span>
                <span class="trust-item">✓ 100% client-side</span>
                <span class="trust-item">✓ Open source</span>
            </div>
        </section>

        <section id="how-it-works" class="how-it-works">
            <h2 class="section-title">How It Works</h2>
            <div class="steps-timeline">
                <div class="step-row">
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-number">1</div>
                            <div class="step-text">
                                <h3>Take the Quiz</h3>
                                <p>Answer questions about your current apps, services, and what privacy threats concern you most.</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-screenshot">
                        <img src="../assets/screenshots/1_Quiz.png" alt="Quiz screenshot" />
                    </div>
                </div>

                <div class="step-row reverse">
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-number">2</div>
                            <div class="step-text">
                                <h3>Get Your Threat Model</h3>
                                <p>See your personalized threat model based on your priorities. Drag and drop to adjust importance levels.</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-screenshot">
                        <img src="../assets/screenshots/2_ThreatModel.png" alt="Threat model screenshot" />
                    </div>
                </div>

                <div class="step-row">
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-number">3</div>
                            <div class="step-text">
                                <h3>View Recommendations</h3>
                                <p>Discover privacy-focused alternatives tailored to your threat level. See what you're doing right and where to improve.</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-screenshot">
                        <img src="../assets/screenshots/3_Reccomendations.png" alt="Recommendations screenshot" />
                    </div>
                </div>

                <div class="step-row reverse">
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-number">4</div>
                            <div class="step-text">
                                <h3>Explore the Wiki</h3>
                                <p>Deep dive into privacy tools and services. Compare options and learn what makes them secure.</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-screenshot">
                        <img src="../assets/screenshots/4_Wikipage.png" alt="Wiki page screenshot" />
                    </div>
                </div>

                <div class="step-row">
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-number">5</div>
                            <div class="step-text">
                                <h3>Take Action</h3>
                                <p>Start improving your privacy step by step. Switch to recommended tools at your own pace. Every small change makes a difference.</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-screenshot">
                        <img src="../assets/screenshots/5_TakeAction.png" alt="Take action screenshot" />
                    </div>
                </div>
            </div>
        </section>

        <section id="philosophy" class="philosophy-section">
            <h2 class="section-title">Our Philosophy</h2>
            <div class="philosophy-content">
                <div class="philosophy-grid">
                    <div class="philosophy-item">
                        <div class="philosophy-icon">⚖️</div>
                        <h3>A Fundamental Right</h3>
                        <p>Privacy isn't a luxury or a privilege. It's a basic human right that everyone deserves, regardless of who you are or where you live.</p>
                    </div>
                    <div class="philosophy-item">
                        <div class="philosophy-icon">🌍</div>
                        <h3>Accessible to Everyone</h3>
                        <p>Privacy shouldn't require a computer science degree. Everyone deserves to understand and protect their digital life, regardless of technical background.</p>
                    </div>
                    <div class="philosophy-item">
                        <div class="philosophy-icon">🪜</div>
                        <h3>One Step at a Time</h3>
                        <p>Privacy is an incremental process. You don't need to change everything overnight. Start with one tool, one habit. Small changes compound into meaningful protection.</p>
                    </div>
                    <div class="philosophy-item">
                        <div class="philosophy-icon">🎁</div>
                        <h3>Free, Forever</h3>
                        <p>No premium tiers, no paywalls, no "pro" features. This tool is completely free because privacy shouldn't have a price tag.</p>
                    </div>
                    <div class="philosophy-item">
                        <div class="philosophy-icon">🔓</div>
                        <h3>Open Source</h3>
                        <p>Every line of code is public. Audit it, fork it, improve it. Transparency builds trust. There's nothing hidden, no catch, no ulterior motive.</p>
                    </div>
                    <div class="philosophy-item">
                        <div class="philosophy-icon">🔒</div>
                        <h3>Secure by Design</h3>
                        <p>Your data never touches our servers. Everything runs in your browser, encrypted with your password. No tracking, no analytics, no ads. We practice what we preach.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="faq" class="faq-section">
            <h2 class="section-title">Frequently Asked Questions</h2>
            <div class="faq-grid">
                <div class="faq-item card">
                    <h3>Is my data really private?</h3>
                    <p>Yes! All your quiz answers and results are stored only in your browser. When you export your data, it's encrypted with a password you choose. We never see or store your information on any server.</p>
                </div>

                <div class="faq-item card">
                    <h3>Do I need to create an account?</h3>
                    <p>No account required. You can take the quiz, view your results, and export your data without ever providing an email or creating an account.</p>
                </div>

                <div class="faq-item card">
                    <h3>What happens to my exported data?</h3>
                    <p>Your exported file is encrypted using AES-256-GCM encryption with your password. Only someone with your password can decrypt and read the file. The file is saved locally on your device.</p>
                </div>

                <div class="faq-item card">
                    <h3>How is my threat level calculated?</h3>
                    <p>Your threat level is computed based on how you prioritize different privacy concerns (like surveillance, data brokers, or government access). You can always manually adjust it on your dashboard.</p>
                </div>

                <div class="faq-item card">
                    <h3>Can I retake the quiz?</h3>
                    <p>Absolutely! You can restart the quiz at any time from the quiz page. Your previous answers will be cleared, but you can always load a previously exported file to restore your data.</p>
                </div>

                <div class="faq-item card">
                    <h3>Is this app open source?</h3>
                    <p>Yes! Know Your Privacy is fully open source. You can view, audit, and contribute to the code on our GitHub repository. Transparency is key to trust.</p>
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
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'
import { validateExportFile } from '../utils/crypto'

const router = useRouter()
const quizStore = useQuizStore()
const showPasswordModal = ref(false)
const fileName = ref('')
const passwordInput = ref('')
const passwordError = ref('')
const passwordInputRef = ref<{ focus: () => void } | null>(null)
let pendingFile: File | null = null

// Reset state when modal is closed (e.g., by clicking outside)
watch(showPasswordModal, (isVisible, wasVisible) => {
    if (wasVisible && !isVisible && pendingFile) {
        // Modal was closed without successful import
        pendingFile = null
        fileName.value = ''
        passwordInput.value = ''
        passwordError.value = ''
    }
})

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
    router.push('/quiz')
}

const loadDashboard = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.oncancel = () => {
    }

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
}

const loadDifferentFile = () => {
    cancelPasswordInput()
    loadDashboard()
}
</script>

<style scoped>
.home {
    padding-top: 2rem;
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 4rem 0 5rem;
    max-width: 800px;
    margin: 0 auto;
}

.hero-badge {
    display: inline-block;
    background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    letter-spacing: 0.5px;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 2.5rem;
}

.hero-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.btn-large {
    font-size: 1.1rem;
    padding: 1rem 2rem;
}

.hero-trust {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: color-mix(in srgb, var(--success-color) 15%, transparent);
    color: var(--success-color);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid color-mix(in srgb, var(--success-color) 30%, transparent);
}

/* Section Titles */
.section-title {
    font-size: 2.25rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

/* How It Works Section */
.how-it-works {
    margin: 5rem 0;
    scroll-margin-top: 100px;
}

.steps-timeline {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
}

/* Connecting line */
.steps-timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 60px;
    bottom: 60px;
    width: 3px;
    background: linear-gradient(180deg, var(--primary-color), #8b5cf6);
    transform: translateX(-50%);
    border-radius: 3px;
}

.step-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
    position: relative;
    z-index: 1;
}

.step-row.reverse {
    direction: rtl;
}

.step-row.reverse > * {
    direction: ltr;
}

.step-content {
    padding: 1.5rem;
}

.step-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.step-number {
    width: 50px;
    height: 50px;
    min-width: 50px;
    background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.step-text h3 {
    margin: 0 0 0.5rem;
    color: var(--text-primary);
    font-size: 1.25rem;
}

.step-text p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.6;
}

.step-screenshot {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    background: var(--card-bg);
}

.step-screenshot img {
    width: 100%;
    height: auto;
    display: block;
}

/* Philosophy Section */
.philosophy-section {
    margin: 5rem 0;
    scroll-margin-top: 100px;
}

.philosophy-content {
    max-width: 1000px;
    margin: 0 auto;
}

.philosophy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.philosophy-item {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.philosophy-item:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
}

.philosophy-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

.philosophy-item h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-size: 1.15rem;
}

.philosophy-item p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
    font-size: 0.95rem;
}

/* FAQ Section */
.faq-section {
    margin: 5rem 0;
    scroll-margin-top: 100px;
}

.faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.faq-item {
    text-align: left;
}

.faq-item h3 {
    color: var(--primary-color);
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
}

.faq-item p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
}

/* Modal Styles */

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
    background-color: var(--bg-color);
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

/* Responsive Design */
@media (max-width: 900px) {
    .hero h1 {
        font-size: 2.5rem;
    }

    .subtitle {
        font-size: 1.25rem;
    }

    .steps-timeline::before {
        display: none;
    }

    .step-row,
    .step-row.reverse {
        grid-template-columns: 1fr;
        direction: ltr;
    }

    .step-row.reverse > * {
        direction: ltr;
    }

    .step-screenshot {
        order: 2;
    }

    .step-content {
        order: 1;
    }
}

@media (max-width: 600px) {
    .hero h1 {
        font-size: 2rem;
    }

    .hero-buttons {
        flex-direction: column;
        align-items: stretch;
    }

    .hero-trust {
        flex-direction: column;
        gap: 0.5rem;
    }

    .section-title {
        font-size: 1.75rem;
    }

    .philosophy-grid {
        grid-template-columns: 1fr;
    }

    .faq-grid {
        grid-template-columns: 1fr;
    }
}
</style>
