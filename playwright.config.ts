import { defineConfig } from 'playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from ".env" file in the root directory
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  use: {
    // Access variables using process.env
    // baseURL: process.env.STAGING === '1' ? 'https://example.com' : 'https://example.com',
    baseURL: process.env.APP_URL,
  },
  reporter: 'line',
  outputDir: './.playwright-results',
});