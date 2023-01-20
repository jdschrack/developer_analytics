export function formatDate(date: Date | string | undefined): string {
  if (date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  return '';
}

export function dateDiff(start: Date, end: Date): number {
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}