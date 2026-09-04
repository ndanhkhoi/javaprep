import { describe, expect, it } from 'vitest';
import { DEFAULT_DAILY_NEW_LIMIT, defaultState, load, migrate, save } from './storage';
import { backupFileName, parseBackup, serialiseBackup } from './backup';

/** localStorage giả — đủ dùng cho test, có thể mô phỏng cả trường hợp bị chặn. */
function memoryStorage(opts: { failWrites?: boolean } = {}): Storage {
	const map = new Map<string, string>();
	return {
		get length() {
			return map.size;
		},
		clear: () => map.clear(),
		getItem: (k) => map.get(k) ?? null,
		key: (i) => [...map.keys()][i] ?? null,
		removeItem: (k) => void map.delete(k),
		setItem: (k, v) => {
			if (opts.failWrites) throw new DOMException('QuotaExceededError');
			map.set(k, v);
		}
	};
}

describe('migrate', () => {
	it('đầu vào không phải object trả về state mặc định', () => {
		expect(migrate(null)).toEqual(defaultState());
		expect(migrate('rác')).toEqual(defaultState());
		expect(migrate(42)).toEqual(defaultState());
	});

	it('schemaVersion lạ trả về state mặc định, không đoán cấu trúc', () => {
		expect(migrate({ schemaVersion: 99, cards: { a: {} } })).toEqual(defaultState());
	});

	it('bổ sung field thiếu bằng giá trị mặc định', () => {
		const out = migrate({ schemaVersion: 1, cards: { a: { ef: 2.5 } } });
		expect(out.settings.dailyNewLimit).toBe(DEFAULT_DAILY_NEW_LIMIT);
		expect(out.quiz).toEqual({});
		expect(out.studyLog).toEqual([]);
	});

	it('cắt studyLog quá dài xuống giới hạn', () => {
		const log = Array.from({ length: 500 }, (_, i) => `2026-01-${i}`);
		expect(migrate({ schemaVersion: 1, studyLog: log }).studyLog).toHaveLength(365);
	});

	it('cards là mảng thay vì object thì bị bỏ qua', () => {
		expect(migrate({ schemaVersion: 1, cards: [] }).cards).toEqual({});
	});
});

describe('load / save', () => {
	it('storage không khả dụng -> state mặc định và available = false', () => {
		const result = load(undefined);
		expect(result.available).toBe(false);
		expect(result.state).toEqual(defaultState());
	});

	it('round-trip giữ nguyên state', () => {
		const storage = memoryStorage();
		const state = defaultState();
		state.cards.q1 = { ef: 2.5, reps: 1, interval: 1, due: '2026-09-06', lapses: 0, lastGrade: 4 };

		expect(save(state, storage)).toBe(true);
		expect(load(storage).state).toEqual(state);
	});

	it('JSON hỏng không làm sập app', () => {
		const storage = memoryStorage();
		storage.setItem('javaprep:v1', '{khong-phai-json');
		const result = load(storage);
		expect(result.available).toBe(true);
		expect(result.state).toEqual(defaultState());
	});

	it('ghi thất bại (hết quota) trả về false thay vì ném lỗi', () => {
		expect(save(defaultState(), memoryStorage({ failWrites: true }))).toBe(false);
	});
});

describe('parseBackup', () => {
	it('round-trip export rồi import khôi phục nguyên vẹn', () => {
		const state = defaultState();
		state.cards.q1 = { ef: 2.3, reps: 4, interval: 15, due: '2026-10-01', lapses: 1, lastGrade: 3 };
		state.quiz.q1 = { seen: 3, correct: 2, lastAt: '2026-09-05' };
		state.studyLog = ['2026-09-04', '2026-09-05'];

		const result = parseBackup(serialiseBackup(state));
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.state).toEqual(state);
	});

	it('từ chối chuỗi không phải JSON', () => {
		const result = parseBackup('không phải json');
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain('JSON');
	});

	it('từ chối file thiếu schemaVersion', () => {
		expect(parseBackup(JSON.stringify({ cards: {} })).ok).toBe(false);
	});

	it('từ chối due sai định dạng ngày', () => {
		const bad = {
			...defaultState(),
			cards: { q1: { ef: 2.5, reps: 1, interval: 1, due: '06/09/2026', lapses: 0, lastGrade: 4 } }
		};
		expect(parseBackup(JSON.stringify(bad)).ok).toBe(false);
	});

	it('từ chối lastGrade không hợp lệ', () => {
		const bad = {
			...defaultState(),
			cards: { q1: { ef: 2.5, reps: 1, interval: 1, due: '', lapses: 0, lastGrade: 2 } }
		};
		expect(parseBackup(JSON.stringify(bad)).ok).toBe(false);
	});

	it('chấp nhận due rỗng của thẻ chưa từng ôn', () => {
		const state = defaultState();
		state.cards.q1 = { ef: 2.5, reps: 0, interval: 0, due: '', lapses: 0, lastGrade: null };
		expect(parseBackup(serialiseBackup(state)).ok).toBe(true);
	});
});

describe('backupFileName', () => {
	it('gắn ngày vào tên file', () => {
		expect(backupFileName('2026-09-05')).toBe('javaprep-progress-2026-09-05.json');
	});
});
