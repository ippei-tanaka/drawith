import { defineConfig } from 'playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.DRAWITH_TEST_APP_URL,
  },
  reporter: 'line',
  outputDir: './.playwright-results',
});