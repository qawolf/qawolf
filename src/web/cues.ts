type Cue = {
  level: 'ancestor' | 'target';
  type: 'attribute' | 'class' | 'tag';
  value: string;
};

type Selector = {
  name: 'css' | 'text';
  body: string;
};

export const buildCues = (target: HTMLElement) => {
  // class: separate per class
  // tag: include n-th of type
  return [];
};

export const buildSelectorForCues = (cues: Cue[]): Selector[] => {
  // TODO combine classes, then everything else with spaces
  //  { name: 'css', body: '.class.class' };

  // [ancestor..., target]
  return [];
};
