export type DeviceType = 'pc' | 'phone' | 'tablet'
export type DeviceSelectionId = 'desktop' | 'laptop' | 'phone' | 'tablet'

export interface DeviceSelectionOption {
    id: DeviceSelectionId
    label: string
    detail: string
    icon: string
}

export const DEVICE_SELECTION_OPTIONS: DeviceSelectionOption[] = [
    { id: 'desktop', label: 'Desktop PC', detail: 'Stationary workspace or home desktop', icon: '🖥️' },
    { id: 'laptop', label: 'Laptop', detail: 'Portable workstation for travel and meetings', icon: '💻' },
    { id: 'phone', label: 'Phone', detail: 'Primary smartphone and communication device', icon: '📱' },
    { id: 'tablet', label: 'Tablet', detail: 'Larger touchscreen companion devices', icon: '📲' }
]

export const DEVICE_SELECTION_MAP: Record<DeviceSelectionId, DeviceType> = {
    desktop: 'pc',
    laptop: 'pc',
    phone: 'phone',
    tablet: 'tablet'
}

export const DEVICE_FLOW_ORDER: DeviceType[] = ['pc', 'phone', 'tablet']

export const DEVICE_DISPLAY_NAMES: Record<DeviceType, string> = {
    pc: 'Desktop',
    phone: 'Phone',
    tablet: 'Tablet'
}
