import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { AppConfig } from '../config/app.config.js';
import type { PracticeFormData } from '../test-data/practice/practice-form.data.js';

export const PRACTICE_PAGE_URL = 'https://testautomationpractice.blogspot.com/';

export class PracticePage extends BasePage {
  // GUI Elements Form
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressTextarea: Locator;
  readonly maleRadio: Locator;
  readonly femaleRadio: Locator;
  readonly countrySelect: Locator;
  readonly colorsSelect: Locator;
  readonly animalsSelect: Locator;

  // Alerts & Popups
  readonly alertButton: Locator;
  readonly confirmButton: Locator;
  readonly promptButton: Locator;
  readonly alertDemoText: Locator;

  // Actions & Widgets
  readonly field1Input: Locator;
  readonly field2Input: Locator;
  readonly copyTextButton: Locator;
  readonly draggable: Locator;
  readonly droppable: Locator;
  readonly hoverButton: Locator;
  readonly dropdownContent: Locator;

  // Date Pickers
  readonly datePicker1Input: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly dateRangeSubmitButton: Locator;
  readonly dateRangeResult: Locator;

  // Tables
  readonly productTable: Locator;
  readonly paginationList: Locator;

  constructor(page: Page) {
    super(page);

    // Form inputs
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.addressTextarea = page.locator('#textarea');
    this.maleRadio = page.locator('#male');
    this.femaleRadio = page.locator('#female');
    this.countrySelect = page.locator('#country');
    this.colorsSelect = page.locator('#colors');
    this.animalsSelect = page.locator('#animals');

    // Alerts
    this.alertButton = page.locator('#alertBtn');
    this.confirmButton = page.locator('#confirmBtn');
    this.promptButton = page.locator('#promptBtn');
    this.alertDemoText = page.locator('#demo');

    // Double click & drag
    this.field1Input = page.locator('#field1');
    this.field2Input = page.locator('#field2');
    this.copyTextButton = page.getByRole('button', { name: 'Copy Text' });
    this.draggable = page.locator('#draggable');
    this.droppable = page.locator('#droppable');

    // Hover
    this.hoverButton = page.locator('.dropbtn', { hasText: 'Point Me' });
    this.dropdownContent = page.locator('.dropdown-content');

    // Date range
    this.datePicker1Input = page.locator('#datepicker');
    this.startDateInput = page.locator('#start-date');
    this.endDateInput = page.locator('#end-date');
    this.dateRangeSubmitButton = page.locator('button.submit-btn', { hasText: 'Submit' });
    this.dateRangeResult = page.locator('#result');

    // Product Table
    this.productTable = page.locator('#productTable');
    this.paginationList = page.locator('#pagination');
  }

  /**
   * Navigates to the practice page and waits for the name input anchor to be visible.
   */
  async navigate(): Promise<void> {
    await this.goto(PRACTICE_PAGE_URL);
    await this.nameInput.waitFor({
      state: 'visible',
      timeout: AppConfig.timeouts.action,
    });
  }

  /**
   * Fills the GUI Elements form with user information, radio button, checkboxes, and selects.
   */
  async fillForm(data: PracticeFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressTextarea.fill(data.address);

    if (data.gender === 'female') {
      await this.femaleRadio.check();
    } else {
      await this.maleRadio.check();
    }

    for (const day of data.days) {
      const checkbox = this.page.locator(`#${day}`);
      await checkbox.check();
    }

    await this.countrySelect.selectOption(data.country);

    if (data.colors.length > 0) {
      await this.colorsSelect.selectOption(data.colors);
    }
  }

  /**
   * Triggers a simple JavaScript alert and returns its message text.
   */
  async triggerSimpleAlert(): Promise<string> {
    let alertMessage = '';
    this.page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await this.alertButton.click();
    return alertMessage;
  }

  /**
   * Triggers a confirmation dialog and accepts or dismisses it.
   */
  async triggerConfirmAlert(accept: boolean): Promise<string> {
    this.page.once('dialog', async (dialog) => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });

    await this.confirmButton.click();
    await this.alertDemoText.waitFor({ state: 'visible', timeout: AppConfig.timeouts.action });
    return await this.alertDemoText.innerText();
  }

  /**
   * Triggers a prompt dialog with custom text.
   */
  async triggerPromptAlert(input: string): Promise<string> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(input);
    });

    await this.promptButton.click();
    await this.alertDemoText.waitFor({ state: 'visible', timeout: AppConfig.timeouts.action });
    return await this.alertDemoText.innerText();
  }

  /**
   * Double-clicks the Copy Text button and returns the copied value in field2.
   */
  async performDoubleClickCopy(newField1Value?: string): Promise<string> {
    if (newField1Value !== undefined) {
      await this.field1Input.fill(newField1Value);
    }
    await this.copyTextButton.dblclick();
    return await this.field2Input.inputValue();
  }

  /**
   * Drags the draggable card and drops it onto the droppable target.
   */
  async performDragAndDrop(): Promise<void> {
    await this.draggable.dragTo(this.droppable);
  }

  /**
   * Submits a date range and returns the calculated duration text.
   */
  async calculateDateRange(startDate: string, endDate: string): Promise<string> {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    await this.dateRangeSubmitButton.click();
    await this.dateRangeResult.waitFor({ state: 'visible', timeout: AppConfig.timeouts.action });
    return await this.dateRangeResult.innerText();
  }

  /**
   * Finds a product in the pagination table and checks its select checkbox.
   */
  async selectProduct(productName: string, pageNumber = 1): Promise<void> {
    if (pageNumber > 1) {
      const pageLink = this.paginationList.locator('a', { hasText: String(pageNumber) });
      await pageLink.click();
    }

    const row = this.productTable.locator('tbody tr', { hasText: productName });
    await row.waitFor({ state: 'visible', timeout: AppConfig.timeouts.action });
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.check();
  }
}
