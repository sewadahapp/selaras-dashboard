<script setup lang="ts">
const { storageProblem, notice, retryStorage, reset } = useDashboard()
const resetOpen = ref(false)
</script>

<template>
  <div v-if="storageProblem || notice" class="mb-6 flex flex-col gap-3">
    <SAlert
      v-if="storageProblem"
      role="alert"
      color="warning"
      title="Browser storage needs attention"
      :ui="{ actions: 'flex-wrap' }"
      :description="
        storageProblem === 'load'
          ? 'Saved workspace data could not be loaded. Changes stay in this session until you retry loading or reset the saved demo data.'
          : 'Your latest changes could not be saved. They are available in this session; retry saving before leaving.'
      "
    >
      <template #actions>
        <SButton
          size="sm"
          color="neutral"
          variant="outline"
          @click="retryStorage"
        >
          {{ storageProblem === 'load' ? 'Retry loading' : 'Retry saving' }}
        </SButton>
        <SButton
          v-if="storageProblem === 'load'"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="resetOpen = true"
        >
          Reset saved demo
        </SButton>
      </template>
    </SAlert>
    <SAlert
      v-if="notice"
      role="alert"
      color="warning"
      title="Please check your changes"
      :description="notice"
      closable
      @close="notice = ''"
    />
    <SAlertDialog
      v-model:open="resetOpen"
      title="Reset saved demo data?"
      description="Replace saved customers, members, and workspace preferences with the demo defaults. Your editor document is kept. This cannot be undone."
      action-label="Reset saved demo"
      action-color="danger"
      @confirm="reset"
    />
  </div>
</template>
