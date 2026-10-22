import { expect, test } from '@playwright/test'

test('customer create, edit, persistence, filter, export, and delete', async ({
  page,
}) => {
  await page.goto('/customers')
  await page.getByRole('button', { name: 'Add customer', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Add customer', exact: true })
  await dialog
    .getByRole('button', { name: 'Add customer', exact: true })
    .click()
  await expect(dialog.getByText('Enter a name.')).toBeVisible()
  await dialog.getByLabel('Full name').fill('Demo Tester')
  await dialog.getByLabel('Email address').fill('tester@example.com')
  await dialog.getByLabel('Company', { exact: true }).fill('Test Studio')
  await dialog
    .getByRole('button', { name: 'Add customer', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  await page.getByLabel('Search customers').fill('tester@example.com')
  await expect(
    page.getByRole('cell', { name: 'Test Studio', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Actions for Demo Tester' }).click()
  await page.getByRole('menuitem', { name: 'Edit Demo Tester' }).click()
  await page
    .getByRole('dialog')
    .getByLabel('Company', { exact: true })
    .fill('Updated Studio')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.reload()
  await page.getByLabel('Search customers').fill('tester@example.com')
  await expect(
    page.getByRole('cell', { name: 'Updated Studio', exact: true }),
  ).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('customers.csv')
  await page.getByRole('button', { name: 'Actions for Demo Tester' }).click()
  await page.getByRole('menuitem', { name: 'Delete Demo Tester' }).click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Delete customer', exact: true })
    .click()
  await expect(page.getByText('No one here by that name.')).toBeVisible()
})

test('modal Escape closes and returns keyboard focus to its trigger', async ({
  page,
}) => {
  await page.goto('/customers')
  const trigger = page.getByRole('button', {
    name: 'Add customer',
    exact: true,
  })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('auth screens validate and open the demo workspace', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in to demo' }).click()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await page.getByLabel('Email address').fill('you@example.com')
  await page.getByLabel('Password', { exact: true }).fill('demo-password')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.getByRole('button', { name: 'Sign in to demo' }).click()
  await expect(
    page.getByRole('heading', { name: 'Workspace overview' }),
  ).toBeVisible()
  await page.goto('/forgot-password')
  await page.getByLabel('Email address').fill('you@example.com')
  await page.getByRole('button', { name: 'Preview recovery' }).click()
  await expect(
    page.getByText('This is a demo. No email has been sent.'),
  ).toBeVisible()
})

test('editor saves a draft and offers a JSON export', async ({ page }) => {
  await page.goto('/editor')
  await page
    .getByLabel('Document title', { exact: true })
    .fill('My first draft')
  await page
    .getByRole('textbox', { name: 'Document content' })
    .fill('A small idea worth keeping.')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.reload()
  await expect(page.getByLabel('Document title', { exact: true })).toHaveValue(
    'My first draft',
  )
  await expect(
    page.getByRole('textbox', { name: 'Document content' }),
  ).toContainText('A small idea worth keeping.')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  expect((await download).suggestedFilename()).toBe('document.json')
})

test('analytics renders all chart types without client errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/analytics')
  await expect(
    page.getByRole('img', {
      name: 'Sample revenue in US dollars',
      exact: true,
    }),
  ).toBeVisible()
  for (const type of ['Line', 'Bar', 'Area']) {
    await page.getByRole('button', { name: type, exact: true }).click()
    await expect(
      page.getByRole('button', { name: type, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
  }
  expect(errors).toEqual([])
})

test('settings persist and can reset the workspace', async ({ page }) => {
  await page.goto('/settings')
  await page.getByLabel('Workspace name').fill('My Studio')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.reload()
  await expect(page.getByLabel('Workspace name')).toHaveValue('My Studio')
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Reset workspace', exact: true })
    .click()
  await expect(page.getByLabel('Workspace name')).toHaveValue(
    'Studio workspace',
  )
})

test('each ready-made screen loads in dark mode without page overflow', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('nuxt-color-mode', 'dark'),
  )
  for (const route of [
    '/',
    '/customers',
    '/analytics',
    '/editor',
    '/settings',
    '/settings/appearance',
    '/settings/members',
    '/settings/notifications',
    '/settings/security',
    '/login',
    '/register',
    '/forgot-password',
  ]) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true)
  }
})
