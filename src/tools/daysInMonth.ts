

export function daysInMonth(month: number, year: number) {
	return new Date(year, month, 1, 0).getDate();
}
