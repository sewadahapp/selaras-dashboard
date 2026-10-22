<script setup lang="ts">
import { settingsSections } from '~/data/settings'
const config = useAppConfig()
const route = useRoute()
const colorMode = useColorMode()
useHead({ htmlAttrs: { class: 'dashboard-page' } })
const sidebar = useTemplateRef('sidebar')
const commandPalette = useCommandPalette()
const { settings, initialize, storageAvailable } = useDashboard()
const workspaceInitials = computed(
  () =>
    settings.value.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'W',
)
const selarasLogo = computed(() =>
  colorMode.value === 'dark'
    ? '/selaras-logo-dark.svg'
    : '/selaras-logo-light.svg',
)
const workspaceItems = computed(() => [
  [{ label: settings.value.name, icon: 'hugeicons:tick-02' }],
  [
    {
      label: 'Workspace settings',
      icon: 'hugeicons:settings-01',
      to: '/settings',
      onSelect: () => closeMobileSidebar(),
    },
  ],
])
const links = [
  { label: 'Overview', to: '/', icon: 'hugeicons:dashboard-square-01' },
  { label: 'Analytics', to: '/analytics', icon: 'hugeicons:chart-increase' },
  { label: 'Customers', to: '/customers', icon: 'hugeicons:user-group' },
  {
    label: 'Editor',
    to: '/editor',
    icon: 'hugeicons:pencil-edit-02',
    slot: 'editor',
  },
  { label: 'Settings', to: '/settings', icon: 'hugeicons:settings-01' },
]
const navigation = computed(() =>
  links.map((link) => ({
    ...link,
    active:
      route.path === link.to ||
      (link.to === '/settings' && route.path.startsWith('/settings/')),
    onSelect: closeMobileSidebar,
  })),
)
function closeMobileSidebar(event?: Event) {
  const click = event as MouseEvent | undefined
  if (
    click?.metaKey ||
    click?.ctrlKey ||
    click?.shiftKey ||
    click?.altKey ||
    (click?.button ?? 0) > 0
  )
    return
  if (window.matchMedia('(max-width: 767px)').matches) sidebar.value?.toggle()
}
const authScreens = [
  { label: 'Login', to: '/login', icon: 'hugeicons:login-01' },
  { label: 'Register', to: '/register', icon: 'hugeicons:user-add-01' },
  {
    label: 'Password recovery',
    to: '/forgot-password',
    icon: 'hugeicons:lock-password',
  },
]
const commandGroups = [
  { label: 'Workspace', items: links },
  { label: 'Settings', items: settingsSections.slice(1) },
  { label: 'Authentication', items: authScreens },
].map((group) => ({
  label: group.label,
  items: group.items.map((screen) => ({
    label: screen.label,
    icon: screen.icon,
    onSelect: () => navigateTo(screen.to),
  })),
}))
watch(() => route.path, commandPalette.close)
onMounted(initialize)
onBeforeUnmount(commandPalette.close)
</script>

<template>
  <div class="dashboard-shell">
    <a class="skip-link" href="#main">Skip to content</a>
    <SDashboardGroup
      class="dashboard-group"
      auto-save-id="selaras-dashboard-layout-v1"
    >
      <SDashboardSidebar
        ref="sidebar"
        data-testid="dashboard-sidebar"
        :default-size="260"
        :min-size="200"
        :max-size="400"
        :collapsed-size="64"
        :ui="{ header: 'p-2', footer: 'border-t-0 p-2' }"
      >
        <template #header="{ isCollapsed }">
          <NuxtLink
            to="/"
            class="brand sidebar-brand"
            :aria-label="config.dashboard.name + ' overview'"
            @click="closeMobileSidebar"
          >
            <span class="brand-mark">s.</span>
            <span v-if="!isCollapsed" class="brand-name">
              {{ config.dashboard.name }}
            </span>
            <span v-if="!isCollapsed" class="brand-caption">dashboard</span>
          </NuxtLink>
          <SDropdown
            :items="workspaceItems"
            :positioning="{
              side: 'bottom',
              align: 'start',
              collisionPadding: 12,
            }"
            :ui="{ content: 'w-64 max-w-[calc(100vw-1.5rem)]' }"
          >
            <SButton
              color="neutral"
              variant="ghost"
              :class="['workspace', { 'workspace-rail': isCollapsed }]"
              aria-label="Switch workspace"
            >
              <span class="workspace-avatar" aria-hidden="true">
                {{ workspaceInitials }}
              </span>
              <span v-if="!isCollapsed" class="sidebar-trigger-copy">
                <strong>{{ settings.name }}</strong>
                <small>Personal</small>
              </span>
              <span v-if="!isCollapsed" class="workspace-chevron" aria-hidden="true">
                <SIcon name="hugeicons:chevron-up" />
                <SIcon name="hugeicons:chevron-down" />
              </span>
            </SButton>
            <template #item="{ item }">
              <span class="sidebar-menu-label">
                {{ item.label }}
                <small v-if="!item.to">Current workspace</small>
              </span>
            </template>
          </SDropdown>
        </template>
        <template #default="{ isCollapsed }">
          <p v-if="!isCollapsed" class="nav-label">WORKSPACE</p>
          <SNavigationMenu
            :items="navigation"
            orientation="vertical"
            :collapsed="isCollapsed"
            tooltip
            aria-label="Main navigation"
          >
            <template #editor-trailing>
              <span v-if="!isCollapsed" aria-hidden="true">
                <SBadge size="sm" color="primary" variant="soft">
                  New
                </SBadge>
              </span>
            </template>
          </SNavigationMenu>
        </template>
        <template #footer="{ isCollapsed }">
          <div class="sidebar-footer">
            <div
              v-if="!isCollapsed"
              class="starter-note"
              data-testid="sidebar-starter-note"
            >
              <div class="selaras-note-heading">
                <img
                  :src="selarasLogo"
                  alt="Selaras"
                  width="78"
                  height="26"
                >
              </div>
              <p>Browse component docs, examples, and design patterns.</p>
              <a
                href="https://selarasui.my.id/"
                target="_blank"
                rel="noreferrer"
              >
                Open Selaras docs ↗
              </a>
            </div>
            <div :class="['profile', { 'profile-rail': isCollapsed }]">
              <SPopover
                side="top"
                align="start"
                :ui="{
                  content:
                    'account-popover w-[var(--reka-popper-anchor-width)] min-w-56 max-w-[calc(100vw-1.5rem)] p-2',
                }"
              >
                <SButton
                  color="neutral"
                  variant="ghost"
                  :class="[
                    'profile-trigger',
                    { 'profile-trigger-rail': isCollapsed },
                  ]"
                  aria-label="Account and appearance settings"
                >
                  <span class="workspace-avatar" aria-hidden="true">YO</span>
                  <span v-if="!isCollapsed" class="sidebar-trigger-copy">
                    <strong>Your workspace</strong>
                    <small>Demo account</small>
                  </span>
                  <SIcon
                    v-if="!isCollapsed"
                    name="hugeicons:arrow-down-01"
                    class="sidebar-trigger-chevron"
                  />
                </SButton>
                <template #content>
                  <nav class="account-popover-content" aria-label="Account">
                    <NuxtLink to="/login" @click="closeMobileSidebar">
                      <SIcon name="hugeicons:login-01" class="size-4 shrink-0" />
                      Login
                    </NuxtLink>
                    <NuxtLink to="/register" @click="closeMobileSidebar">
                      <SIcon
                        name="hugeicons:user-add-01"
                        class="size-4 shrink-0"
                      />
                      Register
                    </NuxtLink>
                  </nav>
                  <div class="account-popover-appearance">
                    <SColorModeSwitch label="Dark mode" />
                  </div>
                </template>
              </SPopover>
            </div>
          </div>
        </template>
      </SDashboardSidebar>
      <SDashboardResizeHandle aria-label="Resize sidebar" />
      <SDashboardPanel class="dashboard-panel">
        <SDashboardNavbar
          class="dashboard-navbar"
          :title="
            links.find(
              (link) =>
                link.to === route.path ||
                (link.to === '/settings' &&
                  route.path.startsWith('/settings/')),
            )?.label || 'Dashboard'
          "
        >
          <template #leading>
            <SDashboardSidebarToggle />
            <span class="text-[var(--selaras-resolved-text-muted)] navbar-workspace">Workspace</span>
            <span class="breadcrumb-separator">/</span>
          </template>
          <SButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="hugeicons:search-01"
            aria-label="Search screens"
            @click="commandPalette.open()"
          >
            <span class="command-hint">
              Search
              <SKbd size="sm">⌘/Ctrl K</SKbd>
            </span>
          </SButton>
          <SBadge variant="soft" color="neutral" dot>Demo</SBadge>
          <a
            class="docs-link"
            href="https://selarasui.my.id/"
            target="_blank"
            rel="noreferrer"
          >
            Docs ↗
          </a>
        </SDashboardNavbar>
        <main id="main" tabindex="-1">
          <DashboardFeedback />
          <slot />
          <div class="min-h-7 flex-1" aria-hidden="true" />
          <footer class="page-footer">
            <span>
              Built with
              <a href="https://selarasui.my.id/">Selaras</a>
              · Made to be yours.
            </span>
            <span>
              {{
                storageAvailable
                  ? 'Demo data is saved in this browser'
                  : 'Session only · storage unavailable'
              }}
            </span>
          </footer>
        </main>
      </SDashboardPanel>
    </SDashboardGroup>
    <SCommandPalette :groups="commandGroups" />
  </div>
</template>

<style scoped>
.dashboard-shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.dashboard-group {
  flex: 1;
  min-height: 0;
  max-height: 100%;
}

.dashboard-panel { min-height: 0; }

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.8px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--selaras-resolved-color-primary-fill);
  color: white;
  font-size: 25px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -2px;
  padding: 0 2px 3px 0;
}

.brand-caption {
  margin-left: auto;
  color: var(--selaras-resolved-text-muted);
  font-size: 10px;
  font-weight: 400;
}

.workspace {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  height: auto;
  margin: 12px 0 0;
  padding: 7px 10px;
  border: 1px solid var(--selaras-resolved-border-default);
  border-radius: 9px;
  background: var(--selaras-resolved-surface-canvas);
}

.sidebar-trigger-copy {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.sidebar-trigger-copy strong,
.sidebar-trigger-copy small {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.sidebar-trigger-copy small { font-size: 11px; font-weight: 400; }
.sidebar-trigger-chevron { width: 14px; height: 14px; flex-shrink: 0; color: var(--selaras-resolved-text-muted); }
.sidebar-menu-label { min-width: 0; overflow-wrap: anywhere; }

.workspace.workspace-rail {
  width: 32px;
  height: 32px;
  margin-inline: auto;
  padding: 0;
  border: 0;
  justify-content: center;
}

.workspace-avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--selaras-resolved-color-primary-subtle);
  color: var(--selaras-resolved-color-primary-text);
  font-size: 11px;
  font-weight: 600;
}

.workspace-chevron {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--selaras-resolved-text-muted);
}

.workspace-chevron :deep(svg) {
  width: 12px;
  height: 12px;
}

.nav-label {
  margin: 0 12px 10px;
  color: var(--selaras-resolved-text-muted);
  font-size: 9px;
  letter-spacing: 1.3px;
}

.sidebar-footer { width: 100%; min-width: 0; }

.starter-note {
  margin: 0 0 12px;
  padding: 18px 14px;
  border: 1px solid var(--selaras-resolved-border-default);
  border-radius: 9px;
  background: var(--selaras-resolved-surface-canvas);
}

.selaras-note-heading { display: flex; align-items: center; }
.selaras-note-heading img { display: block; width: 78px; height: auto; flex: 0 0 auto; }
.starter-note p { margin: 10px 0 12px; font-size: 12px; line-height: 1.6; }
.starter-note a { color: var(--selaras-resolved-text-muted); font-size: 11px; }

.profile {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--selaras-resolved-border-default);
}

.profile-trigger {
  flex: 1;
  min-width: 0;
  height: auto;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px;
}

.account-popover-content { display: grid; gap: 2px; }
.account-popover-content a { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; font-size: 13px; }
.account-popover-content a:hover,
.account-popover-content a:focus-visible { background: var(--selaras-resolved-surface-elevated); outline: none; }
.account-popover-appearance { margin-top: 8px; padding: 12px 4px 4px; border-top: 1px solid var(--selaras-resolved-border-default); }
.profile strong { font-size: 11px; }
.profile small { font-size: 10px; }

.dashboard-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 73px;
  padding: 0 38px;
  border-bottom: 1px solid var(--selaras-resolved-border-default);
  font-size: 12px;
}

.breadcrumb-separator { margin: 0 6px; color: var(--selaras-resolved-border-hover); }
.docs-link { margin-left: 10px; color: var(--selaras-resolved-text-muted); font-size: 11px; }

main#main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 39px 38px 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-gutter: stable;
  outline: none;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 0;
  padding: 28px 0;
  border-top: 1px solid var(--selaras-resolved-border-default);
  color: var(--selaras-resolved-text-muted);
  font-size: 10px;
}

.page-footer a { color: var(--selaras-resolved-text-default); }

.skip-link {
  position: fixed;
  top: -100px;
  left: 15px;
  z-index: 100;
  padding: 10px;
  background: var(--selaras-resolved-surface-canvas);
}

.skip-link:focus { top: 10px; }

.command-hint { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; }
.sidebar-brand { padding: 8px; white-space: nowrap; }
.sidebar-brand .brand-mark { flex-shrink: 0; }
.profile-rail { flex-direction: column; justify-content: center; }
.profile-trigger.profile-trigger-rail { width: 32px; height: 32px; flex: none; justify-content: center; padding: 0; }
.profile-rail > :last-child { margin: 0; }

@media (min-width: 1600px) {
  main#main { padding-top: 48px; }
}

@media (max-width: 1200px) {
  main#main { padding: 28px 24px 0; }
  .dashboard-navbar { padding: 0 24px; }
  .brand-caption { display: none; }
}

@media (max-width: 760px) {
  .dashboard-navbar { height: 65px; padding: 0 16px; }
  .docs-link,
  .command-hint { display: none; }
  main#main { padding: 28px 18px 0; }
  .page-footer { flex-direction: column; gap: 4px; }
}
</style>
