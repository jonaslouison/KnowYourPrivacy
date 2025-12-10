<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]"
                @click="removeToast(toast.id)">
                <span class="toast-icon">{{ getIcon(toast.type) }}</span>
                <span class="toast-message">{{ toast.message }}</span>
                <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
    top: 80px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    min-width: 300px;
    background: white;
}

.toast-icon {
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
}

.toast-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    padding: 0;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

.toast-close:hover {
    opacity: 1;
}

.toast-success {
    background: #d1fae5;
    color: #065f46;
    border-left: 4px solid #10b981;
}

.toast-error {
    background: #fee2e2;
    color: #991b1b;
    border-left: 4px solid #ef4444;
}

.toast-warning {
    background: #fef3c7;
    color: #92400e;
    border-left: 4px solid #f59e0b;
}

.toast-info {
    background: #dbeafe;
    color: #1e40af;
    border-left: 4px solid #3b82f6;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>
