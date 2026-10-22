<script setup lang="ts">
const config = useAppConfig()
</script>

<template>
  <div class="auth-shell">
    <aside class="auth-story">
      <NuxtLink to="/" class="flex items-center gap-[9px] px-2.5 text-[21px] font-semibold tracking-[-0.8px]">
        <span class="inline-flex size-[30px] items-center justify-center rounded-[9px] bg-[var(--selaras-resolved-color-primary-fill)] px-[2px] pb-[3px] text-[25px] font-semibold leading-none tracking-[-2px] text-white">s.</span>
        {{ config.dashboard.name }}
      </NuxtLink>
      <div class="auth-story-content">
        <p class="mb-2.5 text-[10px] font-semibold tracking-[1.6px] text-[var(--selaras-resolved-text-muted)]">A LITTLE CLARITY. A LOT OF POSSIBILITY.</p>
        <h2 class="auth-story-title">
          Good work starts
          <br >
          with a little space.
        </h2>
        <p class="auth-story-description">
          Bring your people, your ideas, and your next big thing. Make yourself
          at home.
        </p>
        <div class="auth-art" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <p class="auth-story-footer">Your workspace. Your pace.</p>
    </aside>
    <div class="auth-main">
      <header class="auth-header">
        <NuxtLink to="/" class="text-[var(--selaras-resolved-text-muted)]">← Back to dashboard</NuxtLink>
        <SColorModeToggle />
      </header>
      <main class="auth-content"><slot /></main>
      <footer class="auth-footer">
        Built with
        <a href="https://selarasui.my.id/">Selaras</a>
        · Made to be yours.
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.auth-story {
  background: var(--selaras-resolved-surface-elevated);
  border-right: 1px solid var(--selaras-resolved-border-default);
  padding: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.auth-story-content {
  margin: auto;
  padding: 50px 20px;
  width: 100%;
  max-width: 500px;
}

.auth-story-title {
  font-size: clamp(32px, 3.5vw, 52px);
  line-height: 1.18;
  letter-spacing: -1.8px;
  margin: 20px 0;
}

.auth-story-description {
  color: var(--selaras-resolved-text-muted);
  font-size: 14px;
  max-width: 330px;
}

.auth-story-footer {
  font-size: 11px;
  color: var(--selaras-resolved-text-muted);
}

.auth-main {
  display: flex;
  flex-direction: column;
  padding: 30px 40px;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.auth-content {
  width: 100%;
  max-width: 380px;
  margin: auto;
  padding: 60px 0;
}

.auth-footer {
  text-align: center;
  font-size: 11px;
  color: var(--selaras-resolved-text-muted);
}

.auth-art {
  height: 140px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: 60px;
  max-width: 320px;
}

.auth-art span {
  flex: 1;
  height: 30%;
  border-radius: 8px 8px 0 0;
  background: var(--selaras-resolved-color-primary-border);
  opacity: 0.6;
}

.auth-art span:nth-child(2) { height: 50%; }
.auth-art span:nth-child(3) { height: 43%; }
.auth-art span:nth-child(4) {
  height: 70%;
  background: var(--selaras-resolved-color-primary-indicator);
}
.auth-art span:nth-child(5) { height: 60%; }
.auth-art span:nth-child(6) {
  height: 82%;
  background: var(--selaras-resolved-color-primary-fill);
}
.auth-art span:nth-child(7) {
  height: 100%;
  background: var(--selaras-resolved-color-primary-fill-hover);
}

@media (max-width: 1200px) {
  .auth-story { padding: 28px; }
  .auth-story-content { padding-inline: 0; }
}

@media (max-width: 760px) {
  .auth-shell { grid-template-columns: 1fr; }
  .auth-story { display: none; }
  .auth-main {
    min-height: 100dvh;
    padding: 22px;
  }
}
</style>
