import { loadFixtures } from '../loadFixtures';
import { buildPressSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildPressSteps', () => {
  it('pressing Enter with focus on non-input creates a press step', async () => {
    const pressEnterWithBodyFocus = await loadFixtures('pressEnterWithBodyFocus');

    const steps = buildPressSteps(pressEnterWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Enter");
  });

  it('pressing Enter with focus on text input creates a press step', async () => {
    const pressEnterWithTextInputFocus = await loadFixtures('pressEnterWithTextInputFocus');

    const steps = buildPressSteps(pressEnterWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Enter");
  });

  it('pressing Enter with focus on textarea does not create a press step', async () => {
    const pressEnterWithTextareaFocus = await loadFixtures('pressEnterWithTextareaFocus');

    const steps = buildPressSteps(pressEnterWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Enter with focus on contenteditable element does not create a press step', async () => {
    const pressEnterWithContentEditableFocus = await loadFixtures('pressEnterWithContentEditableFocus');

    const steps = buildPressSteps(pressEnterWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Tab with focus on non-input creates a press step', async () => {
    const pressTabWithBodyFocus = await loadFixtures('pressTabWithBodyFocus');

    const steps = buildPressSteps(pressTabWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Tab");
  });

  it('pressing Tab with focus on text input creates a press step', async () => {
    const pressTabWithTextInputFocus = await loadFixtures('pressTabWithTextInputFocus');

    const steps = buildPressSteps(pressTabWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Tab");
  });

  it('pressing Tab with focus on textarea creates a press step', async () => {
    const pressTabWithTextareaFocus = await loadFixtures('pressTabWithTextareaFocus');

    const steps = buildPressSteps(pressTabWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Tab");
  });

  it('pressing Tab with focus on contenteditable element creates a press step', async () => {
    const pressTabWithContentEditableFocus = await loadFixtures('pressTabWithContentEditableFocus');

    const steps = buildPressSteps(pressTabWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Tab");
  });

  it('pressing Escape with focus on non-input creates a press step', async () => {
    const pressEscapeWithBodyFocus = await loadFixtures('pressEscapeWithBodyFocus');

    const steps = buildPressSteps(pressEscapeWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Escape");
  });

  it('pressing Escape with focus on text input creates a press step', async () => {
    const pressEscapeWithTextInputFocus = await loadFixtures('pressEscapeWithTextInputFocus');

    const steps = buildPressSteps(pressEscapeWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Escape");
  });

  it('pressing Escape with focus on textarea creates a press step', async () => {
    const pressEscapeWithTextareaFocus = await loadFixtures('pressEscapeWithTextareaFocus');

    const steps = buildPressSteps(pressEscapeWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Escape");
  });

  it('pressing Escape with focus on contenteditable element creates a press step', async () => {
    const pressEscapeWithContentEditableFocus = await loadFixtures('pressEscapeWithContentEditableFocus');

    const steps = buildPressSteps(pressEscapeWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Escape");
  });

  it('pressing a letter with focus on non-input does not create a press step', async () => {
    const pressKeyWithBodyFocus = await loadFixtures('pressKeyWithBodyFocus');

    const steps = buildPressSteps(pressKeyWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing a letter with focus on text input does not create a press step', async () => {
    const pressKeyWithTextInputFocus = await loadFixtures('pressKeyWithTextInputFocus');

    const steps = buildPressSteps(pressKeyWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing a letter with focus on textarea does not create a press step', async () => {
    const pressKeyWithTextareaFocus = await loadFixtures('pressKeyWithTextareaFocus');

    const steps = buildPressSteps(pressKeyWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing a letter with focus on contenteditable element does not create a press step', async () => {
    const pressKeyWithContentEditableFocus = await loadFixtures('pressKeyWithContentEditableFocus');

    const steps = buildPressSteps(pressKeyWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Spacebar with focus on non-input does not create a press step', async () => {
    const pressSpacebarWithBodyFocus = await loadFixtures('pressSpacebarWithBodyFocus');

    const steps = buildPressSteps(pressSpacebarWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Spacebar with focus on text input does not create a press step', async () => {
    const pressSpacebarWithTextInputFocus = await loadFixtures('pressSpacebarWithTextInputFocus');

    const steps = buildPressSteps(pressSpacebarWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Spacebar with focus on textarea does not create a press step', async () => {
    const pressSpacebarWithTextareaFocus = await loadFixtures('pressSpacebarWithTextareaFocus');

    const steps = buildPressSteps(pressSpacebarWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Spacebar with focus on contenteditable element does not create a press step', async () => {
    const pressSpacebarWithContentEditableFocus = await loadFixtures('pressSpacebarWithContentEditableFocus');

    const steps = buildPressSteps(pressSpacebarWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowDown with focus on non-input creates a press step', async () => {
    const pressArrowDownWithBodyFocus = await loadFixtures('pressArrowDownWithBodyFocus');

    const steps = buildPressSteps(pressArrowDownWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("ArrowDown");
  });

  it('pressing ArrowDown with focus on text input does not create a press step', async () => {
    const pressArrowDownWithTextInputFocus = await loadFixtures('pressArrowDownWithTextInputFocus');

    const steps = buildPressSteps(pressArrowDownWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowDown with focus on textarea does not create a press step', async () => {
    const pressArrowDownWithTextareaFocus = await loadFixtures('pressArrowDownWithTextareaFocus');

    const steps = buildPressSteps(pressArrowDownWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowDown with focus on contenteditable element does not create a press step', async () => {
    const pressArrowDownWithContentEditableFocus = await loadFixtures('pressArrowDownWithContentEditableFocus');

    const steps = buildPressSteps(pressArrowDownWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowLeft with focus on non-input creates a press step', async () => {
    const pressArrowLeftWithBodyFocus = await loadFixtures('pressArrowLeftWithBodyFocus');

    const steps = buildPressSteps(pressArrowLeftWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("ArrowLeft");
  });

  it('pressing ArrowLeft with focus on text input does not create a press step', async () => {
    const pressArrowLeftWithTextInputFocus = await loadFixtures('pressArrowLeftWithTextInputFocus');

    const steps = buildPressSteps(pressArrowLeftWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowLeft with focus on textarea does not create a press step', async () => {
    const pressArrowLeftWithTextareaFocus = await loadFixtures('pressArrowLeftWithTextareaFocus');

    const steps = buildPressSteps(pressArrowLeftWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowLeft with focus on contenteditable element does not create a press step', async () => {
    const pressArrowLeftWithContentEditableFocus = await loadFixtures('pressArrowLeftWithContentEditableFocus');

    const steps = buildPressSteps(pressArrowLeftWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowRight with focus on non-input creates a press step', async () => {
    const pressArrowRightWithBodyFocus = await loadFixtures('pressArrowRightWithBodyFocus');

    const steps = buildPressSteps(pressArrowRightWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("ArrowRight");
  });

  it('pressing ArrowRight with focus on text input does not create a press step', async () => {
    const pressArrowRightWithTextInputFocus = await loadFixtures('pressArrowRightWithTextInputFocus');

    const steps = buildPressSteps(pressArrowRightWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowRight with focus on textarea does not create a press step', async () => {
    const pressArrowRightWithTextareaFocus = await loadFixtures('pressArrowRightWithTextareaFocus');

    const steps = buildPressSteps(pressArrowRightWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowRight with focus on contenteditable element does not create a press step', async () => {
    const pressArrowRightWithContentEditableFocus = await loadFixtures('pressArrowRightWithContentEditableFocus');

    const steps = buildPressSteps(pressArrowRightWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowUp with focus on non-input creates a press step', async () => {
    const pressArrowUpWithBodyFocus = await loadFixtures('pressArrowUpWithBodyFocus');

    const steps = buildPressSteps(pressArrowUpWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("ArrowUp");
  });

  it('pressing ArrowUp with focus on text input does not create a press step', async () => {
    const pressArrowUpWithTextInputFocus = await loadFixtures('pressArrowUpWithTextInputFocus');

    const steps = buildPressSteps(pressArrowUpWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowUp with focus on textarea does not create a press step', async () => {
    const pressArrowUpWithTextareaFocus = await loadFixtures('pressArrowUpWithTextareaFocus');

    const steps = buildPressSteps(pressArrowUpWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing ArrowUp with focus on contenteditable element does not create a press step', async () => {
    const pressArrowUpWithContentEditableFocus = await loadFixtures('pressArrowUpWithContentEditableFocus');

    const steps = buildPressSteps(pressArrowUpWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Backspace with focus on non-input creates a press step', async () => {
    const pressBackspaceWithBodyFocus = await loadFixtures('pressBackspaceWithBodyFocus');

    const steps = buildPressSteps(pressBackspaceWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Backspace");
  });

  it('pressing Backspace with focus on text input does not create a press step', async () => {
    const pressBackspaceWithTextInputFocus = await loadFixtures('pressBackspaceWithTextInputFocus');

    const steps = buildPressSteps(pressBackspaceWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Backspace with focus on textarea does not create a press step', async () => {
    const pressBackspaceWithTextareaFocus = await loadFixtures('pressBackspaceWithTextareaFocus');

    const steps = buildPressSteps(pressBackspaceWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Backspace with focus on contenteditable element does not create a press step', async () => {
    const pressBackspaceWithContentEditableFocus = await loadFixtures('pressBackspaceWithContentEditableFocus');

    const steps = buildPressSteps(pressBackspaceWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Delete with focus on non-input creates a press step', async () => {
    const pressDeleteWithBodyFocus = await loadFixtures('pressDeleteWithBodyFocus');

    const steps = buildPressSteps(pressDeleteWithBodyFocus.events as ElementEvent[]);

    expect(steps.length).toBe(1);
    expect(steps[0].value).toBe("Delete");
  });

  it('pressing Delete with focus on text input does not create a press step', async () => {
    const pressDeleteWithTextInputFocus = await loadFixtures('pressDeleteWithTextInputFocus');

    const steps = buildPressSteps(pressDeleteWithTextInputFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Delete with focus on textarea does not create a press step', async () => {
    const pressDeleteWithTextareaFocus = await loadFixtures('pressDeleteWithTextareaFocus');

    const steps = buildPressSteps(pressDeleteWithTextareaFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });

  it('pressing Delete with focus on contenteditable element does not create a press step', async () => {
    const pressDeleteWithContentEditableFocus = await loadFixtures('pressDeleteWithContentEditableFocus');

    const steps = buildPressSteps(pressDeleteWithContentEditableFocus.events as ElementEvent[]);

    expect(steps.length).toBe(0);
  });
});
