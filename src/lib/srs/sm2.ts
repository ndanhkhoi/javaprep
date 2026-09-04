import type { CardState, Grade } from '../types';
import { addDays, todayLocal, type IsoDate } from './date';

export const MIN_EF = 1.3;
export const INITIAL_EF = 2.5;
/** Trần interval: quá 1 năm thì lịch ôn mất ý nghĩa thực tế với bộ 100 câu. */
export const MAX_INTERVAL = 365;
/** Ngưỡng quy ước của Anki cho thẻ "đã thuộc" (mature card). */
export const MATURE_INTERVAL = 21;

export const NEW_CARD: CardState = {
	ef: INITIAL_EF,
	reps: 0,
	interval: 0,
	due: '',
	lapses: 0,
	lastGrade: null
};

export function newCard(): CardState {
	return { ...NEW_CARD };
}

/**
 * Một lần ôn theo SM-2 (SuperMemo 2, Wozniak 1987).
 *
 * Hàm thuần: không đọc đồng hồ, không đụng storage — `today` phải được truyền vào.
 * Ease factor được cập nhật cho MỌI grade kể cả khi fail, đúng thuật toán gốc.
 */
export function review(state: CardState, q: Grade, today: IsoDate = todayLocal()): CardState {
	const ef = Math.max(MIN_EF, state.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

	if (q < 3) {
		// Fail: reset chuỗi, ôn lại sau 1 ngày. `ef` đã giảm được giữ nguyên, không reset.
		return {
			ef,
			reps: 0,
			interval: 1,
			lapses: state.lapses + 1,
			lastGrade: q,
			due: addDays(today, 1)
		};
	}

	const reps = state.reps + 1;
	let interval: number;
	if (reps === 1) interval = 1;
	else if (reps === 2) interval = 6;
	else interval = Math.round(state.interval * ef);
	interval = Math.min(MAX_INTERVAL, Math.max(1, interval));

	return { ef, reps, interval, lapses: state.lapses, lastGrade: q, due: addDays(today, interval) };
}

/** Interval sẽ nhận được nếu chấm `q` — dùng để hiện nhãn trên nút trước khi bấm. */
export function previewInterval(state: CardState, q: Grade): number {
	return review(state, q, '2000-01-01').interval;
}

export function isDue(state: CardState, today: IsoDate): boolean {
	return state.due !== '' && state.due <= today;
}

export type MasteryLevel = 'new' | 'learning' | 'mature';

export function masteryLevel(state: CardState | undefined): MasteryLevel {
	// `due === ''` là dấu hiệu duy nhất của thẻ chưa từng ôn. Không dùng `reps === 0`:
	// thẻ vừa bị chấm "Quên" cũng có reps = 0 nhưng đã được học, phải tính là learning.
	if (!state || state.due === '') return 'new';
	return state.interval >= MATURE_INTERVAL ? 'mature' : 'learning';
}
