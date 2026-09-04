import { describe, expect, it } from 'vitest';
import type { Question, QuizStat } from '../types';
import { selectQuizQuestions } from './select';

function q(id: string, topic = 'java-core'): Question {
	return {
		id,
		topic,
		difficulty: 'easy',
		question: `Câu ${id}`,
		answerShort: 'ngắn',
		tags: ['x'],
		quiz: { options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'vì thế' }
	};
}

function stat(seen: number, correct: number): QuizStat {
	return { seen, correct, lastAt: '2026-09-05' };
}

const rng = () => 0.5;

describe('selectQuizQuestions', () => {
	it('ưu tiên câu hay sai trước câu chưa từng thấy', () => {
		const questions = [q('weak'), q('unseen'), q('strong')];
		const stats = { weak: stat(4, 1), strong: stat(4, 4) };

		const ids = selectQuizQuestions({ questions, stats, count: 3, rng }).map((x) => x.id);
		expect(ids[0]).toBe('weak');
		expect(ids[1]).toBe('unseen');
		expect(ids[2]).toBe('strong');
	});

	it('không trả về nhiều hơn số câu yêu cầu', () => {
		const questions = Array.from({ length: 30 }, (_, i) => q(`q${i}`));
		expect(selectQuizQuestions({ questions, stats: {}, count: 10, rng })).toHaveLength(10);
	});

	it('yêu cầu nhiều hơn số câu có sẵn thì trả về tất cả', () => {
		const questions = [q('a'), q('b')];
		expect(selectQuizQuestions({ questions, stats: {}, count: 50, rng })).toHaveLength(2);
	});

	it('count = 0 hoặc âm trả về mảng rỗng', () => {
		const questions = [q('a')];
		expect(selectQuizQuestions({ questions, stats: {}, count: 0, rng })).toEqual([]);
		expect(selectQuizQuestions({ questions, stats: {}, count: -3, rng })).toEqual([]);
	});

	it('lọc theo chủ đề', () => {
		const questions = [q('a', 'java-core'), q('b', 'spring-core'), q('c', 'java-core')];
		const ids = selectQuizQuestions({
			questions,
			stats: {},
			count: 10,
			topicFilter: 'java-core',
			rng
		}).map((x) => x.id);
		expect(ids.sort()).toEqual(['a', 'c']);
	});

	it('tỉ lệ đúng đúng 50% không bị coi là câu yếu', () => {
		const questions = [q('half'), q('unseen')];
		const ids = selectQuizQuestions({
			questions,
			stats: { half: stat(2, 1) },
			count: 2,
			rng
		}).map((x) => x.id);
		expect(ids[0]).toBe('unseen');
	});

	it('không bị lỗi khi stat có seen = 0', () => {
		const questions = [q('a')];
		const out = selectQuizQuestions({ questions, stats: { a: stat(0, 0) }, count: 1, rng });
		expect(out.map((x) => x.id)).toEqual(['a']);
	});

	it('không sửa mảng câu hỏi đầu vào', () => {
		const questions = [q('a'), q('b'), q('c')];
		const snapshot = questions.map((x) => x.id);
		selectQuizQuestions({ questions, stats: {}, count: 3 });
		expect(questions.map((x) => x.id)).toEqual(snapshot);
	});
});
