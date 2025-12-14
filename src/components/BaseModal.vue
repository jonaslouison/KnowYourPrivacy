<template>
    <div v-if="visible" class="modal-overlay" @click="close">
        <div class="modal-card" @click.stop>
            <header v-if="hasHeader" class="modal-header">
                <slot name="header">
                    <h3 class="modal-title" v-if="title">{{ title }}</h3>
                </slot>
                <BaseButton
                    v-if="!hideCloseButton"
                    variant="ghost"
                    size="small"
                    type="button"
                    class="modal-close"
                    @click="close"
                >
                    ×
                </BaseButton>
            </header>
            <section class="modal-body">
                <slot />
            </section>
            <footer v-if="$slots.footer" class="modal-footer">
                <slot name="footer" />
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    title: String,
    hideCloseButton: Boolean
})

const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()

const close = () => emit('update:visible', false)

const slots = useSlots()
const hasHeader = computed(() => !!props.title || !!slots.header)
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-card {
    background: var(--card-bg);
    border-radius: calc(var(--border-radius) * 1.25);
    padding: calc(var(--spacing-lg) + 0.5rem);
    width: min(520px, 90vw);
    box-shadow: 0 25px 70px rgba(15, 23, 42, 0.3);
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
}

.modal-title {
    font-size: 1.5rem;
    margin: 0;
    color: var(--text-primary);
}

.modal-body {
    color: var(--text-secondary);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
}

.modal-close {
    padding: 0.4rem 0.6rem;
    border-radius: var(--border-radius-pill);
}
</style>
