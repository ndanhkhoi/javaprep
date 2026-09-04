import type { Question, QuizStat } from '../types';
import { shuffle, type Rng } from './shuffle';

export type SelectInput = {
	questions: Question[];
	stats: Record<string, QuizStat>;
	count: number;
	/** null = mọi chủ đề. */
	topicFilter?: string | null;
	rng?: Rng;
};

/** Dưới ngưỡng này thì coi là câu user hay trả lời sai. */
const WEAK_ACCURACY = 0.5;

/**
 * Chọn câu cho một phiên quiz, ưu tiên chỗ user yếu:
 * 1. Câu đã làm nhưng tỉ lệ đúng < 50%.
 * 2. Câu chưa từng thấy.
 * 3. Phần còn lại.
 *
 * Trong mỗi nhóm thì xáo ngẫu nhiên để hai phiên liên tiếp không giống hệt nhau.
 */
export function selectQuizQuestions({
	questions,
	stats,
	count,
	topicFilter = null,
	rng = Math.random
}: SelectInput): Question[] {
	const scope = topicFilter ? questions.filter((q) => q.topic === topicFilter) : questions;

	const weak: Question[] = [];
	const unseen: Question[] = [];
	const rest: Question[] = [];

	for (const q of scope) {
		const stat = stats[q.id];
		if (!stat || stat.seen === 0) unseen.push(q);
		else if (stat.correct / stat.seen < WEAK_ACCURACY) weak.push(q);
		else rest.push(q);
	}

	return [...shuffle(weak, rng), ...shuffle(unseen, rng), ...shuffle(rest, rng)].slice(
		0,
		Math.max(0, count)
	);
}
