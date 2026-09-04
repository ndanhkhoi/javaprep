import { describe, expect, it } from 'vitest';
import type { CardState, Difficulty, Question } from '../types';
import { newCard } from './sm2';
import { buildSession, countDue, interleave } from './queue';

const TODAY = '2026-09-05';

function q(id: string, topic = 'java-core', difficulty: Difficulty = 'medium'): Question {
	return {
		id,
		topic,
		difficulty,
		question: `Q ${id}`,
		answerShort: 'a',
		answerLong: 'a',
		tags: [],
		quiz: { options: ['a', 'b', 'c', 'd'], correct: 0, explanation: 'e' }
	};
}

function state(due: string, over: Partial<CardState> = {}): CardState {
	return { ...newCard(), reps: 1, interval: 1, due, ...over };
}

describe('buildSession — chọn thẻ đến hạn', () => {
	const questions = [q('a'), q('b'), q('c')];

	it('lấy thẻ due hôm qua và hôm nay, bỏ thẻ due ngày mai', () => {
		const cards = {
			a: state('2026-09-04'),
			b: state('2026-09-05'),
			c: state('2026-09-06')
		};
		const ids = buildSession({ questions, cards, today: TODAY, dailyNewLimit: 0 }).map((x) => x.id);
		expect(ids).toEqual(['a', 'b']);
	});

	it('thẻ quá hạn lâu nhất được xếp trước', () => {
		const cards = {
			a: state('2026-09-04'),
			b: state('2026-08-01'),
			c: state('2026-09-05')
		};
		const ids = buildSession({ questions, cards, today: TODAY, dailyNewLimit: 0 }).map((x) => x.id);
		expect(ids).toEqual(['b', 'a', 'c']);
	});
});

describe('buildSession — thẻ mới', () => {
	it('không vượt quá dailyNewLimit', () => {
		const questions = Array.from({ length: 30 }, (_, i) => q(`n${i}`));
		const out = buildSession({ questions, cards: {}, today: TODAY, dailyNewLimit: 10 });
		expect(out).toHaveLength(10);
	});

	it('dailyNewLimit = 0 và không có thẻ due -> phiên rỗng', () => {
		expect(buildSession({ questions: [q('a')], cards: {}, today: TODAY, dailyNewLimit: 0 })).toEqual(
			[]
		);
	});

	it('dailyNewLimit âm được coi như 0, không ném lỗi', () => {
		expect(
			buildSession({ questions: [q('a')], cards: {}, today: TODAY, dailyNewLimit: -5 })
		).toEqual([]);
	});

	it('ưu tiên easy trước medium trước hard', () => {
		const questions = [q('h', 'java-core', 'hard'), q('e', 'java-core', 'easy'), q('m')];
		const ids = buildSession({ questions, cards: {}, today: TODAY, dailyNewLimit: 3 }).map(
			(x) => x.id
		);
		expect(ids).toEqual(['e', 'm', 'h']);
	});

	it('thẻ có state nhưng due rỗng vẫn được coi là mới', () => {
		const cards = { a: newCard() };
		const out = buildSession({ questions: [q('a')], cards, today: TODAY, dailyNewLimit: 5 });
		expect(out.map((x) => x.id)).toEqual(['a']);
	});
});

describe('buildSession — trộn thẻ mới vào giữa', () => {
	it('thẻ mới không bị dồn hết về cuối', () => {
		const questions = [
			...Array.from({ length: 6 }, (_, i) => q(`d${i}`)),
			...Array.from({ length: 3 }, (_, i) => q(`n${i}`))
		];
		const cards = Object.fromEntries(
			Array.from({ length: 6 }, (_, i) => [`d${i}`, state('2026-09-01')])
		);
		const ids = buildSession({ questions, cards, today: TODAY, dailyNewLimit: 3 }).map((x) => x.id);

		expect(ids).toHaveLength(9);
		const lastThree = ids.slice(-3);
		expect(lastThree.every((id) => id.startsWith('n'))).toBe(false);
		// Thẻ mới đầu tiên phải nằm ở nửa đầu hàng đợi.
		expect(ids.findIndex((id) => id.startsWith('n'))).toBeLessThan(3);
	});
});

describe('buildSession — lọc theo chủ đề', () => {
	it('chỉ trả về câu thuộc topic được chọn', () => {
		const questions = [q('a', 'java-core'), q('b', 'spring-core'), q('c', 'java-core')];
		const ids = buildSession({
			questions,
			cards: {},
			today: TODAY,
			dailyNewLimit: 10,
			topicFilter: 'java-core'
		}).map((x) => x.id);
		expect(ids).toEqual(['a', 'c']);
	});

	it('topic không tồn tại -> phiên rỗng, không ném lỗi', () => {
		expect(
			buildSession({
				questions: [q('a')],
				cards: {},
				today: TODAY,
				dailyNewLimit: 10,
				topicFilter: 'khong-ton-tai'
			})
		).toEqual([]);
	});
});

describe('interleave', () => {
	it('mảng phụ rỗng -> giữ nguyên mảng chính', () => {
		expect(interleave([1, 2, 3], [])).toEqual([1, 2, 3]);
	});

	it('mảng chính rỗng -> trả về mảng phụ', () => {
		expect(interleave([], [1, 2])).toEqual([1, 2]);
	});

	it('giữ đủ phần tử và không nhân bản', () => {
		const out = interleave([1, 2, 3, 4], [10, 20]);
		expect(out.slice().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 10, 20]);
	});

	it('giữ thứ tự tương đối của cả hai mảng', () => {
		const out = interleave(['a', 'b', 'c', 'd'], ['x', 'y']);
		expect(out.filter((v) => v < 'e')).toEqual(['a', 'b', 'c', 'd']);
		expect(out.filter((v) => v > 'e')).toEqual(['x', 'y']);
	});

	it('mảng phụ dài hơn mảng chính vẫn không mất phần tử', () => {
		const out = interleave([1], [10, 20, 30]);
		expect(out).toHaveLength(4);
	});
});

describe('countDue', () => {
	it('đếm đúng số thẻ đến hạn, bỏ qua thẻ chưa học', () => {
		const questions = [q('a'), q('b'), q('c')];
		const cards = { a: state('2026-09-01'), b: state('2026-12-01') };
		expect(countDue(cards, questions, TODAY)).toBe(1);
	});

	it('bỏ qua state mồ côi không còn câu hỏi tương ứng', () => {
		const cards = { removed: state('2026-01-01') };
		expect(countDue(cards, [q('a')], TODAY)).toBe(0);
	});
});
