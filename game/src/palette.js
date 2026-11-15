// The look plan - six values and accent colors for both teams
export const PALETTE = {
  canvas: '#0d1117',
  surface: '#161b22',
  hairline: '#30363d',
  ink: '#e6edf3',
  muted: '#8b949e',
  accent: '#f78166',
  ct: '#58a6ff',
  t: '#f78166',
  health: '#3fb950',
  armor: '#58a6ff',
  money: '#3fb950',
};

export function shade(name) {
  return PALETTE[name];
}