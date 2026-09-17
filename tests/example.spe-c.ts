import { test, expect } from 'playwright/test';

// test.use({
//   ignoreHTTPSErrors: true,
// });

// console.log("process.env.TEST_APP_URL", process.env.TEST_APP_URL);

test('has title', async ({ page }) => {
  const response = await page.goto('/');

  // console.log('status:', response?.status());
  // console.log('URL:', page.url());

  await expect(page).toHaveTitle(/Drawith/);
});

// test('can login via /api/auth', async ({ request }) => {
//   const response = await request.post('/api/auth/sign-in/email', {
//     data: {
//       email: 'q@q.ca',
//       password: 'qqqqqqqq',
//     },
//   });

//   expect(response.ok()).toBeTruthy();
//   const body = await response.json();
//   expect(body.user).toBeTruthy();
// });