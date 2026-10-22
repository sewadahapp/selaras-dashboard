<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const isNotFound = computed(() => props.error.statusCode === 404)

useHead(() => ({
  title: isNotFound.value ? 'Page not found · Selaras Dashboard' : 'Something went wrong · Selaras Dashboard',
}))
</script>

<template>
  <SApp>
    <main class="flex min-h-dvh w-full flex-col justify-center px-5 py-12 sm:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <NuxtLink
          to="/"
          class="mb-8 inline-flex items-center gap-2.5 rounded-lg text-sm font-semibold tracking-tight text-[var(--selaras-resolved-text-default)] outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--selaras-resolved-color-primary-focus)] sm:mb-10"
          aria-label="Selaras Dashboard home"
          @click.prevent="clearError({ redirect: '/' })"
        >
          <span class="inline-flex size-8 items-center justify-center rounded-[10px] bg-[var(--selaras-resolved-color-primary-fill)] pb-0.5 pl-px text-xl font-bold leading-none tracking-[-2px] text-white">s.</span>
          <span>Selaras <span class="font-normal text-[var(--selaras-resolved-text-muted)]">Dashboard</span></span>
        </NuxtLink>

        <section class="grid overflow-hidden rounded-3xl border border-[var(--selaras-resolved-border-default)] bg-[var(--selaras-resolved-surface-elevated)] shadow-xl shadow-black/5 sm:grid-cols-2 md:min-h-[430px]">
          <div class="flex flex-col items-start justify-center px-7 py-10 sm:px-12 sm:py-14 lg:px-16">
            <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--selaras-resolved-border-default)] px-3 py-1 text-xs font-medium text-[var(--selaras-resolved-text-muted)]">
              <span class="size-1.5 rounded-full bg-[var(--selaras-resolved-color-primary-fill)]" aria-hidden="true" />
              {{ isNotFound ? '404 · PAGE NOT FOUND' : `${error.statusCode} · SOMETHING WENT WRONG` }}
            </p>

            <h1 class="max-w-lg text-3xl font-semibold tracking-[-0.045em] text-[var(--selaras-resolved-text-default)] sm:text-4xl lg:text-5xl">
              {{ isNotFound ? 'Looks like this page wandered off.' : 'We hit a little roadblock.' }}
            </h1>
            <p class="mt-4 max-w-md text-base leading-7 text-[var(--selaras-resolved-text-muted)] sm:text-lg">
              {{ isNotFound ? 'The link may be out of date, or the page may have moved. Let’s get you back to your workspace.' : 'Something interrupted this page. Head back to your workspace and try again from there.' }}
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <SButton
                icon="hugeicons:arrow-left-01"
                @click="clearError({ redirect: '/' })"
              >
                Back to overview
              </SButton>
              <NuxtLink
                to="/login"
                class="rounded-lg px-3 py-2 text-sm font-medium text-[var(--selaras-resolved-text-muted)] outline-none transition-colors hover:text-[var(--selaras-resolved-text-default)] focus-visible:ring-2 focus-visible:ring-[var(--selaras-resolved-color-primary-focus)]"
                @click.prevent="clearError({ redirect: '/login' })"
              >
                Go to sign in
              </NuxtLink>
            </div>
          </div>

          <div class="relative flex min-h-[230px] items-center justify-center overflow-hidden border-t border-[var(--selaras-resolved-border-default)] bg-[var(--selaras-resolved-surface-canvas)] p-5 sm:min-h-[300px] sm:p-8 md:min-h-[340px] md:border-l md:border-t-0">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--selaras-resolved-color-primary-subtle),transparent_68%)]" aria-hidden="true" />
            <svg
              class="relative h-auto w-full max-w-[410px]"
              viewBox="0 0 440 340"
              fill="none"
              role="img"
              :aria-labelledby="'error-art-title error-art-description'"
            >
              <title id="error-art-title">A route that can’t find its destination</title>
              <desc id="error-art-description">A winding dotted path leads past a signpost toward a glowing open doorway.</desc>
              <defs>
                <linearGradient id="portal" x1="289" y1="75" x2="361" y2="247" gradientUnits="userSpaceOnUse">
                  <stop stop-color="var(--selaras-resolved-color-primary-fill)" stop-opacity=".26" />
                  <stop offset="1" stop-color="var(--selaras-resolved-color-primary-fill)" stop-opacity=".04" />
                </linearGradient>
                <linearGradient id="path" x1="100" y1="188" x2="303" y2="255" gradientUnits="userSpaceOnUse">
                  <stop stop-color="var(--selaras-resolved-color-primary-fill)" stop-opacity=".2" />
                  <stop offset="1" stop-color="var(--selaras-resolved-color-primary-fill)" />
                </linearGradient>
              </defs>

              <circle cx="322" cy="168" r="112" fill="var(--selaras-resolved-color-primary-fill)" fill-opacity=".035" />
              <circle cx="322" cy="168" r="87" stroke="var(--selaras-resolved-border-default)" stroke-dasharray="3 8" />
              <path d="M272 253V121c0-27 22-49 49-49s49 22 49 49v132" fill="url(#portal)" stroke="var(--selaras-resolved-color-primary-fill)" stroke-opacity=".55" stroke-width="2" />
              <path d="M294 253v-92a27 27 0 0 1 54 0v92" stroke="var(--selaras-resolved-color-primary-fill)" stroke-opacity=".35" stroke-width="2" />
              <path d="M111 248c29-18 54-34 82-34 26 0 32 21 57 21 17 0 28-9 47-25" stroke="url(#path)" stroke-linecap="round" stroke-width="3" />
              <circle cx="112" cy="248" r="5" fill="var(--selaras-resolved-color-primary-fill)" />
              <circle cx="297" cy="210" r="5" fill="var(--selaras-resolved-color-primary-fill)" />

              <path d="M156 216v-91" stroke="var(--selaras-resolved-border-default)" stroke-width="2" />
              <path d="M157 132h58l-10 14 10 14h-58" fill="var(--selaras-resolved-surface-elevated)" stroke="var(--selaras-resolved-border-default)" stroke-linejoin="round" stroke-width="2" />
              <path d="M170 146h28" stroke="var(--selaras-resolved-text-muted)" stroke-linecap="round" stroke-width="2" />
              <path d="M156 177h-27l9-12-9-12h27" fill="var(--selaras-resolved-surface-elevated)" stroke="var(--selaras-resolved-border-default)" stroke-linejoin="round" stroke-width="2" />
              <path d="M137 165h8" stroke="var(--selaras-resolved-text-muted)" stroke-linecap="round" stroke-width="2" />

              <rect x="324" y="174" width="4" height="4" rx="2" fill="var(--selaras-resolved-color-primary-fill)" />
              <path d="M220 280h156" stroke="var(--selaras-resolved-border-default)" stroke-linecap="round" />
              <path d="M248 295h100" stroke="var(--selaras-resolved-border-default)" stroke-linecap="round" stroke-opacity=".55" />
              <rect x="72" y="96" width="46" height="27" rx="13.5" fill="var(--selaras-resolved-surface-elevated)" stroke="var(--selaras-resolved-border-default)" />
              <text x="95" y="114" text-anchor="middle" fill="var(--selaras-resolved-text-muted)" font-size="11" font-weight="600" letter-spacing="1.2">404</text>
              <circle cx="379" cy="95" r="3" fill="var(--selaras-resolved-color-primary-fill)" fill-opacity=".65" />
              <circle cx="240" cy="91" r="2" fill="var(--selaras-resolved-text-muted)" fill-opacity=".45" />
              <circle cx="382" cy="231" r="2" fill="var(--selaras-resolved-text-muted)" fill-opacity=".5" />
            </svg>
            <span class="absolute bottom-6 right-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--selaras-resolved-text-muted)]">Find your way back</span>
          </div>
        </section>

        <p class="mt-5 text-center text-xs text-[var(--selaras-resolved-text-muted)]">
          Built with Selaras · Made to be yours.
        </p>
      </div>
    </main>
  </SApp>
</template>
