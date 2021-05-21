import getInverseThemeMode from '../getInverseThemeMode';

describe('getInverseThemeMode', () => {
  it('returns the right inversed theme mode', () => {
    expect(getInverseThemeMode('dark')).toBe('light');
    expect(getInverseThemeMode('light')).toBe('dark');
  });
});
