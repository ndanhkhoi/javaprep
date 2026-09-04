import { addDays, type IsoDate } from '../srs/date';

/**
 * Số ngày học liên tiếp tính tới hôm nay.
 *
 * Chưa học hôm nay **không** làm đứt streak: người dùng vẫn còn cả ngày để học.
 * Vì thế nếu hôm nay chưa có trong log, ta bắt đầu đếm ngược từ hôm qua.
 */
export function streak(studyLog: readonly IsoDate[], today: IsoDate): number {
	if (studyLog.length === 0) return 0;

	const days = new Set(studyLog);
	let cursor = days.has(today) ? today : addDays(today, -1);
	if (!days.has(cursor)) return 0;

	let count = 0;
	while (days.has(cursor)) {
		count += 1;
		cursor = addDays(cursor, -1);
	}
	return count;
}

/** Streak dài nhất từng đạt được — dùng để hiện kỷ lục cá nhân. */
export function longestStreak(studyLog: readonly IsoDate[]): number {
	const days = [...new Set(studyLog)].sort();
	let best = 0;
	let current = 0;
	let previous: IsoDate | null = null;

	for (const day of days) {
		current = previous !== null && addDays(previous, 1) === day ? current + 1 : 1;
		if (current > best) best = current;
		previous = day;
	}
	return best;
}
