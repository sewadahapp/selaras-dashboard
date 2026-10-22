import { expect, test } from '@playwright/test'

test('dashboard content scrolls without moving the page, sidebar, or navbar', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1280, height: 500 })
  await page.goto('/settings')
  const main = page.locator('#main')
  const navbar = page.locator('.dashboard-navbar')
  await expect(main).toBeVisible()
  await expect
    .poll(() =>
      main.evaluate((element) => element.scrollHeight - element.clientHeight),
    )
    .toBeGreaterThan(0)
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      ),
    )
    .toBeLessThanOrEqual(1)

  const navbarTop = (await navbar.boundingBox())!.y
  const sidebar = page.getByTestId('dashboard-sidebar')
  if (!isMobile) await expect(sidebar).toBeVisible()
  const mainBox = (await main.boundingBox())!
  await page.mouse.move(
    mainBox.x + mainBox.width / 2,
    mainBox.y + mainBox.height / 2,
  )
  await page.mouse.wheel(0, 500)
  await expect
    .poll(() => main.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  expect((await navbar.boundingBox())!.y).toBe(navbarTop)
  if (!isMobile) expect((await sidebar.boundingBox())!.y).toBe(0)

  // Repeated scrolling at the bottom must not chain into the outer document.
  await main.evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await page.mouse.wheel(0, 2000)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  expect((await navbar.boundingBox())!.y).toBe(navbarTop)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    ),
  ).toBeLessThanOrEqual(1)
})

test('client navigation restores natural page scrolling on auth screens', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1280, height: 350 })
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Search screens', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('option', { name: 'Login', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Welcome back.' }),
  ).toBeVisible()
  await expect(page.locator('html')).not.toHaveClass(/dashboard-page/)
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      ),
    )
    .toBeGreaterThan(0)
  await page.mouse.move(isMobile ? 195 : 960, 250)
  await page.mouse.wheel(0, 600)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
  await page.getByRole('link', { name: /Back to dashboard/ }).click()
  await expect(page.locator('html')).toHaveClass(/dashboard-page/)
  await expect(
    page.getByRole('heading', { name: 'Workspace overview' }),
  ).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
