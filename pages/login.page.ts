import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { AppConfig } from '../config/app.config.js';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#kc-login');
    this.errorAlert = page.locator(
      '#input-error, .alert-error, .pf-c-alert.pf-m-danger, #input-error-email, #input-error-username',
    );
  }

  /**
   * Navigates to the login page and waits for the username input anchor to be visible.
   */
  async navigate(): Promise<void> {
    await this.goto('/');
    await this.usernameInput.waitFor({
      state: 'visible',
      timeout: AppConfig.timeouts.action,
    });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.loginButton.click();

    // Wait for either the password input or an error indicator to appear
    await Promise.race([
      this.passwordInput.waitFor({ state: 'visible', timeout: AppConfig.timeouts.action }),
      this.errorAlert.waitFor({ state: 'visible', timeout: AppConfig.timeouts.action }),
    ]).catch(() => {});

    // If an error is visible after entering username, abort the remaining flow
    if (await this.errorAlert.isVisible()) {
      return;
    }

    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorAlert.isVisible()) {
      return await this.errorAlert.innerText();
    }
    return null;
  }
}
