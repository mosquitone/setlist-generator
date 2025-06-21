import { test, expect, Page } from '@playwright/test';

// Helper function to wait for success page and image generation
async function waitForSetlistSuccess(page: Page) {
  // First, ensure we're on the success page with the correct header
  await page.waitForSelector('h1:has-text("Setlist Generated !")', { timeout: 10000 });
  
  // Wait for loading to complete (remove loader)
  await page.waitForSelector('.loader', { state: 'detached', timeout: 20000 });
  
  // Wait for image to be generated and have blob URL
  const imageLocator = page.locator('img[style*="width: 100%"]');
  await imageLocator.waitFor({ state: 'visible', timeout: 10000 });
  
  // Ensure image has actual blob URL src (not empty)
  await expect(imageLocator).toHaveAttribute('src', /^blob:.*/, { timeout: 10000 });
  
  // Wait for image to be fully loaded by the browser
  const imageLoadResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      const img = document.querySelector('img[style*="width: 100%"]') as HTMLImageElement;
      if (!img) {
        resolve(false);
        return;
      }
      
      if (img.complete && img.naturalWidth > 0) {
        resolve(true);
        return;
      }
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Fallback timeout
      setTimeout(() => resolve(false), 5000);
    });
  });
  
  if (!imageLoadResult) {
    throw new Error('Setlist image failed to load properly');
  }
  
  return imageLocator;
}

// Legacy function for compatibility
async function waitForSetlistImageGeneration(page: Page) {
  return waitForSetlistSuccess(page);
}

test.describe('Final Working E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API endpoints
    await page.route('**/api/setlist**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify('test-setlist-id-12345')
        });
      } else if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const id = url.searchParams.get('id');
        if (id === 'test-setlist-id-12345') {
          const mockSetlist = {
            meta: { createDate: '2024-01-01T00:00:00Z', version: '1.0' },
            band: { name: 'Test Band' },
            event: { name: 'Test Event', date: '', openTime: '', startTime: '' },
            playings: [
              { _id: '1', title: 'Test Song', note: '' }
            ],
            theme: 'mqtn'
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([mockSetlist])
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([null])
          });
        }
      }
    });
    
    await page.goto('/');
  });

  test('should create setlist successfully', async ({ page }) => {
    // Navigate to create page
    await page.click('i.gamepad.icon');
    await expect(page).toHaveURL('/new');
    
    // Fill in required fields
    await page.fill('input[name="band.name"]', 'Test Band');
    await page.fill('input[name="event.name"]', 'Test Event');
    
    // Add a song
    await page.click('button i.add.icon');
    await page.fill('input[name="playings[0].title"]', 'Test Song');
    
    // Submit
    await page.click('button:has-text("Submit")');
    
    // Verify successful submission by checking URL
    await page.waitForURL(/\/show\/test-setlist-id-12345/);
    
    // Wait for success page and image generation to complete
    await waitForSetlistSuccess(page);
    
    // Verify menu options are available
    await expect(page.locator('text=edit')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.click('i.gamepad.icon');
    await expect(page).toHaveURL('/new');
    
    // Try submitting empty form
    await page.click('button:has-text("Submit")');
    await expect(page).toHaveURL('/new');
    
    // Fill only band name
    await page.fill('input[name="band.name"]', 'Test Band');
    await page.click('button:has-text("Submit")');
    await expect(page).toHaveURL('/new');
    
    // Add event name but no songs
    await page.fill('input[name="event.name"]', 'Test Event');
    await page.click('button:has-text("Submit")');
    await expect(page).toHaveURL('/new');
  });

  test('should handle basic navigation and form interactions', async ({ page }) => {
    // Verify home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('i.gamepad.icon')).toBeVisible();
    
    // Navigate to form
    await page.click('i.gamepad.icon');
    await expect(page).toHaveURL('/new');
    
    // Verify form elements exist and work
    await expect(page.locator('input[name="band.name"]')).toBeVisible();
    await expect(page.locator('input[name="event.name"]')).toBeVisible();
    await expect(page.locator('button i.add.icon')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
    await expect(page.locator('.dropdown')).toBeVisible();
    
    // Test form input
    await page.fill('input[name="band.name"]', 'Test Input');
    await page.fill('input[name="event.name"]', 'Test Event Input');
    
    await expect(page.locator('input[name="band.name"]')).toHaveValue('Test Input');
    await expect(page.locator('input[name="event.name"]')).toHaveValue('Test Event Input');
    
    // Test song addition
    await page.click('button i.add.icon');
    const songInput = page.locator('input[name="playings[0].title"]');
    await expect(songInput).toBeVisible();
    
    await songInput.fill('Test Song Input');
    await expect(songInput).toHaveValue('Test Song Input');
  });

  test('should handle multiple songs', async ({ page }) => {
    await page.click('i.gamepad.icon');
    await expect(page).toHaveURL('/new');
    
    // Fill basic info
    await page.fill('input[name="band.name"]', 'Multi Band');
    await page.fill('input[name="event.name"]', 'Multi Event');
    
    // Add three songs
    await page.click('button i.add.icon');
    await page.fill('input[name="playings[0].title"]', 'Song 1');
    
    await page.click('button i.add.icon');
    await page.fill('input[name="playings[1].title"]', 'Song 2');
    
    await page.click('button i.add.icon');
    await page.fill('input[name="playings[2].title"]', 'Song 3');
    
    // Verify all songs are in form
    await expect(page.locator('input[name="playings[0].title"]')).toHaveValue('Song 1');
    await expect(page.locator('input[name="playings[1].title"]')).toHaveValue('Song 2');
    await expect(page.locator('input[name="playings[2].title"]')).toHaveValue('Song 3');
    
    // Submit and verify success
    await page.click('button:has-text("Submit")');
    await page.waitForURL(/\/show\/test-setlist-id-12345/);
    
    // Wait for success page and image generation to complete
    await waitForSetlistSuccess(page);
  });

  test('should handle theme dropdown', async ({ page }) => {
    await page.click('i.gamepad.icon');
    await expect(page).toHaveURL('/new');
    
    // Fill required fields
    await page.fill('input[name="band.name"]', 'Theme Band');
    await page.fill('input[name="event.name"]', 'Theme Event');
    await page.click('button i.add.icon');
    await page.fill('input[name="playings[0].title"]', 'Theme Song');
    
    // Interact with dropdown
    const dropdown = page.locator('.dropdown');
    await expect(dropdown).toBeVisible();
    await dropdown.click();
    
    // Submit
    await page.click('button:has-text("Submit")');
    await page.waitForURL(/\/show\/test-setlist-id-12345/);
    
    // Verify success by checking we reached show page
    await expect(page.locator('h1')).toContainText('Setlist Generated !');
    
    // Wait for setlist image to be fully generated and loaded
    await waitForSetlistImageGeneration(page);
  });
});