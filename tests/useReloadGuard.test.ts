import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useQuizStore } from '../src/stores/quiz'
import { beforeUnloadHandler, resetReloadGuardContext, useReloadGuard } from '../src/composables/useReloadGuard'

describe('useReloadGuard', () => {
    let quizStore: ReturnType<typeof useQuizStore>

    beforeEach(() => {
        setActivePinia(createPinia())
        resetReloadGuardContext()
        quizStore = useQuizStore()
        quizStore.answers = []
        quizStore.isLoadedFromFile = false
    })

    it('does not open the modal when there are no answers to save', () => {
        const guard = useReloadGuard()
        guard.openReloadConfirm()
        expect(guard.showReloadConfirm.value).toBe(false)
    })

    it('opens the modal when there is unsaved progress', () => {
        quizStore.answers = [{ questionId: 'device-selection', answer: 'pc' }]
        const guard = useReloadGuard()
        guard.openReloadConfirm()
        expect(guard.showReloadConfirm.value).toBe(true)
    })

    it('still warns when data was loaded from file', () => {
        quizStore.answers = [{ questionId: 'device-selection', answer: 'pc' }]
        quizStore.isLoadedFromFile = true
        const guard = useReloadGuard()
        guard.openReloadConfirm()
        expect(guard.showReloadConfirm.value).toBe(true)
    })

    it('prevents navigation when beforeunload fires with unsaved answers', () => {
        quizStore.answers = [{ questionId: 'device-selection', answer: 'phone' }]
        quizStore.isLoadedFromFile = false
        const guard = useReloadGuard()
        const event = {
            preventDefault: vi.fn()
        } as unknown as BeforeUnloadEvent

        beforeUnloadHandler(event)

        expect(guard.showReloadConfirm.value).toBe(true)
        expect(event.preventDefault).toHaveBeenCalled()
    })
})
