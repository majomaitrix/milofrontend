<template>
  <div class="notifications-container">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'
import Notification from '@/components/Notification.vue'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.notifications-container > * {
  pointer-events: auto;
}
</style>

