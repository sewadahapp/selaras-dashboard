import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('SPagination, stable selection, bulk export, and confirmed bulk delete work together', async ({
  page,
}) => {
  await page.goto('/customers')
  await page
    .getByRole('checkbox', { name: 'Select Alya Putri', exact: true })
    .check()
  const pagination = page.getByLabel('Customer pagination')
  await pagination.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await page
    .getByRole('checkbox', {
      name: 'Select this page of customers',
      exact: true,
    })
    .check()
  await expect(
    page.getByRole('status', { name: '' }).filter({ hasText: '7 selected' }),
  ).toBeVisible()
  await page.getByRole('columnheader', { name: 'Company', exact: true }).click()
  await expect(
    page.getByRole('columnheader', { name: 'Company', exact: true }),
  ).toHaveAttribute('aria-sort', 'ascending')
  await expect(page.getByText('7 selected', { exact: true })).toBeVisible()
  const downloaded = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Export selected', exact: true })
    .click()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('selected-customers.csv')
  expect(
    (await readFile((await download.path())!, 'utf8')).split('\r\n'),
  ).toHaveLength(8)
  await page
    .getByRole('button', { name: 'Delete selected', exact: true })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Cancel', exact: true })
    .click()
  await expect(page.getByText('7 selected', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: 'Delete selected', exact: true })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Delete customers', exact: true })
    .click()
  await expect(
    page.getByText('7 customers deleted.', { exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('selaras-dashboard:v1')!).customers
          .length,
    ),
  ).toBe(5)
  await page.reload()
  await expect(page.getByText('of 5 customers', { exact: false })).toBeVisible()
})

test('customer column controls and URL filters survive navigation and empty results', async ({
  page,
}) => {
  await page.goto('/customers?status=Trial&sort=name:asc')
  const search = page.getByLabel('Search customers', { exact: true })
  await search.fill('Kanvas')
  await expect(page).toHaveURL(/q=Kanvas/)
  await expect(
    page.getByRole('cell', { name: 'Kanvas', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(search).toHaveValue('Kanvas')
  await page.getByRole('button', { name: 'Columns', exact: true }).click()
  await page
    .getByRole('group', { name: 'Visible customer columns' })
    .getByRole('checkbox', { name: 'Company', exact: true })
    .uncheck()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('columnheader', { name: 'Company', exact: true }),
  ).toHaveCount(0)
  await search.fill('no-such-customer')
  await expect(page.getByText('No one here by that name.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(
    page.getByText('of 12 customers', { exact: false }),
  ).toBeVisible()
})
