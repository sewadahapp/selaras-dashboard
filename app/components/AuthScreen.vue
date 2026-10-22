<script setup lang="ts">
import {
  validateAuth,
  type AuthErrors,
  type AuthMode,
} from '#shared/utils/auth'

const props = defineProps<{ mode: AuthMode }>()
const draft = reactive({ name: '', email: '', password: '' })
const errors = ref<AuthErrors>({})
const passwordVisible = ref(false)
const sent = ref(false)
const toast = useToast()
const title = computed(
  () =>
    ({
      login: 'Welcome back.',
      register: 'Make room for good work.',
      'forgot-password': 'A fresh start.',
    })[props.mode],
)
const description = computed(
  () =>
    ({
      login: 'A little focus. A little momentum. Pick up where you left off.',
      register: 'Your next chapter starts with a workspace of your own.',
      'forgot-password':
        'Enter your email to preview the password recovery flow.',
    })[props.mode],
)

async function submit() {
  errors.value = validateAuth(props.mode, draft)
  if (Object.keys(errors.value).length) return
  if (props.mode === 'forgot-password') {
    sent.value = true
    return
  }
  // Replace this UI-only demo transition with your authentication provider.
  // Credentials are never persisted or sent to a server by this template.
  toast.add({
    color: 'info',
    title:
      props.mode === 'register'
        ? 'Demo workspace opened. No account was created.'
        : 'Demo workspace opened. No authentication was performed.',
  })
  draft.password = ''
  await navigateTo('/')
}
</script>

<template>
  <div>
    <template v-if="sent">
      <span class="auth-confirm-icon"><SIcon name="hugeicons:mail-01" /></span>
      <h1>Check your inbox.</h1>
      <p class="text-[var(--selaras-resolved-text-muted)] auth-description">
        A real recovery flow would send instructions to
        <strong>{{ draft.email }}</strong>
        .
      </p>
      <div class="auth-demo-note" role="status">
        This is a demo. No email has been sent.
      </div>
      <NuxtLink to="/login" class="auth-inline-link">← Back to login</NuxtLink>
    </template>
    <template v-else>
      <p class="mb-2.5 text-[10px] font-semibold tracking-[1.6px] text-[var(--selaras-resolved-text-muted)]">YOUR WORKSPACE AWAITS</p>
      <h1>{{ title }}</h1>
      <p class="text-[var(--selaras-resolved-text-muted)] auth-description">{{ description }}</p>
      <form class="flex flex-col gap-[22px]" novalidate @submit.prevent="submit">
        <SFormField
          v-if="mode === 'register'"
          label="Full name"
          name="name"
          required
          :error="errors.name"
        >
          <SInput
            v-model="draft.name"
            placeholder="Your name"
            autocomplete="name"
          />
        </SFormField>
        <SFormField
          label="Email address"
          name="email"
          required
          :error="errors.email"
        >
          <SInput
            v-model="draft.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
          />
        </SFormField>
        <SFormField
          v-if="mode !== 'forgot-password'"
          label="Password"
          name="password"
          required
          :error="errors.password"
          :hint="mode === 'register' ? 'At least 8 characters.' : undefined"
        >
          <SInput
            v-model="draft.password"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="Enter your password"
            :autocomplete="
              mode === 'register' ? 'new-password' : 'current-password'
            "
          >
            <template #trailing>
              <SButton
                type="button"
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="
                  passwordVisible ? 'hugeicons:eye-off' : 'hugeicons:eye'
                "
                :aria-pressed="passwordVisible"
                :aria-label="
                  passwordVisible ? 'Hide password' : 'Show password'
                "
                @click="passwordVisible = !passwordVisible"
              />
            </template>
          </SInput>
        </SFormField>
        <NuxtLink
          v-if="mode === 'login'"
          class="auth-inline-link align-right"
          to="/forgot-password"
        >
          Forgot password?
        </NuxtLink>
        <SButton type="submit" block>
          {{
            mode === 'login'
              ? 'Sign in to demo'
              : mode === 'register'
                ? 'Create demo workspace'
                : 'Preview recovery'
          }}
        </SButton>
      </form>
      <div class="auth-demo-note">
        Demo screens. Use any valid email and an 8-character password. No
        credentials are stored and no account is created.
      </div>
      <p v-if="mode === 'login'" class="auth-switch">
        New around here?
        <NuxtLink to="/register">Create a workspace</NuxtLink>
      </p>
      <p v-else class="auth-switch">
        <NuxtLink to="/login">← Back to login</NuxtLink>
      </p>
    </template>
  </div>
</template>

<style scoped>
.auth-description {
  margin: 12px 0 32px;
  font-size: 13px;
}

.auth-inline-link {
  font-size: 12px;
  color: var(--selaras-resolved-color-primary-fill);
}

.align-right {
  text-align: right;
  margin-top: -10px;
}

.auth-switch {
  text-align: center;
  font-size: 12px;
  color: var(--selaras-resolved-text-muted);
  margin-top: 26px;
}

.auth-switch a {
  color: var(--selaras-resolved-color-primary-fill);
}

.auth-demo-note {
  border: 1px dashed var(--selaras-resolved-border-default);
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--selaras-resolved-text-muted);
  margin: 24px 0;
}

.auth-confirm-icon {
  font-size: 32px;
  color: var(--selaras-resolved-color-primary-fill);
  display: block;
  margin-bottom: 20px;
}
</style>
