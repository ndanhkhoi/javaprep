import { describe, expect, it } from 'vitest';
import type { Question } from '../types';
import { shuffle, shuffleOptions } from './shuffle';

function question(correct: number): Question {
	return {
		id: 'q-001',
		topic: 't',
		difficulty: 'easy',
		question: 'Câu hỏi thử',
		answerShort: 'ngắn',
		tags: ['x'],
		quiz: { options: ['A', 'B', 'C', 'D'], correct, explanation: 'vì thế' }
	};
}

describe('shuffle', () => {
	it('không sửa mảng đầu vào', () => {
		const input = [1, 2, 3, 4];
		shuffle(input, () => 0.5);
		expect(input).toEqual([1, 2, 3, 4]);
	});

	it('giữ đủ phần tử, không mất và không nhân bản', () => {
		const out = shuffle([1, 2, 3, 4, 5]);
		expect(out.slice().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
	});

	it('mảng rỗng và mảng một phần tử không gây lỗi', () => {
		expect(shuffle([])).toEqual([]);
		expect(shuffle(['a'])).toEqual(['a']);
	});

	it('tất định khi rng tất định', () => {
		const rng = () => 0.42;
		expect(shuffle([1, 2, 3, 4], rng)).toEqual(shuffle([1, 2, 3, 4], rng));
	});
});

describe('shuffleOptions', () => {
	// Đây là bất biến quan trọng nhất của chế độ quiz: sai ở đây thì app chấm sai mọi câu.
	it('luôn map lại chỉ số đúng — 1000 vòng với mọi vị trí ban đầu', () => {
		for (let round = 0; round < 1000; round += 1) {
			const original = round % 4;
			const q = question(original);
			const shuffled = shuffleOptions(q);

			expect(shuffled.options[shuffled.correct]).toBe(q.quiz.options[original]);
			expect(shuffled.correct).toBeGreaterThanOrEqual(0);
			expect(shuffled.correct).toBeLessThan(4);
		}
	});

	it('giữ đủ 4 lựa chọn, không mất và không nhân bản', () => {
		for (let round = 0; round < 200; round += 1) {
			const shuffled = shuffleOptions(question(1));
			expect(shuffled.options).toHaveLength(4);
			expect(new Set(shuffled.options).size).toBe(4);
			expect([...shuffled.options].sort()).toEqual(['A', 'B', 'C', 'D']);
		}
	});

	it('không sửa question gốc', () => {
		const q = question(2);
		const snapshot = [...q.quiz.options];
		shuffleOptions(q);
		expect(q.quiz.options).toEqual(snapshot);
		expect(q.quiz.correct).toBe(2);
	});

	it('với rng luôn trả 0 thì vẫn giữ đúng ánh xạ', () => {
		const shuffled = shuffleOptions(question(3), () => 0);
		expect(shuffled.options[shuffled.correct]).toBe('D');
	});

	it('thực sự có xáo trộn — không phải lúc nào cũng giữ nguyên thứ tự', () => {
		const results = new Set<string>();
		for (let i = 0; i < 200; i += 1) results.add(shuffleOptions(question(0)).options.join(''));
		expect(results.size).toBeGreaterThan(1);
	});
});
