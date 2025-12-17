<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'

type TierDefinition = {
    id: string
    label: string
    description?: string
}

type TierItem = {
    id: string
    label: string
}

const props = defineProps({
    tiers: {
        type: Array as PropType<TierDefinition[]>,
        required: true
    },
    items: {
        type: Array as PropType<TierItem[]>,
        required: true
    },
    assignments: {
        type: Object as PropType<Record<string, string[]>>,
        default: () => ({})
    },
    showAvailableZone: {
        type: Boolean as PropType<boolean>,
        default: () => true
    }
})

const emit = defineEmits<{
    (event: 'update:assignments', value: Record<string, string[]>): void
}>()


const normalizeAssignments = (value: Record<string, string[]> = {}): Record<string, string[]> => {
    return props.tiers.reduce((acc, tier) => {
        acc[tier.id] = value[tier.id] ? [...value[tier.id]] : []
        return acc
    }, {} as Record<string, string[]>)
}

const localAssignments = ref<Record<string, string[]>>(normalizeAssignments(props.assignments))

const watchAssignmentSource = () => {
    localAssignments.value = normalizeAssignments(props.assignments)
}

watch(
    () => props.assignments,
    watchAssignmentSource,
    { immediate: true, deep: true }
)

const assignedIds = computed(() => new Set(Object.values(localAssignments.value).flat()))

const availableItems = computed(() => props.items.filter((item) => !assignedIds.value.has(item.id)))

const dragOrigin = ref<{ tierId: string | null; index: number } | null>(null)
const previewSlot = ref<{ tierId: string | null; index: number } | null>(null)

const draggedItem = ref<string | null>(null)
const dragTarget = ref<string | null>(null)

const findItemLocation = (itemId: string): { tierId: string | null; index: number } => {
    for (const tierId of Object.keys(localAssignments.value)) {
        const index = localAssignments.value[tierId].indexOf(itemId)
        if (index > -1) {
            return { tierId, index }
        }
    }
    const availableIndex = availableItems.value.findIndex((item) => item.id === itemId)
    return { tierId: null, index: Math.max(0, availableIndex) }
}

const insertAt = (values: string[], value: string, index: number) => {
    const bounded = Math.min(Math.max(index, 0), values.length)
    const copy = [...values]
    copy.splice(bounded, 0, value)
    return copy
}

const buildZoneSequence = (tierId: string | null) => {
    const baseIds = tierId ? localAssignments.value[tierId] : availableItems.value.map((item) => item.id)
    const previewIndex = previewSlot.value?.tierId === tierId ? previewSlot.value.index : -1
    const entries: { type: 'item' | 'preview'; key: string; id?: string }[] = []
    for (let index = 0; index <= baseIds.length; index += 1) {
        if (index === previewIndex) {
            entries.push({ type: 'preview', key: `preview-${tierId ?? 'available'}-${index}` })
        }
        if (index < baseIds.length) {
            entries.push({ type: 'item', key: `${tierId ?? 'available'}-${baseIds[index]}`, id: baseIds[index] })
        }
    }
    return entries
}

const handleDragStart = (event: DragEvent, itemId: string) => {
    draggedItem.value = itemId
    const location = findItemLocation(itemId)
    dragOrigin.value = location
    previewSlot.value = location
    if (event.dataTransfer) {
        const target = event.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setDragImage(target, rect.width / 2, rect.height / 2)
    }
}

const handleDrop = (tierId: string | null) => {
    if (!draggedItem.value) return
    const next = normalizeAssignments(localAssignments.value)
    Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((value) => value !== draggedItem.value)
    })
    if (tierId) {
        const targetIndex = previewSlot.value?.tierId === tierId ? previewSlot.value.index : next[tierId].length
        next[tierId] = insertAt(next[tierId], draggedItem.value, targetIndex)
    }
    localAssignments.value = next
    emit('update:assignments', next)
    draggedItem.value = null
    dragTarget.value = null
    dragOrigin.value = null
    previewSlot.value = null
}

const handleZoneEnter = (tierId: string | null) => {
    if (draggedItem.value) {
        dragTarget.value = tierId
    }
}

const handleZoneLeave = (tierId: string | null) => {
    if (dragTarget.value === tierId) {
        dragTarget.value = null
    }
    if (draggedItem.value && dragOrigin.value) {
        previewSlot.value = dragOrigin.value
    }
}

const hasPreviewInZone = (tierId: string | null) => previewSlot.value?.tierId === tierId

const zoneItemCount = (tierId: string | null) =>
    tierId ? localAssignments.value[tierId].length : availableItems.value.length

const shouldShowPlaceholder = (tierId: string | null) => zoneItemCount(tierId) === 0 && !hasPreviewInZone(tierId)

const handleZoneDragOver = (tierId: string | null, event: DragEvent) => {
    if (!draggedItem.value) return
    handleZoneEnter(tierId)
    const target = event.currentTarget as HTMLElement
    const candidates = Array.from(target.querySelectorAll('.tier-item:not(.tier-preview-pill)')) as HTMLElement[]
    let index = candidates.length
    for (let i = 0; i < candidates.length; i += 1) {
        const rect = candidates[i].getBoundingClientRect()
        const center = rect.top + rect.height / 2
        if (event.clientY < center) {
            index = i
            break
        }
        if (event.clientY <= rect.bottom) {
            index = i + 1
            break
        }
    }
    previewSlot.value = { tierId, index }
}

const clearDraggedItem = () => {
    draggedItem.value = null
    dragTarget.value = null
    dragOrigin.value = null
    previewSlot.value = null
}

const getItemLabel = (itemId: string) => props.items.find((item) => item.id === itemId)?.label ?? itemId
const previewLabel = computed(() => (draggedItem.value ? getItemLabel(draggedItem.value) : ''))
</script>

<template>
    <div class="tierlist">
        <div v-if="props.showAvailableZone" class="available-zone">
            <div class="section-heading">
                <p class="label">Available Threats</p>
            </div>
            <div
                class="drop-zone"
                :class="{ preview: dragTarget === null }"
                @dragover.prevent="handleZoneDragOver(null, $event)"
                @drop="() => handleDrop(null)"
                @dragenter.prevent="handleZoneEnter(null)"
                @dragleave="handleZoneLeave(null)"
            >
                <template v-for="entry in buildZoneSequence(null)" :key="entry.key">
                    <div
                        v-if="entry.type === 'preview'"
                        class="tier-item tier-preview-pill"
                        aria-hidden="true"
                    >
                        {{ previewLabel }}
                    </div>
                    <div
                        v-else
                        class="tier-item"
                        :class="{ dragging: draggedItem === entry.id }"
                        draggable="true"
                        @dragstart="(event) => handleDragStart(event, entry.id!)"
                        @dragend="clearDraggedItem"
                    >
                        {{ getItemLabel(entry.id!) }}
                    </div>
                </template>
                <p v-if="shouldShowPlaceholder(null)" class="muted">Drop threats here</p>
            </div>
        </div>
        <div
            v-for="tier in props.tiers"
            :key="tier.id"
            class="tier-row"
        >
            <div class="tier-label-cell">
                <p class="tier-label">{{ tier.label }}</p>
            </div>
            <div class="tier-drop-cell">
                <div
                    class="drop-zone tier-zone"
                    :class="[tier.id, { preview: dragTarget === tier.id }]"
                    @dragover.prevent="handleZoneDragOver(tier.id, $event)"
                    @drop="() => handleDrop(tier.id)"
                    @dragenter.prevent="handleZoneEnter(tier.id)"
                    @dragleave="handleZoneLeave(tier.id)"
                >
                    <template v-for="entry in buildZoneSequence(tier.id)" :key="entry.key">
                        <div
                            v-if="entry.type === 'preview'"
                            class="tier-item tier-preview-pill"
                            aria-hidden="true"
                        >
                            {{ previewLabel }}
                        </div>
                        <div
                            v-else
                            class="tier-item"
                            :class="{ dragging: draggedItem === entry.id }"
                            draggable="true"
                            @dragstart="(event) => handleDragStart(event, entry.id!)"
                            @dragend="clearDraggedItem"
                        >
                            {{ getItemLabel(entry.id!) }}
                        </div>
                    </template>
                    <p v-if="shouldShowPlaceholder(tier.id)" class="muted">Drop threats here</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tierlist {
    display: flex;
    flex-direction: column;
    gap: 0;
    user-select: none;
}

.tier-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 0;
    align-items: stretch;
    padding: 0;
    border: none;
    background: transparent;
}

.tier-label-cell {
    align-self: center;
}

.tier-label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0;
}

.tier-drop-cell {
    width: 100%;
    padding: 0;
}

.available-zone {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--card-bg);
    padding: 1rem;
}


.section-heading {
    margin-bottom: 0.75rem;
}

.label {
    font-weight: 600;
    margin: 0;
}

.drop-zone {
    min-height: 80px;
    padding: 0.35rem 0.45rem;
    border: 1px dashed var(--border-color);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-content: flex-start;
    transition: border-color 0.2s ease, background 0.2s ease;
    user-select: none;
}

.tier-zone.high {
    border-color: rgba(239, 68, 68, 0.7);
    background: rgba(239, 68, 68, 0.12);
}

.tier-zone.medium {
    border-color: rgba(249, 115, 22, 0.8);
    background: rgba(249, 115, 22, 0.15);
}

.tier-zone.low {
    border-color: rgba(234, 179, 8, 0.8);
    background: rgba(234, 179, 8, 0.15);
}

.tier-zone.none {
    border-color: rgba(34, 197, 94, 0.8);
    background: rgba(34, 197, 94, 0.1);
}

.drop-zone.preview {
    border-color: var(--primary-color);
    background: rgba(59, 130, 246, 0.08);
}

.tier-item {
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    background: var(--primary-color);
    cursor: grab;
    user-select: none;
    font-size: 0.85rem;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.tier-item:active {
    cursor: grabbing;
}

.tier-item.tier-preview-pill {
    opacity: 0.55;
    pointer-events: none;
    transform: scale(1.02);
}

.tier-item.dragging {
    display: none;
}

.muted {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-family: inherit;
    font-weight: 400;
    letter-spacing: 0.04em;
    text-transform: none;
    line-height: 1.4;
}

@media (max-width: 640px) {
    .drop-zone {
        flex-direction: column;
        min-height: auto;
    }

    .tier-item {
        width: 100%;
    }
}
</style>
