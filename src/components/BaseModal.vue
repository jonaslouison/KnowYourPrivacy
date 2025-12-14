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
