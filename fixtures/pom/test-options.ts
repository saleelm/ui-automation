import { mergeTests, expect } from '@playwright/test';
import { pomTest } from './page-object-fixture.js';
import { apiTest } from '../api/api-request-fixture.js';

export const test = mergeTests(pomTest, apiTest);
export { expect };
export { request } from '@playwright/test';
