import { describe, expect, it } from 'vitest';
import { monthGrid } from './monthGrid';

describe('Prévia mensal', () => {
  it('completa dezembro com os dias dos meses vizinhos sem lacunas', () => {
    const days = monthGrid(2026, 11);
    expect(days).toHaveLength(35);
    expect(days[0]).toEqual({ isoDate: '2026-11-29', day: 29, inMonth: false });
    expect(days[days.length - 1]).toEqual({ isoDate: '2027-01-02', day: 2, inMonth: false });
    expect(days.filter(day => day.inMonth)).toHaveLength(31);
    expect(days[3]).toEqual({ isoDate: '2026-12-02', day: 2, inMonth: true });
  });
});
