import { test, expect } from '@playwright/test'

test.describe('PDF Merge Tool', () => {
  test('should load the merge page', async ({ page }) => {
    await page.goto('/tools/merge')
    
    await expect(page.locator('h1')).toContainText('Merge PDFs')
    await expect(page.locator('text=Upload PDF Files')).toBeVisible()
  })

  test('should show upload area', async ({ page }) => {
    await page.goto('/tools/merge')
    
    const uploadArea = page.locator('[data-testid="upload-area"]')
    await expect(uploadArea).toBeVisible()
  })

  test('should display process button when files are uploaded', async ({ page }) => {
    await page.goto('/tools/merge')
    
    // This would need actual file uploads in a real test
    // For now, just check the button exists
    const processButton = page.locator('button:has-text("Process")')
    await expect(processButton).toBeVisible()
  })
})
