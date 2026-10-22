import { expect, test } from '@playwright/test'

test('corrupt saved data stays intact until an explicit reset', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('selaras-dashboard:v1', '{broken'),
  )
  await page.goto('/customers')
  const alert = page
    .getByRole('alert')
    .filter({ hasText: 'Browser storage needs attention' })
  await expect(alert).toBeVisible()
  await alert
    .getByRole('button', { name: 'Retry loading', exact: true })
    .click()
  await expect(alert).toBeVisible()
  await alert
    .getByRole('button', { name: 'Reset saved demo', exact: true })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Cancel', exact: true })
    .click()
  expect(
    await page.evaluate(() => localStorage.getItem('selaras-dashboard:v1')),
  ).toBe('{broken')
  await alert
    .getByRole('button', { name: 'Reset saved demo', exact: true })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Reset saved demo', exact: true })
    .click()
  await expect(alert).not.toBeVisible()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('selaras-dashboard:v1')!).members
          .length,
    ),
  ).toBe(7)
})

test('failed writes remain visible and retry saves the current changes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    let rejectNextWorkspaceSave = true
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'selaras-dashboard:v1' && rejectNextWorkspaceSave) {
        rejectNextWorkspaceSave = false
        throw new DOMException('Storage full', 'QuotaExceededError')
      }
      original.call(this, key, value)
    }
  })
  await page.goto('/settings')
  await page.getByLabel('Workspace name').fill('Retry studio')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  const alert = page
    .getByRole('alert')
    .filter({ hasText: 'Browser storage needs attention' })
  await expect(alert).toBeVisible()
  await expect(
    page.getByText('Workspace settings saved.', { exact: true }),
  ).not.toBeVisible()
  await alert.getByRole('button', { name: 'Retry saving', exact: true }).click()
  await expect(alert).not.toBeVisible()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('selaras-dashboard:v1')!).settings.name,
    ),
  ).toBe('Retry studio')
})
