// Toast notification system
export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
}

class ToastManager {
    private toasts: Toast[] = []
    private listeners: Set<(toasts: Toast[]) => void> = new Set()

    show(message: string, type: Toast['type'] = 'info', duration: number = 3000): void {
        const id = Math.random().toString(36).substr(2, 9)
        const toast: Toast = { id, message, type }

        this.toasts.push(toast)
        this.notify()

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id)
            }, duration)
        }
    }

    remove(id: string): void {
        this.toasts = this.toasts.filter(t => t.id !== id)
        this.notify()
    }

    subscribe(callback: (toasts: Toast[]) => void): () => void {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

    private notify(): void {
        this.listeners.forEach(callback => callback([...this.toasts]))
    }

    getToasts(): Toast[] {
        return [...this.toasts]
    }
}

export const toastManager = new ToastManager()

export function showToast(message: string, type: Toast['type'] = 'info', duration?: number): void {
    toastManager.show(message, type, duration)
}
