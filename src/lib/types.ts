export type Difficulty = 'easy' | 'medium' | 'hard';

/** Chất lượng hồi tưởng theo SM-2. Chỉ 4 mức được UI phơi ra. */
export type Grade = 0 | 3 | 4 | 5;

export type Topic = {
	id: string;
	name: string;
	icon: string;
	/** Mô tả một dòng, hiện trên thẻ chủ đề ở màn hình chính. */
	blurb: string;
	order: number;
};

export type Quiz = {
	options: string[];
	/** Chỉ số 0-based của đáp án đúng trong `options`. */
	correct: number;
	explanation: string;
};

export type Question = {
	id: string;
	topic: string;
	difficulty: Difficulty;
	question: string;
	answerShort: string;
	answerLong: string;
	code?: string;
	tags: string[];
	quiz: Quiz;
};

export type QuestionBank = {
	schemaVersion: 1;
	topics: Topic[];
	questions: Question[];
};

/** Trạng thái SM-2 của một thẻ. */
export type CardState = {
	/** Ease factor, khởi tạo 2.5, sàn 1.3. */
	ef: number;
	/** Số lần trả lời đạt (q >= 3) liên tiếp. */
	reps: number;
	/** Khoảng cách ôn hiện tại, tính bằng ngày. */
	interval: number;
	/** Ngày đến hạn dạng 'YYYY-MM-DD' theo giờ local. */
	due: string;
	lapses: number;
	lastGrade: Grade | null;
};

export type QuizStat = {
	seen: number;
	correct: number;
	/** 'YYYY-MM-DD' lần trả lời gần nhất. */
	lastAt: string;
};

export type ThemePreference = 'system' | 'light' | 'dark';

export type Settings = {
	dailyNewLimit: number;
	theme: ThemePreference;
};

export type PersistedState = {
	schemaVersion: 1;
	cards: Record<string, CardState>;
	quiz: Record<string, QuizStat>;
	settings: Settings;
	/** Các ngày 'YYYY-MM-DD' đã ôn ít nhất 1 thẻ, tăng dần, tối đa 365 phần tử. */
	studyLog: string[];
};
