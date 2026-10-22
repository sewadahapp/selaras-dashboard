import { expect, test } from '@playwright/test'

test('member invitations validate, paginate with SPagination, persist, and remove', async ({
  page,
}) => {
  await page.goto('/settings/members')
  await expect(page.getByLabel('Role for You', { exact: true })).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Remove You', exact: true }),
  ).toBeDisabled()
  await page.getByLabel('Role for Alya Putri', { exact: true }).click()
  await page.getByRole('option', { name: 'Member', exact: true }).click()
  await expect(
    page.getByText('Demo member role updated.', { exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByLabel('Role for Alya Putri', { exact: true }),
  ).toContainText('Member')
  await page.getByRole('button', { name: 'Invite member', exact: true }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Invite member',
    exact: true,
  })
  await dialog
    .getByRole('button', { name: 'Add demo invitation', exact: true })
    .click()
  await expect(dialog.getByText('Enter a name.')).toBeVisible()
  await dialog.getByLabel('Full name').fill('New Teammate')
  await dialog.getByLabel('Email address').fill('ALYA@EXAMPLE.COM')
  await dialog
    .getByRole('button', { name: 'Add demo invitation', exact: true })
    .click()
  await expect(
    dialog.getByText('This person is already a member or has an invitation.'),
  ).toBeVisible()
  await dialog.getByLabel('Email address').fill('teammate@example.com')
  await dialog
    .getByRole('button', { name: 'Add demo invitation', exact: true })
    .click()
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByText('Demo invitation added', { exact: true }),
  ).toBeVisible()
  await page
    .getByLabel('Member pagination')
    .getByRole('button', { name: 'Next', exact: true })
    .click()
  await expect(
    page.getByRole('row').filter({ hasText: 'New Teammate' }),
  ).toContainText('Invited')
  await page.reload()
  await page.getByLabel('Search members').fill('teammate@example.com')
  await expect(
    page.getByRole('cell').filter({ hasText: 'New Teammate' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Remove New Teammate', exact: true })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Remove member', exact: true })
    .click()
  await expect(page.getByText('No members match your search.')).toBeVisible()
})

test('settings sections preserve preferences and security previews do not save passwords', async ({
  page,
}) => {
  await page.goto('/settings/notifications')
  await page
    .getByRole('switch', { name: 'Weekly digest', exact: true })
    .uncheck()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(
    page.getByText('Notification preferences saved.', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('tablist', { name: 'Settings sections' })
    .getByRole('tab', { name: 'General', exact: true })
    .click()
  await page.getByLabel('Workspace name').fill('Shared settings studio')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.goto('/settings/notifications')
  await expect(
    page.getByRole('switch', { name: 'Weekly digest', exact: true }),
  ).not.toBeChecked()
  await page.goto('/settings/security')
  await page
    .getByRole('button', { name: 'Preview password change', exact: true })
    .click()
  await expect(page.getByText('Use at least 12 characters.')).toBeVisible()
  await page
    .getByLabel('Demo current password', { exact: true })
    .fill('old-demo-value')
  await page
    .getByLabel('Demo new password', { exact: true })
    .fill('new-demo-value-123')
  await page
    .getByLabel('Confirm demo password', { exact: true })
    .fill('new-demo-value-123')
  await page
    .getByRole('button', { name: 'Preview password change', exact: true })
    .click()
  await expect(
    page.getByText('Password form preview complete', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByLabel('Demo new password', { exact: true }),
  ).toHaveValue('')
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain('demo-value')
})

test('settings tabs follow direct routes, reloads, history, and keyboard navigation', async ({
  page,
}) => {
  await page.goto('/settings/members')
  const tabs = page.getByRole('tablist', { name: 'Settings sections' })
  const members = tabs.getByRole('tab', { name: 'Members', exact: true })
  const general = tabs.getByRole('tab', { name: 'General', exact: true })
  await expect(members).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await expect(
    page
      .getByRole('tabpanel', { name: 'Members', exact: true })
      .getByRole('heading', { name: 'Members', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(members).toHaveAttribute('aria-selected', 'true')
  await general.click()
  await expect(page).toHaveURL('/settings')
  await expect(general).toHaveAttribute('aria-selected', 'true')
  await expect(
    page
      .getByRole('tabpanel', { name: 'General', exact: true })
      .getByLabel('Workspace name'),
  ).toBeVisible()
  await expect(page.getByLabel('Workspace name')).toHaveCount(1)
  await page.goBack()
  await expect(page).toHaveURL('/settings/members')
  await expect(members).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByLabel('Workspace name')).toHaveCount(0)
  await page.goForward()
  await expect(general).toHaveAttribute('aria-selected', 'true')
  await general.focus()
  await general.press('ArrowRight')
  await expect(page).toHaveURL('/settings/appearance')
  await expect(
    tabs.getByRole('tab', { name: 'Appearance', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await expect(
    page
      .getByRole('tabpanel', { name: 'Appearance', exact: true })
      .getByLabel('Color mode', { exact: true }),
  ).toBeVisible()
})
