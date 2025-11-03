import { ref } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (title: string, message: string, duration?: number) => {
    return addNotification({ title, message, type: 'success', duration })
  }

  const error = (title: string, message: string, duration?: number) => {
    return addNotification({ title, message, type: 'error', duration })
  }

  const warning = (title: string, message: string, duration?: number) => {
    return addNotification({ title, message, type: 'warning', duration })
  }

  const info = (title: string, message: string, duration?: number) => {
    return addNotification({ title, message, type: 'info', duration })
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll
  }
}

