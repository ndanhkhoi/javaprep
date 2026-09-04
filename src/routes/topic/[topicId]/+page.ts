import { error } from '@sveltejs/kit';
import { questionsByTopic, topicById, topics } from '$lib/data';

export const prerender = true;

/** adapter-static cần biết trước danh sách route động để sinh HTML. */
export function entries() {
	return topics.map((t) => ({ topicId: t.id }));
}

export function load({ params }) {
	const topic = topicById(params.topicId);
	if (!topic) error(404, 'Không tìm thấy chủ đề');
	return { topic, questions: questionsByTopic(topic.id) };
}
