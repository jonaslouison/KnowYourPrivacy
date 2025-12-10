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
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startQuiz = () => {
    router.push('/quiz')
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
</style>
