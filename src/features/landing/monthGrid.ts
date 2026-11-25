export function monthGrid(year: number, month: number) {
  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const length = Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length }, (_, index) => {
    const date = new Date(Date.UTC(year, month, index - offset + 1));
    return { isoDate: date.toISOString().slice(0, 10), day: date.getUTCDate(), inMonth: date.getUTCMonth() === month };
  });
}
