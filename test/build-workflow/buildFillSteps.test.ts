import { loadFixtures } from '../loadFixtures';
import { buildFillSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildFillSteps', () => {
  it('clicking and typing in a text input creates a single fill step', async () => {
    const fillTextInput = await loadFixtures('fillTextInput');

    const steps = buildFillSteps(fillTextInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and editing existing text in a text input creates a single fill step', async () => {
    const fillExistingTextInput = await loadFixtures('fillExistingTextInput');

    const steps = buildFillSteps(fillExistingTextInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a textarea creates a single fill step', async () => {
    const fillTextarea = await loadFixtures('fillTextarea');

    const steps = buildFillSteps(fillTextarea.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a contenteditable creates a single fill step', async () => {
    const fillContentEditable = await loadFixtures('fillContentEditable');

    const steps = buildFillSteps(fillContentEditable.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and editing existing text in a contenteditable creates a single fill step', async () => {
    const fillExistingContentEditable = await loadFixtures('fillExistingContentEditable');

    const steps = buildFillSteps(fillExistingContentEditable.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a search input creates a single fill step', async () => {
    const fillSearchInput = await loadFixtures('fillSearchInput');

    const steps = buildFillSteps(fillSearchInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser date input creates a single fill step', async () => {
    const fillDateInput = await loadFixtures('fillDateInput');

    const steps = buildFillSteps(fillDateInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser datetime-local input creates a single fill step', async () => {
    const fillDateTimeLocalInput = await loadFixtures('fillDateTimeLocalInput');

    const steps = buildFillSteps(fillDateTimeLocalInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser time input creates a single fill step', async () => {
    const fillTimeInput = await loadFixtures('fillTimeInput');

    const steps = buildFillSteps(fillTimeInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser week input creates a single fill step', async () => {
    const fillWeekInput = await loadFixtures('fillWeekInput');

    const steps = buildFillSteps(fillWeekInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser month input creates a single fill step', async () => {
    const fillMonthInput = await loadFixtures('fillMonthInput');

    const steps = buildFillSteps(fillMonthInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser number input creates a single fill step', async () => {
    const fillNumberInput = await loadFixtures('fillNumberInput');

    const steps = buildFillSteps(fillNumberInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser email input creates a single fill step', async () => {
    const fillEmailInput = await loadFixtures('fillEmailInput');

    const steps = buildFillSteps(fillEmailInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser password input creates a single fill step', async () => {
    const fillPasswordInput = await loadFixtures('fillPasswordInput');

    const steps = buildFillSteps(fillPasswordInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser phone number input creates a single fill step', async () => {
    const fillPhoneInput = await loadFixtures('fillPhoneInput');

    const steps = buildFillSteps(fillPhoneInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking and typing in a browser url input creates a single fill step', async () => {
    const fillUrlInput = await loadFixtures('fillUrlInput');

    const steps = buildFillSteps(fillUrlInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('picking a color from a browser color input creates a single fill step', async () => {
    const pickColorInput = await loadFixtures('pickColorInput');

    const steps = buildFillSteps(pickColorInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('picking a number on a browser range input creates a single fill step', async () => {
    const pickRangeInput = await loadFixtures('pickRangeInput');

    const steps = buildFillSteps(pickRangeInput.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toMatchSnapshot();
  });

  it('clicking a checkbox does not create a fill step', async () => {
    const selectCheckboxInput = await loadFixtures('selectCheckboxInput');

    const steps = buildFillSteps(selectCheckboxInput.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('clicking a radio button does not create a fill step ', async () => {
    const selectRadioInput = await loadFixtures('selectRadioInput');

    const steps = buildFillSteps(selectRadioInput.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });
});
