import { test, expect } from 'playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Drawith/);
});

test('can login via /api/auth', async ({ request }) => {
  const response = await request.post('/api/auth/sign-in/email', {
    data: {
      email: 'q@q.ca',
      password: 'qqqqqqqq',
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.user).toBeTruthy();
});