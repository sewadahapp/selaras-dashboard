<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3'
import { initialDocument } from '~/data/document'

useHead({ title: 'Editor · Selaras Dashboard' })
const title = ref('Welcome to your workspace')
const content = ref<JSONContent>(structuredClone(initialDocument))
const words = ref(0)
const loaded = ref(false)
const savedSnapshot = ref('')
const savedAt = ref('')
const { notice } = useDashboard()
const toast = useToast()
const snapshot = computed(() =>
  JSON.stringify({ title: title.value, content: content.value }),
)
const dirty = computed(
  () => loaded.value && savedSnapshot.value !== snapshot.value,
)
const draftStatus = computed(() =>
  dirty.value
    ? 'Unsaved changes'
    : savedAt.value
      ? `Saved at ${savedAt.value}`
      : 'Ready to write',
)
const titleError = ref('')

onMounted(() => {
  try {
    const raw = localStorage.getItem('selaras-dashboard:document:v1')
    if (raw) {
      const saved = JSON.parse(raw)
      if (
        typeof saved?.title !== 'string' ||
        saved?.content?.type !== 'doc' ||
        !Array.isArray(saved.content.content)
      )
        throw new Error('Invalid document')
      title.value = saved.title
      content.value = saved.content
    }
  } catch {
    notice.value =
      'Your saved draft could not be loaded. Showing the welcome document.'
  }
  savedSnapshot.value = snapshot.value
  loaded.value = true
  window.addEventListener('beforeunload', onUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', onUnload))
function onUnload(event: BeforeUnloadEvent) {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

function save() {
  titleError.value = title.value.trim() ? '' : 'Give your draft a title.'
  if (titleError.value) return
  try {
    localStorage.setItem('selaras-dashboard:document:v1', snapshot.value)
    notice.value = ''
    savedSnapshot.value = snapshot.value
    savedAt.value = new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())
    toast.add({ title: 'Draft saved in this browser.', color: 'success' })
  } catch {
    notice.value =
      'Browser storage is unavailable. Export your document to keep a copy.'
  }
}
function exportDocument() {
  const url = URL.createObjectURL(
    new Blob(
      [JSON.stringify({ title: title.value, content: content.value }, null, 2)],
      { type: 'application/json' },
    ),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'document.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  toast.add({ title: 'Document exported as Tiptap JSON.', color: 'success' })
}
const leaveOpen = ref(false)
let resumeNavigation: ((value: boolean) => void) | undefined
onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  leaveOpen.value = true
  return new Promise<boolean>((resolve) => {
    resumeNavigation = resolve
  })
})
watch(leaveOpen, (value) => {
  if (!value && resumeNavigation) {
    resumeNavigation(false)
    resumeNavigation = undefined
  }
})
function discardAndLeave() {
  const resume = resumeNavigation
  resumeNavigation = undefined
  leaveOpen.value = false
  resume?.(true)
}
</script>

<template>
  <div>
    <PageHeading
      eyebrow="PUT YOUR IDEAS INTO WORDS"
      title="Editor"
      description="A clear page, a few useful tools, and room to think."
    >
      <SButton
        color="neutral"
        variant="outline"
        icon="hugeicons:download-02"
        :disabled="!loaded"
        @click="exportDocument"
      >
        Export JSON
      </SButton>
      <SButton icon="hugeicons:floppy-disk" :disabled="!loaded" @click="save">
        Save draft
      </SButton>
    </PageHeading>
    <SCard :ui="{ body: 'p-0' }">
      <div class="px-[30px] pb-3 pt-6 max-[760px]:p-5">
        <SFormField label="Document title" :error="titleError">
          <SInput v-model="title" placeholder="Untitled document" />
        </SFormField>
      </div>
      <ClientOnly>
        <RichTextEditor
          v-if="loaded"
          v-model="content"
          :status="draftStatus"
          :initial-content="initialDocument"
          @word-count="words = $event"
        />
        <template #fallback>
          <div class="px-[30px] py-20 text-center text-[var(--selaras-resolved-text-muted)]" role="status">
            Preparing your writing space…
          </div>
        </template>
      </ClientOnly>
      <div class="flex justify-between gap-3 border-t border-[var(--selaras-resolved-border-default)] px-6 py-3.5 text-[11px] text-[var(--selaras-resolved-text-muted)] max-[760px]:flex-col max-[760px]:gap-[3px]">
        <span>{{ words }} {{ words === 1 ? 'word' : 'words' }}</span>
        <span>Tiptap editor · Drafts stay in this browser</span>
      </div>
    </SCard>
    <SModal
      v-model:open="leaveOpen"
      title="Leave without saving?"
      description="Your latest edits have not been saved in this browser."
    >
      <template #body>
        <p class="text-[var(--selaras-resolved-text-muted)]">
          Stay to save your draft, or leave and discard these changes.
        </p>
      </template>
      <template #footer>
        <div class="flex items-center justify-end gap-2.5">
          <SButton color="neutral" variant="outline" @click="leaveOpen = false">
            Keep writing
          </SButton>
          <SButton color="danger" @click="discardAndLeave">
            Discard and leave
          </SButton>
        </div>
      </template>
    </SModal>
  </div>
</template>
