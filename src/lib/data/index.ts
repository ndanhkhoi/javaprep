import type { Question, QuestionBank, Topic } from '../types';
import topicsJson from './topics.json';
import javaCore from './topics/java-core.json';
import collectionsJson from './topics/collections.json';
import concurrencyJson from './topics/concurrency.json';
import jvmMemory from './topics/jvm-memory.json';
import exceptionsJson from './topics/exceptions.json';
import java8Plus from './topics/java8-plus.json';
import springCore from './topics/spring-core.json';
import springBoot from './topics/spring-boot.json';
import springWeb from './topics/spring-web.json';
import springData from './topics/spring-data.json';
import springSecurity from './topics/spring-security.json';

/**
 * Nội dung được tách theo từng file topic để mỗi file đủ nhỏ để đọc và review.
 * Import tĩnh nên Vite gộp sẵn lúc build — không có request mạng lúc chạy, và
 * service worker precache toàn bộ cùng bundle.
 */
export const bank: QuestionBank = {
	schemaVersion: 1,
	topics: topicsJson as Topic[],
	questions: [
		...javaCore,
		...collectionsJson,
		...concurrencyJson,
		...jvmMemory,
		...exceptionsJson,
		...java8Plus,
		...springCore,
		...springBoot,
		...springWeb,
		...springData,
		...springSecurity
	] as Question[]
};

export const topics: Topic[] = [...bank.topics].sort((a, b) => a.order - b.order);
export const questions: Question[] = bank.questions;

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

export function countByTopic(topicId: string): number {
	return questionsByTopic(topicId).length;
}

/** Câu trước/sau trong cùng chủ đề — dùng cho điều hướng ở trang chi tiết. */
export function neighbours(id: string): { prev?: Question; next?: Question } {
	const q = questionById(id);
	if (!q) return {};
	const siblings = questionsByTopic(q.topic);
	const i = siblings.findIndex((s) => s.id === id);
	return { prev: siblings[i - 1], next: siblings[i + 1] };
}
