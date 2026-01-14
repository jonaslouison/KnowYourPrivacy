<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]" @click="removeToast(toast.id)">
                <span class="toast-icon">{{ getIcon(toast.type) }}</span>
                <span class="toast-message">{{ toast.message }}</span>
                <span v-if="toast.count > 1" class="toast-counter">x{{ toast.count }}</span>
                <BaseButton variant="ghost" size="small" class="toast-close" @click.stop="removeToast(toast.id)">×</BaseButton>
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from './BaseButton.vue'
import { toastManager, Toast } from '../utils/toast'

const toasts = ref<Toast[]>([])

let unsubscribe: (() => void) | null = null

onMounted(() => {
    unsubscribe = toastManager.subscribe((newToasts) => {
        toasts.value = newToasts
    })
    toasts.value = toastManager.getToasts()
})

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe()
    }
})

const removeToast = (id: string) => {
    toastManager.remove(id)
}

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return '✓'
        case 'error': return '✕'
        case 'warning': return '⚠'
        case 'info': return 'ℹ'
        default: return 'ℹ'
    }
}
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    z-index: 1100;
}

.toast {
    background: var(--card-bg);
    color: var(--text-primary);
    border-radius: var(--border-radius);
    padding: var(--spacing-sm) var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 280px;
    max-width: min(360px, calc(100vw - var(--spacing-lg) * 2));
    box-shadow: var(--shadow);
    border-left: 4px solid transparent;
}

.toast-icon {
    font-size: 1.1rem;
}

.toast-message {
    flex: 1;
    line-height: 1.4;
    font-size: var(--font-size-base);
}

.toast-counter {
    background: rgba(15, 23, 42, 0.08);
    padding: 0 var(--spacing-xs);
    border-radius: var(--border-radius-pill);
    font-size: var(--font-size-small);
}

.toast-close {
    border: none;
    background: rgba(15, 23, 42, 0.05);
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1;
    padding: 0;
    min-width: 1.7rem;
    height: 1.7rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-pill);
}

.toast-close:hover {
    background: rgba(15, 23, 42, 0.12);
}

/* Mobile Toast Positioning */
@media (max-width: 768px) {
    .toast-container {
        top: 50%;
        left: 50%;
        right: auto;
        transform: translate(-50%, -50%);
        width: calc(100vw - 2rem);
        max-width: 360px;
        align-items: center;
    }

    .toast {
        width: 100%;
        min-width: unset;
        max-width: 100%;
    }
}

.toast-success {
    border-left-color: var(--success-color);
}

.toast-error {
    border-left-color: var(--danger-color);
}

.toast-warning {
    border-left-color: var(--warning-color);
}

.toast-info {
    border-left-color: var(--primary-color);
}

:global(.toast-enter-active),
:global(.toast-leave-active) {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

:global(.toast-enter-from),
:global(.toast-leave-to) {
    opacity: 0;
    transform: translateX(100%);
}
</style>

