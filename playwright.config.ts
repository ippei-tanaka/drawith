// import { defineConfig } from 'playwright/test';

// console.log("process.env.APP_URL", process.env.APP_URL);

// export default defineConfig({
//   use: {
//     baseURL: process.env.APP_URL,
//     ignoreHTTPSErrors: true,
//   },
//   reporter: 'line',
//   outputDir: './.playwright-results',
// });


import { defineConfig } from 'playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://app:3000',
  },
});