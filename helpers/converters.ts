export function dateToString(date: Date): string {
    return date.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
}

export function convertHoursToMinutes(hours: number): number {
    return hours * 60;
}