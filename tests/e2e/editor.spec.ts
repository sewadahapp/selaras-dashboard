import { expect, test, type Page } from '@playwright/test'

async function selectText(page: Page, text: string) {
  await page.getByRole('textbox', { name: 'Document content' }).focus()
  await page
    .getByRole('textbox', { name: 'Document content' })
    .evaluate((element, text) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const start = node.textContent?.indexOf(text) ?? -1
        if (start < 0) continue
        const range = document.createRange()
        range.setStart(node, start)
        range.setEnd(node, start + text.length)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))
        return
      }
      throw new Error('Text to select was not found: ' + text)
    }, text)
}

test('Selaras toolbar formats the selection and follows caret state', async ({
  page,
}) => {
  await page.goto('/editor')
  const document = page.getByRole('textbox', { name: 'Document content' })
  const toolbar = page.getByRole('toolbar', { name: 'Text formatting' })
  const bold = toolbar.getByRole('button', { name: 'Bold', exact: true })
  const underline = toolbar.getByRole('button', {
    name: 'Underline',
    exact: true,
  })
  await document.fill('Selected plain')
  await selectText(page, 'Selected')
  await bold.click()
  await expect(document.locator('strong')).toHaveText('Selected')
  await expect(bold).toHaveAttribute('aria-pressed', 'true')
  await selectText(page, 'Selected')
  await underline.click()
  await expect(document.locator('u')).toHaveText('Selected')
  await expect(underline).toHaveAttribute('aria-pressed', 'true')
  await selectText(page, 'plain')
  await expect(bold).toHaveAttribute('aria-pressed', 'false')
  await expect(underline).toHaveAttribute('aria-pressed', 'false')

  // Selaras owns one keyboard focus sequence across the toggle group and buttons.
  await bold.focus()
  await page.keyboard.press('ArrowRight')
  await expect(
    toolbar.getByRole('button', { name: 'Italic', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(underline).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(
    toolbar.getByRole('button', { name: 'Heading', exact: true }),
  ).toBeFocused()
})

test('link dialog preserves the selected text, validates URLs, and supports history', async ({
  page,
}) => {
  await page.goto('/editor')
  const document = page.getByRole('textbox', { name: 'Document content' })
  const toolbar = page.getByRole('toolbar', { name: 'Text formatting' })
  await document.fill('Visit Selaras for components.')
  await selectText(page, 'Selaras')
  await toolbar.getByRole('button', { name: 'Edit link', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit link', exact: true })
  await dialog.getByLabel('Link address').fill('javascript:alert(1)')
  await dialog.getByRole('button', { name: 'Apply link' }).click()
  await expect(
    dialog.getByText('Use an https://, http://, or mailto: address.'),
  ).toBeVisible()
  await expect(document.locator('a')).toHaveCount(0)
  await dialog.getByLabel('Link address').fill('https://selarasui.my.id/')
  await dialog.getByRole('button', { name: 'Apply link' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(
    document.getByRole('link', { name: 'Selaras', exact: true }),
  ).toHaveAttribute('href', 'https://selarasui.my.id/')
  await expect(document).toBeFocused()
  await toolbar.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(document.locator('a')).toHaveCount(0)
  await toolbar.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(document.locator('a')).toHaveText('Selaras')
  await selectText(page, 'Selaras')
  await toolbar.getByRole('button', { name: 'Edit link', exact: true }).click()
  await expect(dialog.getByLabel('Link address')).toHaveValue(
    'https://selarasui.my.id/',
  )
  await dialog.getByRole('button', { name: 'Remove link' }).click()
  await expect(document.locator('a')).toHaveCount(0)
  await expect(document).toHaveText('Visit Selaras for components.')
})

test('placeholder, read-only mode, reset, and HTML output match the editor block', async ({
  page,
}) => {
  await page.goto('/editor')
  const document = page.getByRole('textbox', { name: 'Document content' })
  const toolbar = page.getByRole('toolbar', { name: 'Text formatting' })
  await document.fill('')
  await expect(document.locator('p').first()).toHaveAttribute(
    'data-placeholder',
    'Write a project note…',
  )
  await page.getByRole('button', { name: 'Reset content', exact: true }).click()
  await expect(document).toContainText('A little space for your next idea.')
  await page.getByText('View HTML output', { exact: true }).click()
  const output = page.locator('.editor-output pre')
  await expect(output).toContainText('<h1>')
  await expect(output.locator('h1')).toHaveCount(0)
  await page.getByRole('switch', { name: 'Read only', exact: true }).click()
  await expect(document).toHaveAttribute('contenteditable', 'false')
  await expect(document).toHaveAttribute('aria-readonly', 'true')
  for (const name of [
    'Bold',
    'Underline',
    'Heading',
    'Edit link',
    'Undo',
    'Redo',
  ]) {
    await expect(
      toolbar.getByRole('button', { name, exact: true }),
    ).toBeDisabled()
  }
  await expect(
    page.getByRole('button', { name: 'Reset content', exact: true }),
  ).toBeDisabled()
  await page.getByRole('switch', { name: 'Read only', exact: true }).click()
  await expect(document).toHaveAttribute('contenteditable', 'true')
})
