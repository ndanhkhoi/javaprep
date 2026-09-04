import type { Difficulty, Question } from './types';

/** Bỏ dấu tiếng Việt + hạ chữ thường, để gõ "ke thua" vẫn khớp "kế thừa". */
export function normalise(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/đ/g, 'd');
}

export type SearchFilters = {
	query?: string;
	topic?: string | null;
	difficulty?: Difficulty | null;
};

type Indexed = { question: Question; haystack: string };

/**
 * Chuỗi đã bỏ dấu được dựng một lần cho mỗi mảng câu hỏi. Dùng WeakMap thay vì biến
 * cache toàn cục để không giữ dữ liệu sống ngoài ý muốn và không nhầm giữa các mảng.
 */
const indexCache = new WeakMap<readonly Question[], Indexed[]>();

function index(questions: readonly Question[]): Indexed[] {
	const cached = indexCache.get(questions);
	if (cached) return cached;

	const built = questions.map((q) => ({
		question: q,
		haystack: normalise([q.question, q.answerShort, ...q.tags].join(' '))
	}));
	indexCache.set(questions, built);
	return built;
}

/**
 * Lọc tuyến tính — với 100 câu thì không cần thư viện đánh chỉ mục nào.
 * Kết quả được xếp theo số token khớp giảm dần.
 */
export function searchQuestions(
	questions: readonly Question[],
	{ query = '', topic = null, difficulty = null }: SearchFilters = {}
): Question[] {
	const tokens = normalise(query).split(/\s+/).filter(Boolean);

	const scored: { question: Question; score: number }[] = [];
	for (const entry of index(questions)) {
		const q = entry.question;
		if (topic && q.topic !== topic) continue;
		if (difficulty && q.difficulty !== difficulty) continue;

		if (tokens.length === 0) {
			scored.push({ question: q, score: 0 });
			continue;
		}
		let score = 0;
		for (const token of tokens) if (entry.haystack.includes(token)) score += 1;
		if (score === tokens.length) scored.push({ question: q, score });
	}

	return scored.sort((a, b) => b.score - a.score).map((s) => s.question);
}
