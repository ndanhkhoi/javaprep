import type { CardState, Difficulty, Question } from '../types';
import type { IsoDate } from './date';
import { isDue } from './sm2';

export type SessionInput = {
	questions: Question[];
	cards: Record<string, CardState>;
	today: IsoDate;
	dailyNewLimit: number;
	/** null = học tất cả chủ đề. */
	topicFilter?: string | null;
};

const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/**
 * Dựng hàng đợi cho một phiên flashcard: thẻ đến hạn + tối đa `dailyNewLimit` thẻ mới,
 * thẻ mới được xen kẽ đều vào giữa thay vì dồn cuối (tránh cảm giác "dồn toa").
 *
 * Hàm thuần, tất định — cùng đầu vào luôn cho cùng thứ tự, nên test được và
 * user rời app rồi quay lại vẫn thấy phiên quen thuộc.
 */
export function buildSession({
	questions,
	cards,
	today,
	dailyNewLimit,
	topicFilter = null
}: SessionInput): Question[] {
	const scope = topicFilter ? questions.filter((q) => q.topic === topicFilter) : questions;

	const due = scope
		.filter((q) => {
			const state = cards[q.id];
			return state !== undefined && isDue(state, today);
		})
		// Quá hạn lâu nhất lên trước — đó là thẻ có nguy cơ quên cao nhất.
		.sort((a, b) => cards[a.id].due.localeCompare(cards[b.id].due));

	const fresh = scope
		.filter((q) => cards[q.id] === undefined || cards[q.id].due === '')
		.sort(
			(a, b) =>
				DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
				a.id.localeCompare(b.id)
		)
		.slice(0, Math.max(0, dailyNewLimit));

	return interleave(due, fresh);
}

/**
 * Trộn `extra` vào `base` với khoảng cách đều. Giữ nguyên thứ tự tương đối của cả hai mảng.
 */
export function interleave<T>(base: T[], extra: T[]): T[] {
	if (extra.length === 0) return [...base];
	if (base.length === 0) return [...extra];

	const out: T[] = [];
	const step = base.length / extra.length;
	let nextExtra = 0;

	for (let i = 0; i < base.length; i += 1) {
		while (nextExtra < extra.length && nextExtra * step <= i) {
			out.push(extra[nextExtra]);
			nextExtra += 1;
		}
		out.push(base[i]);
	}
	while (nextExtra < extra.length) {
		out.push(extra[nextExtra]);
		nextExtra += 1;
	}
	return out;
}

/** Số thẻ đến hạn hôm nay trên toàn bộ bộ câu hỏi — dùng cho badge. */
export function countDue(
	cards: Record<string, CardState>,
	questions: Question[],
	today: IsoDate
): number {
	return questions.reduce((n, q) => {
		const state = cards[q.id];
		return state !== undefined && isDue(state, today) ? n + 1 : n;
	}, 0);
}
