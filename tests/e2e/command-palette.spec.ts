import { expect, test } from '@playwright/test'

test('screen search stays within the viewport and opens an auth screen', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1280, height: 500 })
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Search screens', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Command palette',
    exact: true,
  })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('combobox')).toBeFocused()
  await expect(dialog.getByRole('option')).toHaveCount(12)
  await expect(dialog.getByText('Workspace', { exact: true })).toBeVisible()
  await expect(
    dialog.getByText('Authentication', { exact: true }),
  ).toBeVisible()
  await expect(dialog.getByText('Navigate', { exact: true })).toBeVisible()

  await expect
    .poll(async () => {
      const box = await dialog.boundingBox()
      const viewport = page.viewportSize()!
      return (
        !!box &&
        box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= viewport.width &&
        box.y + box.height <= viewport.height
      )
    })
    .toBe(true)

  // The auth group can be below the scroll fold; it must still be selectable.
  await dialog.getByRole('option', { name: 'Login', exact: true }).click()
  await expect(page).toHaveURL('/login')
  await expect(dialog).not.toBeVisible()
})

test('the built-in shortcut, fuzzy search, keyboard selection, and reset work together', async ({
  page,
}) => {
  await page.goto('/')
  const dialog = page.getByRole('dialog', {
    name: 'Command palette',
    exact: true,
  })
  await page.keyboard.press('ControlOrMeta+k')
  await expect(dialog).toBeVisible()
  const search = dialog.getByRole('combobox')
  await expect(search).toBeFocused()
  await search.press('ArrowDown')
  await expect(
    dialog.getByRole('option', { name: 'Analytics', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await search.press('Enter')
  await expect(page).toHaveURL('/analytics')
  await expect(dialog).not.toBeVisible()

  await page.keyboard.press('ControlOrMeta+k')
  await expect(search).toBeFocused()
  await search.fill('sttng')
  await expect(dialog.getByRole('option')).toHaveCount(1)
  await expect(
    dialog.getByRole('option', { name: 'Settings', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await search.press('Enter')
  await expect(page).toHaveURL('/settings')

  await page.keyboard.press('ControlOrMeta+k')
  await expect(search).toHaveValue('')
  await search.fill('zzzzzz')
  await expect(
    dialog.getByText('No results found', { exact: true }),
  ).toBeVisible()
  await expect(dialog.getByRole('option')).toHaveCount(0)
  await search.press('Escape')
  await expect(dialog).not.toBeVisible()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(search).toHaveValue('')
  await expect(dialog.getByRole('option')).toHaveCount(12)
  await page.keyboard.press('ControlOrMeta+k')
  await expect(dialog).not.toBeVisible()
})
