import { describe, expect, it } from 'vitest';
import type { Difficulty, Question } from './types';
import { normalise, searchQuestions } from './search';

function q(id: string, question: string, opts: Partial<Question> = {}): Question {
	return {
		id,
		topic: 'java-core',
		difficulty: 'medium',
		question,
		answerShort: 'đáp án ngắn',
		answerLong: 'đáp án dài',
		tags: ['tag'],
		quiz: { options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'vì thế' },
		...opts
	};
}

const bank: Question[] = [
	q('a', 'Kế thừa trong Java hoạt động thế nào?', { tags: ['inheritance'] }),
	q('b', 'HashMap hoạt động thế nào bên trong?', { difficulty: 'hard' as Difficulty }),
	q('c', 'Bean scope là gì?', { topic: 'spring-core', difficulty: 'easy' as Difficulty })
];

describe('normalise', () => {
	it('bỏ dấu tiếng Việt và hạ chữ thường', () => {
		expect(normalise('Kế Thừa')).toBe('ke thua');
	});

	it('chuyển đ thành d', () => {
		expect(normalise('Đa hình')).toBe('da hinh');
	});
});

describe('searchQuestions', () => {
	it('query rỗng trả về toàn bộ', () => {
		expect(searchQuestions(bank)).toHaveLength(3);
	});

	it('gõ không dấu vẫn khớp nội dung có dấu', () => {
		expect(searchQuestions(bank, { query: 'ke thua' }).map((x) => x.id)).toEqual(['a']);
	});

	it('khớp theo tag', () => {
		expect(searchQuestions(bank, { query: 'inheritance' }).map((x) => x.id)).toEqual(['a']);
	});

	it('nhiều token phải khớp tất cả', () => {
		expect(searchQuestions(bank, { query: 'hashmap ben trong' }).map((x) => x.id)).toEqual(['b']);
		expect(searchQuestions(bank, { query: 'hashmap khongcotutnay' })).toEqual([]);
	});

	it('lọc theo chủ đề và độ khó cùng lúc', () => {
		const out = searchQuestions(bank, { topic: 'java-core', difficulty: 'hard' });
		expect(out.map((x) => x.id)).toEqual(['b']);
	});

	it('không khớp gì thì trả về mảng rỗng', () => {
		expect(searchQuestions(bank, { query: 'zzzzz' })).toEqual([]);
	});

	it('khoảng trắng thừa không ảnh hưởng kết quả', () => {
		expect(searchQuestions(bank, { query: '   bean   ' }).map((x) => x.id)).toEqual(['c']);
	});

	it('không sửa mảng đầu vào', () => {
		const snapshot = bank.map((x) => x.id);
		searchQuestions(bank, { query: 'java' });
		expect(bank.map((x) => x.id)).toEqual(snapshot);
	});
});
