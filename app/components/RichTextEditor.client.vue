<script setup lang="ts">
import type { Editor, JSONContent } from '@tiptap/vue-3'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Placeholder } from '@tiptap/extensions/placeholder'
import StarterKit from '@tiptap/starter-kit'

// Adapted from Selaras's Tiptap block, retaining the starter's JSON model.
// https://selarasui.my.id/blocks/editors/tiptap
const props = defineProps<{
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  initialContent?: JSONContent
  status: string
}>()
const model = defineModel<JSONContent>({ required: true })
const emit = defineEmits<{ wordCount: [count: number] }>()
const initialContent: JSONContent = JSON.parse(
  JSON.stringify(props.initialContent ?? model.value),
)
const previewReadonly = ref(false)
const readOnly = computed(
  () => !!(props.readonly || props.disabled || previewReadonly.value),
)
const activeFormats = ref<string[]>([])
const heading = ref(false)
const bulletList = ref(false)
const linkActive = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)
const ready = ref(false)
const html = ref('')
const linkOpen = ref(false)
const linkUrl = ref('')
const linkError = ref('')
const linkSelection = ref<{ from: number; to: number }>()
const formats = [
  { value: 'bold', label: 'Bold', icon: 'hugeicons:text-bold' },
  { value: 'italic', label: 'Italic', icon: 'hugeicons:text-italic' },
  { value: 'underline', label: 'Underline', icon: 'hugeicons:text-underline' },
]

const editor = useEditor({
  content: model.value,
  editable: !readOnly.value,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      placeholder: props.placeholder ?? 'Write a project note…',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'rich-text-surface',
      role: 'textbox',
      'aria-label': 'Document content',
      'aria-multiline': 'true',
      'aria-readonly': String(readOnly.value),
    },
  },
  onCreate: ({ editor }) => {
    ready.value = true
    sync(editor)
    updateOutput(editor)
  },
  onTransaction: ({ editor }) => sync(editor),
  onUpdate: ({ editor }) => {
    model.value = editor.getJSON()
    updateOutput(editor)
  },
})

function sync(current: Pick<Editor, 'isActive' | 'can'>) {
  activeFormats.value = formats
    .filter((format) => current.isActive(format.value))
    .map((format) => format.value)
  heading.value = current.isActive('heading', { level: 2 })
  bulletList.value = current.isActive('bulletList')
  linkActive.value = current.isActive('link')
  canUndo.value = current.can().undo()
  canRedo.value = current.can().redo()
}

function updateOutput(
  current: Pick<Editor, 'isEmpty' | 'getHTML' | 'getText'>,
) {
  html.value = current.isEmpty ? '' : current.getHTML()
  const text = current.getText().trim()
  emit('wordCount', text ? text.split(/\s+/).length : 0)
}

function changeFormats(value: string | string[]) {
  if (readOnly.value || !ready.value || !Array.isArray(value)) return
  const format = formats.find(
    (format) =>
      value.includes(format.value) !==
      activeFormats.value.includes(format.value),
  )
  if (format?.value === 'bold') editor.value?.chain().focus().toggleBold().run()
  if (format?.value === 'italic')
    editor.value?.chain().focus().toggleItalic().run()
  if (format?.value === 'underline')
    editor.value?.chain().focus().toggleUnderline().run()
}

function toggleHeading() {
  if (!readOnly.value)
    editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
}
function toggleList() {
  if (!readOnly.value) editor.value?.chain().focus().toggleBulletList().run()
}
function undo() {
  if (!readOnly.value) editor.value?.chain().focus().undo().run()
}
function redo() {
  if (!readOnly.value) editor.value?.chain().focus().redo().run()
}
function reset() {
  if (!readOnly.value) editor.value?.commands.setContent(initialContent)
}

function openLink() {
  if (readOnly.value || !editor.value) return
  const { from, to } = editor.value.state.selection
  linkSelection.value = { from, to }
  linkUrl.value = editor.value.getAttributes('link').href ?? ''
  linkError.value = ''
  linkOpen.value = true
}
function applyLink(href: string) {
  if (readOnly.value || !editor.value) return
  const chain = editor.value.chain().focus()
  if (linkSelection.value) chain.setTextSelection(linkSelection.value)
  chain.extendMarkRange('link')
  if (href) chain.setLink({ href }).run()
  else chain.unsetLink().run()
}
function saveLink() {
  if (readOnly.value) return
  const href = linkUrl.value.trim()
  if (href && !/^(?:https?:\/\/|mailto:)/i.test(href)) {
    linkError.value = 'Use an https://, http://, or mailto: address.'
    return
  }
  applyLink(href)
  linkOpen.value = false
}
function removeLink() {
  if (readOnly.value) return
  applyLink('')
  linkOpen.value = false
}
function restoreEditorFocus() {
  if (!readOnly.value) editor.value?.commands.focus()
}

watch(model, (value) => {
  if (
    !editor.value ||
    JSON.stringify(editor.value.getJSON()) === JSON.stringify(value)
  )
    return
  editor.value.commands.setContent(value, { emitUpdate: false })
  sync(editor.value)
  updateOutput(editor.value)
})
watch(readOnly, (value) => {
  editor.value?.setEditable(!value)
  editor.value?.view.dom.setAttribute('aria-readonly', String(value))
})
</script>

<template>
  <section
    class="rich-text-editor"
    aria-label="Rich text editor"
    data-editor-engine="tiptap"
  >
    <div class="editor-controls">
      <div class="document-meta">
        <SBadge color="neutral" variant="soft">Draft</SBadge>
        <span class="text-[var(--selaras-resolved-text-muted)]" aria-live="polite">{{ status }}</span>
      </div>
      <div class="editor-control-actions">
        <SButton
          type="button"
          variant="outline"
          color="neutral"
          size="sm"
          :disabled="readOnly || !ready"
          @click="reset"
        >
          Reset content
        </SButton>
        <SSwitch
          :model-value="readOnly"
          :disabled="props.readonly || props.disabled"
          label="Read only"
          @update:model-value="previewReadonly = $event"
        />
      </div>
    </div>
    <div
      class="editor-frame"
      :aria-busy="!ready"
      :data-disabled="props.disabled || undefined"
    >
      <SToolbar
        aria-label="Text formatting"
        :disabled="readOnly || !ready"
        :ui="{ root: 'rounded-none border-0 border-y p-2' }"
      >
        <SToolbarToggleGroup
          :items="formats"
          type="multiple"
          icon-only
          :model-value="activeFormats"
          aria-label="Text style"
          @update:model-value="changeFormats"
          @mousedown.prevent
        />
        <SToolbarSeparator />
        <SToolbarButton
          icon="hugeicons:heading-02"
          aria-label="Heading"
          title="Heading"
          :pressed="heading"
          @mousedown.prevent
          @click="toggleHeading"
        />
        <SToolbarButton
          icon="hugeicons:list-view"
          aria-label="Bullet list"
          title="Bullet list"
          :pressed="bulletList"
          @mousedown.prevent
          @click="toggleList"
        />
        <SToolbarButton
          icon="hugeicons:link-01"
          aria-label="Edit link"
          title="Edit link"
          :pressed="linkActive"
          @mousedown.prevent
          @click="openLink"
        />
        <SToolbarSeparator />
        <SToolbarButton
          icon="hugeicons:undo"
          aria-label="Undo"
          title="Undo"
          :disabled="!canUndo"
          @mousedown.prevent
          @click="undo"
        />
        <SToolbarButton
          icon="hugeicons:redo"
          aria-label="Redo"
          title="Redo"
          :disabled="!canRedo"
          @mousedown.prevent
          @click="redo"
        />
      </SToolbar>
      <div class="editor-content-area">
        <EditorContent :editor="editor" />
        <p v-if="!ready" class="editor-loading" role="status">
          Loading editor…
        </p>
      </div>
    </div>
    <details class="editor-output">
      <summary>View HTML output</summary>
      <pre>{{ html }}</pre>
    </details>
    <SModal
      v-model:open="linkOpen"
      title="Edit link"
      description="Add a destination for the selected text."
      @after-leave="restoreEditorFocus"
    >
      <template #body>
        <form class="flex flex-col gap-[22px]" @submit.prevent="saveLink">
          <SFormField label="Link address" :error="linkError || undefined">
            <SInput
              v-model="linkUrl"
              placeholder="https://example.com"
              autofocus
            />
          </SFormField>
          <div class="flex items-center justify-end gap-2.5">
            <SButton
              type="button"
              variant="ghost"
              color="neutral"
              :disabled="readOnly"
              @click="removeLink"
            >
              Remove link
            </SButton>
            <SButton type="submit" :disabled="readOnly">Apply link</SButton>
          </div>
        </form>
      </template>
    </SModal>
  </section>
</template>

<style scoped>
.editor-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding: 0 30px 16px;
}

.document-meta,
.editor-control-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-control-actions {
  gap: 16px;
}

.editor-frame[data-disabled] {
  opacity: 0.5;
}

.editor-frame:focus-within {
  outline: 2px solid var(--selaras-resolved-color-primary-focus);
  outline-offset: -2px;
}

.editor-content-area {
  position: relative;
  min-height: 450px;
}

.editor-content-area > .editor-loading {
  position: absolute;
  inset: 0;
}

.editor-output {
  border-top: 1px solid var(--selaras-resolved-border-default);
  padding: 16px 24px;
  font-size: 12px;
}

.editor-output summary {
  cursor: pointer;
  color: var(--selaras-resolved-text-muted);
}

.editor-output pre {
  max-height: 200px;
  overflow: auto;
  margin-top: 12px;
  padding: 16px;
  border-radius: var(--selaras-resolved-radius-md);
  background: var(--selaras-resolved-surface-elevated);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

:deep(.rich-text-surface) {
  position: relative;
  min-height: 450px;
  padding: 38px 50px;
  outline: none;
  font-size: 15px;
  line-height: 1.8;
  overflow-wrap: anywhere;
  caret-color: var(--selaras-resolved-color-primary-text);
}

:deep(.rich-text-surface ::selection) {
  background: var(--selaras-resolved-color-primary-subtle);
  color: var(--selaras-resolved-color-primary-on-subtle);
}

:deep(.rich-text-surface p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: var(--selaras-resolved-text-muted);
  pointer-events: none;
}

:deep(.rich-text-surface h1) {
  margin-block: 0 24px;
  font-size: 30px;
}

:deep(.rich-text-surface h2) {
  margin-block: 24px 12px;
  font-size: 22px;
}

:deep(.rich-text-surface h3) {
  margin-block: 20px 10px;
  font-size: 18px;
}

:deep(.rich-text-surface p) {
  margin-block: 14px;
}

:deep(.rich-text-surface ul),
:deep(.rich-text-surface ol) {
  padding-left: 24px;
}

:deep(.rich-text-surface ul) {
  list-style: disc;
}

:deep(.rich-text-surface ol) {
  list-style: decimal;
}

:deep(.rich-text-surface blockquote) {
  margin-block: 24px;
  padding-left: 20px;
  border-left: 3px solid var(--selaras-resolved-color-primary-indicator);
  color: var(--selaras-resolved-text-muted);
}

:deep(.rich-text-surface pre) {
  overflow: auto;
  padding: 18px;
  border: 1px solid var(--selaras-resolved-border-default);
  border-radius: 8px;
  background: var(--selaras-resolved-surface-elevated);
}

:deep(.rich-text-surface code) {
  padding: 2px 4px;
  border-radius: 4px;
  background: var(--selaras-resolved-surface-elevated);
  font-size: 0.88em;
}

:deep(.rich-text-surface a) {
  color: var(--selaras-resolved-color-primary-fill);
  text-decoration: underline;
}

:deep(.rich-text-surface strong) {
  font-weight: 700;
}

.editor-loading {
  padding: 80px 30px;
  color: var(--selaras-resolved-text-muted);
  text-align: center;
}

@media (max-width: 760px) {
  .editor-controls {
    padding: 0 20px 16px;
  }

  .editor-control-actions {
    flex-wrap: wrap;
    gap: 10px 12px;
  }

  :deep(.rich-text-surface) {
    padding: 24px;
  }
}
</style>
