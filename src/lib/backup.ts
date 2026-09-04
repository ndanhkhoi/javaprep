import { z } from 'zod';
import type { PersistedState } from './types';
import { MAX_STUDY_LOG, SCHEMA_VERSION, defaultState } from './storage';

const cardStateSchema = z.object({
	ef: z.number().min(1).max(10),
	reps: z.number().int().min(0),
	interval: z.number().int().min(0),
	due: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
	lapses: z.number().int().min(0),
	lastGrade: z.union([z.literal(0), z.literal(3), z.literal(4), z.literal(5), z.null()])
});

const quizStatSchema = z.object({
	seen: z.number().int().min(0),
	correct: z.number().int().min(0),
	lastAt: z.string()
});

export const persistedStateSchema = z.object({
	schemaVersion: z.literal(SCHEMA_VERSION),
	cards: z.record(z.string(), cardStateSchema),
	quiz: z.record(z.string(), quizStatSchema),
	settings: z.object({
		dailyNewLimit: z.number().int().min(0).max(100),
		theme: z.enum(['system', 'light', 'dark'])
	}),
	studyLog: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(MAX_STUDY_LOG)
});

export type ImportResult =
	| { ok: true; state: PersistedState }
	| { ok: false; error: string };

/**
 * Đọc file sao lưu. **Validate trước khi trả về** — file hỏng phải bị từ chối trọn vẹn
 * chứ không được ghi đè một phần lên tiến độ đang có.
 */
export function parseBackup(raw: string): ImportResult {
	let json: unknown;
	try {
		json = JSON.parse(raw);
	} catch {
		return { ok: false, error: 'File không phải JSON hợp lệ.' };
	}

	const parsed = persistedStateSchema.safeParse(json);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		const where = first.path.length > 0 ? ` tại '${first.path.join('.')}'` : '';
		return { ok: false, error: `Dữ liệu sao lưu không hợp lệ${where}: ${first.message}` };
	}

	// Hợp nhất với state mặc định để field thêm ở phiên bản sau luôn có giá trị.
	return { ok: true, state: { ...defaultState(), ...parsed.data } };
}

export function serialiseBackup(state: PersistedState): string {
	return JSON.stringify(state, null, 2);
}

export function backupFileName(today: string): string {
	return `javaprep-progress-${today}.json`;
}
