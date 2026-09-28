import { expect, test } from '../../fixtures/pom/test-options.js';
import { Tag } from '../../enums/tags.enum.js';
import { buildPracticeFormData } from '../../test-data/practice/practice-form.data.js';

test.describe('Practice Automation Page', () => {
  // External public practice site: bypass auth and onboarding gates
  test.use({
    storageState: { cookies: [], origins: [] },
    authSessionMode: 'skip',
    onboardingBypassMode: 'skip',
  });

  test.beforeEach(async ({ practicePage }) => {
    await practicePage.navigate();
  });

  test(
    'TC01 should fill and verify GUI elements form with radio, checkboxes, and dropdowns',
    { tag: [Tag.Smoke, Tag.Sanity] },
    async ({ practicePage }) => {
      const formData = buildPracticeFormData({
        name: 'Alice Cooper',
        gender: 'female',
        days: ['monday', 'thursday'],
        country: 'germany',
        colors: ['blue', 'yellow'],
      });

      await test.step('Given the user fills the GUI form with test data', async () => {
        await practicePage.fillForm(formData);
      });

      await test.step('Then the input fields and selections should be accurately retained', async () => {
        await expect(practicePage.nameInput).toHaveValue(formData.name);
        await expect(practicePage.emailInput).toHaveValue(formData.email);
        await expect(practicePage.phoneInput).toHaveValue(formData.phone);
        await expect(practicePage.addressTextarea).toHaveValue(formData.address);

        await expect(practicePage.femaleRadio).toBeChecked();
        await expect(practicePage.maleRadio).not.toBeChecked();

        await expect(practicePage.page.locator('#monday')).toBeChecked();
        await expect(practicePage.page.locator('#thursday')).toBeChecked();
        await expect(practicePage.page.locator('#sunday')).not.toBeChecked();

        await expect(practicePage.countrySelect).toHaveValue('germany');
        await expect(practicePage.colorsSelect).toHaveValues(['blue', 'yellow']);
      });
    },
  );

  test(
    'TC02 should handle simple, confirm, and prompt JavaScript alert dialogs',
    { tag: [Tag.Sanity] },
    async ({ practicePage }) => {
      await test.step('When the user triggers a simple alert, verify dialog text', async () => {
        const message = await practicePage.triggerSimpleAlert();
        expect(message).toBe('I am an alert box!');
      });

      await test.step('When the user triggers a confirmation alert and accepts it', async () => {
        const confirmResult = await practicePage.triggerConfirmAlert(true);
        expect(confirmResult).toBe('You pressed OK!');
      });

      await test.step('When the user triggers a confirmation alert and cancels it', async () => {
        const cancelResult = await practicePage.triggerConfirmAlert(false);
        expect(cancelResult).toBe('You pressed Cancel!');
      });

      await test.step('When the user triggers a prompt alert with input name', async () => {
        const promptResult = await practicePage.triggerPromptAlert('Antigravity');
        expect(promptResult).toBe('Hello Antigravity! How are you today?');
      });
    },
  );

  test(
    'TC03 should copy text between fields on double clicking button',
    { tag: [Tag.Regression] },
    async ({ practicePage }) => {
      const customText = 'Playwright Test Automation';

      await test.step('When the user double-clicks the Copy Text button', async () => {
        const copiedValue = await practicePage.performDoubleClickCopy(customText);
        expect(copiedValue).toBe(customText);
      });

      await test.step('Then field2 should contain the identical text from field1', async () => {
        await expect(practicePage.field2Input).toHaveValue(customText);
      });
    },
  );

  test(
    'TC04 should drag element and drop into target container',
    { tag: [Tag.Regression] },
    async ({ practicePage }) => {
      await test.step('Given draggable and droppable elements are visible', async () => {
        await expect(practicePage.draggable).toBeVisible();
        await expect(practicePage.droppable).toBeVisible();
      });

      await test.step('When the user drags the element to the droppable target', async () => {
        await practicePage.performDragAndDrop();
      });

      await test.step('Then the droppable container should indicate dropped state', async () => {
        await expect(practicePage.droppable).toHaveText('Dropped!');
      });
    },
  );

  test(
    'TC05 should select date range and calculate day duration',
    { tag: [Tag.Regression] },
    async ({ practicePage }) => {
      await test.step('When the user inputs a 5-day date range and submits', async () => {
        const result = await practicePage.calculateDateRange('2026-05-01', '2026-05-06');
        expect(result).toBe('You selected a range of 5 days.');
      });

      await test.step('Then the result banner should confirm the selected duration', async () => {
        await expect(practicePage.dateRangeResult).toContainText('5 days');
      });
    },
  );

  test(
    'TC06 should paginate and select items in product table',
    { tag: [Tag.Regression] },
    async ({ practicePage }) => {
      await test.step('When the user navigates to page 2 and selects Action Camera', async () => {
        await practicePage.selectProduct('Action Camera', 2);
      });

      await test.step('Then the corresponding product checkbox should be checked', async () => {
        const productRow = practicePage.productTable.locator('tbody tr', {
          hasText: 'Action Camera',
        });
        await expect(productRow.locator('input[type="checkbox"]')).toBeChecked();
      });
    },
  );

  test(
    'TC07 should hover over dropdown button and reveal menu items',
    { tag: [Tag.Regression] },
    async ({ practicePage }) => {
      await test.step('When the user hovers over the Point Me button', async () => {
        await practicePage.hoverButton.hover();
      });

      await test.step('Then dropdown links should become visible', async () => {
        await expect(
          practicePage.dropdownContent.locator('a', { hasText: 'Laptops' }),
        ).toBeVisible();
      });
    },
  );
});
