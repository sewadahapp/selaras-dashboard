import { expect, test } from '@playwright/test'

const screens = [
  { path: '/', heading: 'Workspace overview' },
  { path: '/analytics', heading: 'Analytics' },
  { path: '/customers', heading: 'Customers' },
  { path: '/editor', heading: 'Editor' },
  { path: '/settings', heading: 'Settings' },
  { path: '/settings/appearance', heading: 'Settings' },
  { path: '/settings/members', heading: 'Settings' },
  { path: '/settings/notifications', heading: 'Settings' },
  { path: '/settings/security', heading: 'Settings' },
  { path: '/login', heading: 'Welcome back.' },
  { path: '/register', heading: 'Make room for good work.' },
  { path: '/forgot-password', heading: 'A fresh start.' },
]

test('ready-made screens render their main heading', async ({ page }) => {
  for (const screen of screens) {
    await page.goto(screen.path)
    await expect(
      page.getByRole('heading', { level: 1, name: screen.heading, exact: true }),
    ).toBeVisible()
  }
})

test('dashboard shell and command palette navigate between screens', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Workspace overview' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Search screens', exact: true }).click()
  const palette = page.getByRole('dialog', {
    name: 'Command palette',
    exact: true,
  })
  await expect(palette).toBeVisible()
  await palette.getByRole('option', { name: 'Login', exact: true }).click()

  await expect(page).toHaveURL('/login')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome back.' }),
  ).toBeVisible()
})
