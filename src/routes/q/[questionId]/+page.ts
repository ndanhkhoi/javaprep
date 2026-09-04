import { error } from '@sveltejs/kit';
import { neighbours, questionById, questions, topicById } from '$lib/data';

export const prerender = true;

export function entries() {
	return questions.map((q) => ({ questionId: q.id }));
}

export function load({ params }) {
	const question = questionById(params.questionId);
	if (!question) error(404, 'Không tìm thấy câu hỏi');
	return { question, topic: topicById(question.topic), ...neighbours(question.id) };
}
