import { defineStore } from "pinia";
import { quizQuestions, recommendations } from "../data/questions";
import {
    encryptData,
    decryptData,
    downloadEncryptedFile,
    readEncryptedFile,
} from "../utils/crypto";

export const useQuizStore = defineStore("quiz", {
    state: () => ({
        questions: quizQuestions,
        answers: [],
        isCompleted: false,
    }),

    getters: {
        /**
         * Get answer for a specific question
         */
        getAnswer: (state) => (questionId) => {
            const answer = state.answers.find((a) => a.questionId === questionId);
            return answer ? answer.answer : null;
        },

        /**
         * Calculate overall privacy score (0-100)
         */
        calculatePrivacyScore: (state) => () => {
            if (state.answers.length === 0) return 0;

            let totalScore = 0;
            let totalWeight = 0;

            state.answers.forEach((answer) => {
                const question = state.questions.find(
                    (q) => q.id === answer.questionId
                );
                if (question) {
                    const option = question.options.find(
                        (o) => o.value === answer.answer
                    );
                    if (option && option.score !== undefined) {
                        totalScore += option.score;
                        totalWeight += 100;
                    }
                }
            });

            return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
        },

        /**
         * Get user's threat model based on answers
         */
        getThreatModel: (state) => () => {
            const threats = [];

            state.answers.forEach((answer) => {
                const question = state.questions.find(
                    (q) => q.id === answer.questionId
                );
                if (question) {
                    const option = question.options.find(
                        (o) => o.value === answer.answer
                    );
                    if (option && option.threat && !threats.includes(option.threat)) {
                        threats.push(option.threat);
                    }
                }
            });

            return threats;
        },

        /**
         * Get app categories with current apps and recommendations
         */
        getAppCategories: (state) => () => {
            const categories = [];

            // Browser
            const browserDesktop = state.answers.find(
                (a) => a.questionId === "browser-desktop"
            );
            if (browserDesktop) {
                const question = state.questions.find(
                    (q) => q.id === "browser-desktop"
                );
                const option = question.options.find(
                    (o) => o.value === browserDesktop.answer
                );
                const score = option?.score || 0;

                categories.push({
                    name: "Web Browser (Desktop)",
                    icon: "🌐",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations:
                        recommendations["browser-desktop"]?.[browserDesktop.answer] || [],
                });
            }

            // Email
            const email = state.answers.find(
                (a) => a.questionId === "email-provider"
            );
            if (email) {
                const question = state.questions.find((q) => q.id === "email-provider");
                const option = question.options.find((o) => o.value === email.answer);
                const score = option?.score || 0;

                categories.push({
                    name: "Email Provider",
                    icon: "✉️",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations:
                        recommendations["email-provider"]?.[email.answer] || [],
                });
            }

            // Search Engine
            const search = state.answers.find(
                (a) => a.questionId === "search-engine"
            );
            if (search) {
                const question = state.questions.find((q) => q.id === "search-engine");
                const option = question.options.find((o) => o.value === search.answer);
                const score = option?.score || 0;

                categories.push({
                    name: "Search Engine",
                    icon: "🔍",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations:
                        recommendations["search-engine"]?.[search.answer] || [],
                });
            }

            // Messaging
            const messaging = state.answers.find(
                (a) => a.questionId === "messaging-app"
            );
            if (messaging) {
                const question = state.questions.find((q) => q.id === "messaging-app");
                const option = question.options.find(
                    (o) => o.value === messaging.answer
                );
                const score = option?.score || 0;

                categories.push({
                    name: "Messaging App",
                    icon: "💬",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations:
                        recommendations["messaging-app"]?.[messaging.answer] || [],
                });
            }

            // Cloud Storage
            const cloud = state.answers.find((a) => a.questionId === "cloud-storage");
            if (cloud) {
                const question = state.questions.find((q) => q.id === "cloud-storage");
                const option = question.options.find((o) => o.value === cloud.answer);
                const score = option?.score || 0;

                categories.push({
                    name: "Cloud Storage",
                    icon: "☁️",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations:
                        recommendations["cloud-storage"]?.[cloud.answer] || [],
                });
            }

            // Password Manager
            const password = state.answers.find(
                (a) => a.questionId === "password-manager"
            );
            if (password) {
                const question = state.questions.find(
                    (q) => q.id === "password-manager"
                );
                const option = question.options.find(
                    (o) => o.value === password.answer
                );
                const score = option?.score || 0;

                categories.push({
                    name: "Password Manager",
                    icon: "🔑",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations:
                        recommendations["password-manager"]?.[password.answer] || [],
                });
            }

            // VPN
            const vpn = state.answers.find((a) => a.questionId === "vpn-usage");
            if (vpn) {
                const question = state.questions.find((q) => q.id === "vpn-usage");
                const option = question.options.find((o) => o.value === vpn.answer);
                const score = option?.score || 0;

                categories.push({
                    name: "VPN Service",
                    icon: "🛡️",
                    currentApp: option?.label || "Unknown",
                    score:
                        score >= 80
                            ? "Excellent"
                            : score >= 60
                                ? "Good"
                                : "Needs Improvement",
                    scoreClass: score >= 80 ? "good" : score >= 60 ? "medium" : "poor",
                    recommendations: recommendations["vpn-usage"]?.[vpn.answer] || [],
                });
            }

            return categories;
        },
    },

    actions: {
        /**
         * Save an answer to a question
         */
        saveAnswer(payload) {
            const existingIndex = this.answers.findIndex(
                (a) => a.questionId === payload.questionId
            );

            if (existingIndex !== -1) {
                this.answers[existingIndex] = payload;
            } else {
                this.answers.push(payload);
            }
        },

        /**
         * Mark quiz as completed
         */
        completeQuiz() {
            this.isCompleted = true;
        },

        /**
         * Reset all quiz data
         */
        resetQuiz() {
            this.answers = [];
            this.isCompleted = false;
        },

        /**
         * Export encrypted data to file
         */
        async exportEncryptedData(password) {
            const data = {
                answers: this.answers,
                isCompleted: this.isCompleted,
                exportedAt: new Date().toISOString(),
            };

            const encryptedString = await encryptData(data, password);
            downloadEncryptedFile(encryptedString);
        },

        /**
         * Import encrypted data from file
         */
        async importEncryptedData(file, password) {
            const data = await readEncryptedFile(file, password);

            if (data.answers && Array.isArray(data.answers)) {
                this.answers = data.answers;
                this.isCompleted = data.isCompleted || false;
            } else {
                throw new Error("Invalid data format");
            }
        },
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: "knowyourprivacy",
                storage: localStorage,
            },
        ],
    },
});
