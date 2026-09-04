import type { PersistedState } from './types';

export const STORAGE_KEY = 'javaprep:v1';
export const SCHEMA_VERSION = 1;
export const DEFAULT_DAILY_NEW_LIMIT = 10;
/** Giữ tối đa 1 năm lịch sử học — đủ cho streak, chặn state phình vô hạn. */
export const MAX_STUDY_LOG = 365;

export function defaultState(): PersistedState {
	return {
		schemaVersion: SCHEMA_VERSION,
		cards: {},
		quiz: {},
		settings: { dailyNewLimit: DEFAULT_DAILY_NEW_LIMIT, theme: 'system' },
		studyLog: []
	};
}

/**
 * Nâng cấp state từ schema cũ lên hiện tại. v1 là bản đầu nên chỉ có nhánh mặc định;
 * hàm tồn tại sẵn để bản sau không phải tái cấu trúc call site.
 */
export function migrate(raw: unknown): PersistedState {
	const base = defaultState();
	if (typeof raw !== 'object' || raw === null) return base;
	const input = raw as Partial<PersistedState>;

	switch (input.schemaVersion) {
		case SCHEMA_VERSION:
			return {
				schemaVersion: SCHEMA_VERSION,
				cards: isRecord(input.cards) ? input.cards : base.cards,
				quiz: isRecord(input.quiz) ? input.quiz : base.quiz,
				settings: { ...base.settings, ...(isRecord(input.settings) ? input.settings : {}) },
				studyLog: Array.isArray(input.studyLog) ? input.studyLog.slice(-MAX_STUDY_LOG) : []
			};
		default:
			// Schema lạ hoặc từ tương lai: an toàn nhất là bỏ qua, không đoán cấu trúc.
			return base;
	}
}

function isRecord(v: unknown): v is Record<string, never> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export type LoadResult = {
	state: PersistedState;
	/** false khi localStorage bị chặn (Safari private mode, cookie bị tắt). */
	available: boolean;
};

export function load(storage: Storage | undefined = safeStorage()): LoadResult {
	if (!storage) return { state: defaultState(), available: false };
	try {
		const raw = storage.getItem(STORAGE_KEY);
		if (!raw) return { state: defaultState(), available: true };
		return { state: migrate(JSON.parse(raw)), available: true };
	} catch {
		// JSON hỏng: không xoá dữ liệu của user, chỉ khởi động bằng state mặc định.
		return { state: defaultState(), available: true };
	}
}

export function save(state: PersistedState, storage: Storage | undefined = safeStorage()): boolean {
	if (!storage) return false;
	try {
		storage.setItem(STORAGE_KEY, JSON.stringify(state));
		return true;
	} catch {
		// QuotaExceededError hoặc storage bị chặn — mất tiến độ phiên này, không làm sập app.
		return false;
	}
}

function safeStorage(): Storage | undefined {
	try {
		if (typeof localStorage === 'undefined') return undefined;
		// Truy cập thực sự: Safari private mode chỉ ném lỗi khi ghi.
		const probe = '__javaprep_probe__';
		localStorage.setItem(probe, '1');
		localStorage.removeItem(probe);
		return localStorage;
	} catch {
		return undefined;
	}
}
