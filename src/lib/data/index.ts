import type { Question, QuestionDetail, Topic } from '../types';
import topicsJson from './topics.json';
import questionsJson from './generated/questions.json';

/**
 * Dữ liệu chạy trong app là bản **rút gọn** do `scripts/build-content.ts` sinh ra.
 * Phần `answerLong`/`code` được tải lười qua {@link loadDetail} để không nằm trong
 * bundle khởi động.
 */
export const topics: Topic[] = [...(topicsJson as Topic[])].sort((a, b) => a.order - b.order);
export const questions: Question[] = questionsJson as Question[];

const questionIndex = new Map(questions.map((q) => [q.id, q]));
const topicIndex = new Map(topics.map((t) => [t.id, t]));

const byTopic = new Map<string, Question[]>();
for (const q of questions) {
	const list = byTopic.get(q.topic);
	if (list) list.push(q);
	else byTopic.set(q.topic, [q]);
}

export function questionById(id: string): Question | undefined {
	return questionIndex.get(id);
}

export function topicById(id: string): Topic | undefined {
	return topicIndex.get(id);
}

export function questionsByTopic(topicId: string): Question[] {
	return byTopic.get(topicId) ?? [];
}

/** Câu trước/sau trong cùng chủ đề — dùng cho điều hướng ở trang chi tiết. */
export function neighbours(id: string): { prev?: Question; next?: Question } {
	const q = questionById(id);
	if (!q) return {};
	const siblings = questionsByTopic(q.topic);
	const i = siblings.findIndex((s) => s.id === id);
	return { prev: siblings[i - 1], next: siblings[i + 1] };
}

// Vite biến mỗi file thành một chunk riêng được tải theo yêu cầu.
const detailLoaders = import.meta.glob<Record<string, QuestionDetail>>(
	'./generated/detail/*.json',
	{ import: 'default' }
);

const detailCache = new Map<string, Record<string, QuestionDetail>>();

/** Tải phần giải thích dài của một chủ đề. Kết quả được cache cho các lần sau. */
export async function loadDetail(
	topicId: string,
	questionId: string
): Promise<QuestionDetail | undefined> {
	const cached = detailCache.get(topicId);
	if (cached) return cached[questionId];

	const loader = detailLoaders[`./generated/detail/${topicId}.json`];
	if (!loader) return undefined;

	const loaded = await loader();
	detailCache.set(topicId, loaded);
	return loaded[questionId];
}
