import { error } from '@sveltejs/kit';
import { loadDetail, neighbours, questionById, questions, topicById } from '$lib/data';

export const prerender = true;

export function entries() {
	return questions.map((q) => ({ questionId: q.id }));
}

export async function load({ params }) {
	const question = questionById(params.questionId);
	if (!question) error(404, 'Không tìm thấy câu hỏi');

	// Phần giải thích dài nằm ở chunk riêng theo chủ đề — chỉ tải khi thực sự mở câu hỏi.
	const detail = await loadDetail(question.topic, question.id);

	return {
		question,
		detail,
		topic: topicById(question.topic),
		...neighbours(question.id)
	};
}
