import type { CardState, Question } from '../types';
import { masteryLevel } from '../srs/sm2';

export type MasteryBreakdown = {
	new: number;
	learning: number;
	mature: number;
	total: number;
};

function empty(total = 0): MasteryBreakdown {
	return { new: total, learning: 0, mature: 0, total };
}

export function masteryOf(
	questions: readonly Question[],
	cards: Record<string, CardState>
): MasteryBreakdown {
	const out = empty();
	for (const q of questions) {
		out.total += 1;
		out[masteryLevel(cards[q.id])] += 1;
	}
	return out;
}

/** Phân bố mức thành thạo theo từng chủ đề — dữ liệu cho stacked bar ở dashboard. */
export function masteryByTopic(
	questions: readonly Question[],
	cards: Record<string, CardState>
): Record<string, MasteryBreakdown> {
	const out: Record<string, MasteryBreakdown> = {};
	for (const q of questions) {
		const bucket = (out[q.topic] ??= empty());
		bucket.total += 1;
		bucket[masteryLevel(cards[q.id])] += 1;
	}
	return out;
}
