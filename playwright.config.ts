// import { defineConfig } from 'playwright/test';

// console.log("process.env.TEST_APP_URL", process.env.TEST_APP_URL);

// export default defineConfig({
//   use: {
//     baseURL: process.env.TEST_APP_URL,
//     ignoreHTTPSErrors: true,
//   },
//   reporter: 'line',
//   outputDir: './.playwright-results',
// });


import { defineConfig } from 'playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.TEST_APP_URL,
  },
  reporter: 'line',
  outputDir: './.playwright-results',
});