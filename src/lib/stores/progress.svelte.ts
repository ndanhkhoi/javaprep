import { browser } from '$app/environment';
import type { CardState, Grade, PersistedState, ThemePreference } from '../types';
import { MAX_STUDY_LOG, defaultState, load, save } from '../storage';
import { newCard, review } from '../srs/sm2';
import { countDue } from '../srs/queue';
import { todayLocal, type IsoDate } from '../srs/date';
import { questions } from '../data';

/** Gộp nhiều thay đổi liên tiếp thành một lần ghi — lật thẻ nhanh không gây giật. */
const SAVE_DEBOUNCE_MS = 300;

const initial = load();

let state = $state<PersistedState>(initial.state);
let storageAvailable = $state(initial.available);
let today = $state<IsoDate>(todayLocal());
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave(): void {
	if (!browser) return;
	clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		storageAvailable = save(state);
	}, SAVE_DEBOUNCE_MS);
}

/** Ghi ngay lập tức — dùng khi trang sắp bị ẩn hoặc đóng. */
function flush(): void {
	if (!browser) return;
	clearTimeout(saveTimer);
	save(state);
}

function markStudied(day: IsoDate): void {
	if (state.studyLog.at(-1) === day || state.studyLog.includes(day)) return;
	state.studyLog = [...state.studyLog, day].slice(-MAX_STUDY_LOG);
}

export const progress = {
	get cards(): Record<string, CardState> {
		return state.cards;
	},
	get quiz() {
		return state.quiz;
	},
	get settings() {
		return state.settings;
	},
	get studyLog(): IsoDate[] {
		return state.studyLog;
	},
	get storageAvailable(): boolean {
		return storageAvailable;
	},
	get today(): IsoDate {
		return today;
	},
	/** Số thẻ đến hạn hôm nay — nguồn duy nhất cho badge trên nav và home. */
	get dueCount(): number {
		return countDue(state.cards, questions, today);
	},

	cardFor(questionId: string): CardState {
		return state.cards[questionId] ?? newCard();
	},

	/** Chấm một thẻ và cập nhật lịch ôn. Không tự gọi `review()` ở nơi khác. */
	gradeCard(questionId: string, grade: Grade): CardState {
		const next = review(this.cardFor(questionId), grade, today);
		state.cards = { ...state.cards, [questionId]: next };
		markStudied(today);
		scheduleSave();
		return next;
	},

	recordQuizAnswer(questionId: string, isCorrect: boolean): void {
		const previous = state.quiz[questionId] ?? { seen: 0, correct: 0, lastAt: '' };
		state.quiz = {
			...state.quiz,
			[questionId]: {
				seen: previous.seen + 1,
				correct: previous.correct + (isCorrect ? 1 : 0),
				lastAt: today
			}
		};
		scheduleSave();
	},

	setDailyNewLimit(limit: number): void {
		state.settings = { ...state.settings, dailyNewLimit: Math.max(0, Math.min(100, limit)) };
		scheduleSave();
	},

	setTheme(theme: ThemePreference): void {
		state.settings = { ...state.settings, theme };
		applyTheme(theme);
		scheduleSave();
	},

	replaceAll(next: PersistedState): void {
		state = next;
		applyTheme(next.settings.theme);
		flush();
	},

	reset(): void {
		// Giữ lại settings: reset là xoá tiến độ học, không phải xoá tuỳ chọn của user.
		state = { ...defaultState(), settings: state.settings };
		flush();
	},

	snapshot(): PersistedState {
		return $state.snapshot(state);
	},

	/** Cập nhật lại ngày hiện tại khi app quay lại foreground sau nửa đêm. */
	refreshToday(): void {
		const current = todayLocal();
		if (current !== today) today = current;
	},

	flush
};

export function applyTheme(theme: ThemePreference): void {
	if (!browser) return;
	const dark =
		theme === 'dark' ||
		(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', dark);
}
