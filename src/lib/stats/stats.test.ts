import { describe, expect, it } from 'vitest';
import type { CardState, Question } from '../types';
import { newCard } from '../srs/sm2';
import { longestStreak, streak } from './streak';
import { masteryByTopic, masteryOf } from './mastery';
import { forecast } from './forecast';

const TODAY = '2026-09-05';

function card(over: Partial<CardState> = {}): CardState {
	return { ...newCard(), ...over };
}

function q(id: string, topic = 'java-core'): Question {
	return {
		id,
		topic,
		difficulty: 'easy',
		question: 'Câu hỏi',
		answerShort: 'ngắn',
		tags: ['x'],
		quiz: { options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'vì thế' }
	};
}

describe('streak', () => {
	it('log rỗng trả về 0', () => {
		expect(streak([], TODAY)).toBe(0);
	});

	it('học hôm nay và 4 ngày liền trước đó -> 5', () => {
		const log = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
		expect(streak(log, TODAY)).toBe(5);
	});

	it('học tới hôm qua, hôm nay chưa học -> streak chưa đứt', () => {
		expect(streak(['2026-09-03', '2026-09-04'], TODAY)).toBe(2);
	});

	it('nghỉ 2 ngày rồi học lại -> chỉ tính từ lần học lại', () => {
		const log = ['2026-09-01', '2026-09-04', '2026-09-05'];
		expect(streak(log, TODAY)).toBe(2);
	});

	it('ngày trùng lặp không bị đếm đôi', () => {
		expect(streak(['2026-09-05', '2026-09-05', '2026-09-04'], TODAY)).toBe(2);
	});

	it('lần học gần nhất cách đây 3 ngày -> 0', () => {
		expect(streak(['2026-09-02'], TODAY)).toBe(0);
	});

	it('đúng qua ranh giới tháng', () => {
		expect(streak(['2026-08-31', '2026-09-01'], '2026-09-01')).toBe(2);
	});

	it('log không sắp xếp vẫn cho kết quả đúng', () => {
		expect(streak(['2026-09-04', '2026-09-02', '2026-09-05', '2026-09-03'], TODAY)).toBe(4);
	});
});

describe('longestStreak', () => {
	it('tìm được chuỗi dài nhất trong quá khứ', () => {
		const log = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-05-01', '2026-05-02'];
		expect(longestStreak(log)).toBe(3);
	});

	it('log rỗng trả về 0', () => {
		expect(longestStreak([])).toBe(0);
	});

	it('một ngày duy nhất trả về 1', () => {
		expect(longestStreak(['2026-09-05'])).toBe(1);
	});
});

describe('masteryOf', () => {
	it('interval 20 là learning, 21 là mature, chưa học là new', () => {
		const questions = [q('a'), q('b'), q('c')];
		const cards = {
			a: card({ reps: 3, interval: 20, due: TODAY }),
			b: card({ reps: 5, interval: 21, due: TODAY })
		};
		expect(masteryOf(questions, cards)).toEqual({ new: 1, learning: 1, mature: 1, total: 3 });
	});

	it('không có thẻ nào -> tất cả là new', () => {
		expect(masteryOf([q('a'), q('b')], {})).toEqual({ new: 2, learning: 0, mature: 0, total: 2 });
	});
});

describe('masteryByTopic', () => {
	it('gom đúng theo chủ đề', () => {
		const questions = [q('a', 'java-core'), q('b', 'java-core'), q('c', 'spring-core')];
		const cards = { a: card({ reps: 9, interval: 30, due: TODAY }) };
		const out = masteryByTopic(questions, cards);

		expect(out['java-core']).toEqual({ new: 1, learning: 0, mature: 1, total: 2 });
		expect(out['spring-core']).toEqual({ new: 1, learning: 0, mature: 0, total: 1 });
	});
});

describe('forecast', () => {
	it('trả về đúng 14 ngày bắt đầu từ hôm nay', () => {
		const out = forecast({}, TODAY);
		expect(out).toHaveLength(14);
		expect(out[0].date).toBe(TODAY);
		expect(out[13].date).toBe('2026-09-18');
	});

	it('thẻ quá hạn dồn vào cột hôm nay', () => {
		const cards = { a: card({ due: '2026-08-31' }), b: card({ due: '2026-09-01' }) };
		expect(forecast(cards, TODAY)[0].count).toBe(2);
	});

	it('thẻ due ngoài khoảng không xuất hiện', () => {
		const cards = { a: card({ due: '2026-12-01' }) };
		expect(forecast(cards, TODAY).reduce((n, d) => n + d.count, 0)).toBe(0);
	});

	it('thẻ chưa từng ôn (due rỗng) không được đếm', () => {
		expect(forecast({ a: newCard() }, TODAY).reduce((n, d) => n + d.count, 0)).toBe(0);
	});

	it('đếm đúng vào ngày tương ứng', () => {
		const cards = { a: card({ due: '2026-09-08' }), b: card({ due: '2026-09-08' }) };
		const out = forecast(cards, TODAY);
		expect(out.find((d) => d.date === '2026-09-08')?.count).toBe(2);
	});
});
