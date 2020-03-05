// → keyboard.sendCharacter(char)
// ↓ keyboard.down(key)
// ↑ keyboard.up(key)
export type StrokeType = '→' | '↓' | '↑';

export type Stroke = {
  index: number;
  type: StrokeType;
  value: string;
};
