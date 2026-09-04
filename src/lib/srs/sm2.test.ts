import { describe, expect, it } from 'vitest';
import type { CardState } from '../types';
import {
	INITIAL_EF,
	MAX_INTERVAL,
	MIN_EF,
	isDue,
	masteryLevel,
	newCard,
	previewInterval,
	review
} from './sm2';

const TODAY = '2026-09-05';

function card(over: Partial<CardState> = {}): CardState {
	return { ...newCard(), ...over };
}

describe('review — chuỗi học thành công', () => {
	it('thẻ mới, q=4 -> reps 1, interval 1, ef không đổi', () => {
		const r = review(newCard(), 4, TODAY);
		expect(r.reps).toBe(1);
		expect(r.interval).toBe(1);
		expect(r.ef).toBeCloseTo(INITIAL_EF, 10);
		expect(r.due).toBe('2026-09-06');
		expect(r.lapses).toBe(0);
		expect(r.lastGrade).toBe(4);
	});

	it('lần 2 với q=4 -> interval 6 (hằng số SM-2, không phụ thuộc ef)', () => {
		const r = review(card({ reps: 1, interval: 1, ef: 2.5, due: TODAY }), 4, TODAY);
		expect(r.reps).toBe(2);
		expect(r.interval).toBe(6);
		expect(r.due).toBe('2026-09-11');
	});

	it('lần 3 với q=4, ef=2.5 -> round(6 * 2.5) = 15', () => {
		const r = review(card({ reps: 2, interval: 6, ef: 2.5, due: TODAY }), 4, TODAY);
		expect(r.reps).toBe(3);
		expect(r.interval).toBe(15);
		expect(r.due).toBe('2026-09-20');
	});

	it('q=5 làm ef tăng 0.1 mỗi lần', () => {
		const r = review(card({ reps: 3, interval: 15, ef: 2.5, due: TODAY }), 5, TODAY);
		expect(r.ef).toBeCloseTo(2.6, 10);
	});

	it('q=3 vẫn là pass: reps tăng nhưng ef giảm 0.14', () => {
		const r = review(card({ reps: 2, interval: 6, ef: 2.5, due: TODAY }), 3, TODAY);
		expect(r.reps).toBe(3);
		expect(r.ef).toBeCloseTo(2.36, 10);
		expect(r.lapses).toBe(0);
	});
});

describe('review — fail', () => {
	it('q=0 reset chuỗi, ôn lại sau 1 ngày, tăng lapses', () => {
		const r = review(card({ reps: 7, interval: 120, ef: 2.4, due: TODAY, lapses: 1 }), 0, TODAY);
		expect(r.reps).toBe(0);
		expect(r.interval).toBe(1);
		expect(r.lapses).toBe(2);
		expect(r.due).toBe('2026-09-06');
	});

	it('q=0 giữ ef đã giảm, không reset về 2.5', () => {
		const r = review(card({ reps: 5, interval: 60, ef: 2.0, due: TODAY }), 0, TODAY);
		// 2.0 - 0.8 = 1.2, dưới sàn nên bị kẹp về 1.3 — không nhảy về INITIAL_EF.
		expect(r.ef).toBe(MIN_EF);
		expect(r.ef).not.toBe(INITIAL_EF);
	});

	it('sau khi fail, học lại đi theo chuỗi mới 1 -> 6', () => {
		let s = review(card({ reps: 5, interval: 60, ef: 2.5, due: TODAY }), 0, TODAY);
		s = review(s, 4, '2026-09-06');
		expect(s.interval).toBe(1);
		s = review(s, 4, '2026-09-07');
		expect(s.interval).toBe(6);
	});
});

describe('review — ràng buộc biên', () => {
	it('ef không bao giờ xuống dưới 1.3 dù fail liên tục', () => {
		let s = newCard();
		for (let i = 0; i < 50; i += 1) s = review(s, 0, TODAY);
		expect(s.ef).toBe(MIN_EF);
		expect(s.ef).toBeGreaterThanOrEqual(MIN_EF);
	});

	it('interval bị kẹp trần ở 365 ngày', () => {
		let s = card({ reps: 3, interval: 300, ef: 2.8, due: TODAY });
		s = review(s, 5, TODAY);
		expect(s.interval).toBe(MAX_INTERVAL);
		s = review(s, 5, TODAY);
		expect(s.interval).toBe(MAX_INTERVAL);
	});

	it('interval luôn >= 1 ngày kể cả khi ef ở sàn và interval nhỏ', () => {
		const s = review(card({ reps: 2, interval: 1, ef: MIN_EF, due: TODAY }), 3, TODAY);
		expect(s.interval).toBeGreaterThanOrEqual(1);
	});

	it('hàm là thuần — không sửa state đầu vào', () => {
		const input = newCard();
		const snapshot = { ...input };
		review(input, 5, TODAY);
		expect(input).toEqual(snapshot);
	});

	it('ef tăng có trần thực tế: 100 lần q=5 vẫn cho interval hữu hạn', () => {
		let s = newCard();
		for (let i = 0; i < 100; i += 1) s = review(s, 5, TODAY);
		expect(Number.isFinite(s.ef)).toBe(true);
		expect(s.interval).toBe(MAX_INTERVAL);
	});
});

describe('previewInterval', () => {
	it('khớp chính xác interval thật sau khi chấm', () => {
		const s = card({ reps: 2, interval: 6, ef: 2.5, due: TODAY });
		for (const q of [0, 3, 4, 5] as const) {
			expect(previewInterval(s, q)).toBe(review(s, q, TODAY).interval);
		}
	});
});

describe('isDue', () => {
	it('thẻ chưa từng ôn không tính là đến hạn', () => {
		expect(isDue(newCard(), TODAY)).toBe(false);
	});

	it('due hôm qua và hôm nay đều đến hạn, ngày mai thì không', () => {
		expect(isDue(card({ due: '2026-09-04' }), TODAY)).toBe(true);
		expect(isDue(card({ due: TODAY }), TODAY)).toBe(true);
		expect(isDue(card({ due: '2026-09-06' }), TODAY)).toBe(false);
	});
});

describe('masteryLevel', () => {
	it('không có state -> new', () => {
		expect(masteryLevel(undefined)).toBe('new');
		expect(masteryLevel(newCard())).toBe('new');
	});

	it('interval 20 -> learning, 21 -> mature', () => {
		expect(masteryLevel(card({ reps: 4, interval: 20, due: TODAY }))).toBe('learning');
		expect(masteryLevel(card({ reps: 4, interval: 21, due: TODAY }))).toBe('mature');
	});

	it('thẻ vừa quên vẫn là learning, không tụt về new', () => {
		const failed = review(card({ reps: 6, interval: 90, due: TODAY }), 0, TODAY);
		expect(failed.reps).toBe(0);
		expect(masteryLevel(failed)).toBe('learning');
	});
});
