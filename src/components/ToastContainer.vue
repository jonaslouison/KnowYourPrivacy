<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]"
                @click="removeToast(toast.id)">
                <span class="toast-icon">{{ getIcon(toast.type) }}</span>
                <span class="toast-message">{{ toast.message }}</span>
                <span v-if="toast.count > 1" class="toast-counter">x{{ toast.count }}</span>
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

