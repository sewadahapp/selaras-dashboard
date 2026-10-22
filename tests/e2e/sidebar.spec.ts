import { expect, test } from '@playwright/test'

test('desktop sidebar resizes, restores its width, and remembers collapse state', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(!!isMobile, 'Desktop splitter behavior')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const sidebar = page.getByTestId('dashboard-sidebar')
  const handle = page.getByRole('separator', { name: 'Resize sidebar' })
  const toggle = page.getByRole('button', { name: 'Toggle sidebar' })
  const width = () =>
    sidebar.evaluate((element) => element.getBoundingClientRect().width)
  await expect(handle).toBeVisible()
  await expect.poll(width).toBeGreaterThanOrEqual(255)
  await expect.poll(width).toBeLessThanOrEqual(265)

  const divider = await handle.boundingBox()
  expect(divider).not.toBeNull()
  await page.mouse.move(
    divider!.x + divider!.width / 2,
    divider!.y + divider!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    divider!.x + divider!.width / 2 + 65,
    divider!.y + divider!.height / 2,
    { steps: 12 },
  )
  await page.mouse.up()
  await expect.poll(width).toBeGreaterThan(300)
  const resized = await width()

  // Keyboard users can operate the same separator.
  await handle.focus()
  await handle.press('ArrowRight')
  await expect.poll(width).toBeGreaterThan(resized)
  const expanded = await width()
  await expect
    .poll(async () =>
      (await context.cookies()).some(
        (cookie) => cookie.name === 'selaras-dashboard-layout-v1',
      ),
    )
    .toBe(true)
  await page.reload()
  await expect
    .poll(async () => Math.abs((await width()) - expanded))
    .toBeLessThan(3)

  const transition = await sidebar.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      property: style.transitionProperty,
      duration: style.transitionDuration,
    }
  })
  expect(transition.property).toContain('flex-grow')
  expect(parseFloat(transition.duration)).toBeGreaterThan(0)
  await toggle.click()
  await expect.poll(width).toBeGreaterThanOrEqual(61)
  await expect.poll(width).toBeLessThanOrEqual(67)
  // Labels remain accessible in the rail through NavigationMenu.
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Customers', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect.poll(width).toBeLessThanOrEqual(67)
  await toggle.click()
  await expect
    .poll(async () => Math.abs((await width()) - expanded))
    .toBeLessThan(3)
})

test('desktop resize is bounded by the configured pixel limits', async ({
  page,
  isMobile,
}) => {
  test.skip(!!isMobile, 'Desktop splitter behavior')
  await page.goto('/')
  const sidebar = page.getByTestId('dashboard-sidebar')
  const handle = page.getByRole('separator', { name: 'Resize sidebar' })
  const width = () =>
    sidebar.evaluate((element) => element.getBoundingClientRect().width)
  await expect(handle).toBeVisible()
  await handle.focus()
  await handle.press('End')
  await expect.poll(width).toBeLessThanOrEqual(402)
  await expect.poll(width).toBeGreaterThanOrEqual(398)
  // Dragging far past the maximum still leaves the content panel usable.
  const divider = await handle.boundingBox()
  await page.mouse.move(
    divider!.x + divider!.width / 2,
    divider!.y + divider!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(divider!.x + 350, divider!.y + divider!.height / 2)
  await page.mouse.up()
  await expect.poll(width).toBeLessThanOrEqual(402)
  await expect(
    page.getByRole('heading', { name: 'Workspace overview' }),
  ).toBeVisible()
})

test('mobile sidebar uses the drawer and closes after navigation', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile drawer behavior')
  await page.goto('/')
  await expect(
    page.getByRole('separator', { name: 'Resize sidebar' }),
  ).toHaveCount(0)
  const toggle = page.getByRole('button', { name: 'Toggle sidebar' })
  await toggle.click()
  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await drawer.getByRole('link', { name: 'Customers', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Customers', exact: true }),
  ).toBeVisible()
  await expect(drawer).not.toBeVisible()
  await toggle.click()
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).not.toBeVisible()
})

test('workspace menu shows the current workspace and opens its settings', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  if (isMobile)
    await page.getByRole('button', { name: 'Toggle sidebar' }).click()
  const switcher = page.getByRole('button', {
    name: 'Switch workspace',
    exact: true,
  })
  await switcher.click()
  const menu = page.getByRole('menu')
  await expect(
    menu.getByRole('menuitem', { name: /Studio workspace/ }),
  ).toBeVisible()
  await expect(menu.getByText('Current workspace')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expect(switcher).toBeFocused()
  await switcher.click()
  await menu
    .getByRole('menuitem', { name: 'Workspace settings', exact: true })
    .click()
  await expect(page).toHaveURL('/settings')
  await expect(menu).not.toBeVisible()
  if (isMobile) await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('sidebar footer anchors the starter card and keeps the account menu accessible in the rail', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Toggle sidebar' })
  if (isMobile) await toggle.click()
  const note = page.getByTestId('sidebar-starter-note')
  const account = page.getByRole('button', {
    name: 'Account and appearance settings',
    exact: true,
  })
  await expect(note).toBeVisible()
  await expect(
    note.getByRole('link', { name: 'Open Selaras docs', exact: false }),
  ).toHaveAttribute('href', 'https://selarasui.my.id/design-kit')
  await expect(account).toBeVisible()
  const noteBox = (await note.boundingBox())!
  const accountBox = (await account.boundingBox())!
  expect(noteBox.y + noteBox.height).toBeLessThanOrEqual(accountBox.y)
  expect(accountBox.y - noteBox.y - noteBox.height).toBeLessThan(48)

  if (!isMobile) {
    await toggle.click()
    await expect(note).not.toBeVisible()
    await expect(account).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Switch workspace', exact: true }),
    ).toBeVisible()
  }
  await account.click()
  const popover = page.getByRole('dialog')
  await expect(popover.getByRole('link', { name: 'Login' })).toHaveAttribute(
    'href',
    '/login',
  )
  await expect(
    popover.getByRole('link', { name: 'Register' }),
  ).toHaveAttribute('href', '/register')
  await expect(
    popover.getByRole('switch', { name: 'Dark mode' }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(account).toBeFocused()
  await account.click()
  await page.getByRole('dialog').getByRole('link', { name: 'Register' }).click()
  await expect(page).toHaveURL('/register')
  await expect(popover).not.toBeVisible()
})
