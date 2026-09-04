import { z } from 'zod';

export const ANSWER_SHORT_MAX = 240;

export const topicSchema = z.object({
	id: z
		.string()
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'topic id phải là kebab-case'),
	name: z.string().min(1),
	icon: z.string().min(1),
	blurb: z.string().min(1),
	order: z.number().int().positive()
});

export const quizSchema = z
	.object({
		options: z.array(z.string().min(1)).length(4, 'quiz phải có đúng 4 lựa chọn'),
		correct: z.number().int().min(0).max(3),
		explanation: z.string().min(10)
	})
	.refine((q) => new Set(q.options).size === 4, {
		message: 'các lựa chọn quiz phải khác nhau',
		path: ['options']
	});

export const questionSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]+-\d{3}$/, "id phải có dạng '<topic>-001'"),
	topic: z.string().min(1),
	difficulty: z.enum(['easy', 'medium', 'hard']),
	question: z.string().min(10),
	answerShort: z
		.string()
		.min(10)
		.max(ANSWER_SHORT_MAX, `answerShort phải <= ${ANSWER_SHORT_MAX} ký tự`),
	answerLong: z.string().min(40),
	code: z.string().min(1).optional(),
	tags: z.array(z.string().min(1)).min(1).max(6),
	quiz: quizSchema
});

export const questionBankSchema = z
	.object({
		schemaVersion: z.literal(1),
		topics: z.array(topicSchema).min(1),
		questions: z.array(questionSchema).min(1)
	})
	.superRefine((bank, ctx) => {
		const topicIds = new Set(bank.topics.map((t) => t.id));
		const seenQuestionIds = new Set<string>();

		for (const [i, q] of bank.questions.entries()) {
			if (!topicIds.has(q.topic)) {
				ctx.addIssue({
					code: 'custom',
					path: ['questions', i, 'topic'],
					message: `topic '${q.topic}' không tồn tại trong danh sách topics`
				});
			}
			if (!q.id.startsWith(`${q.topic}-`)) {
				ctx.addIssue({
					code: 'custom',
					path: ['questions', i, 'id'],
					message: `id '${q.id}' phải bắt đầu bằng topic '${q.topic}-'`
				});
			}
			if (seenQuestionIds.has(q.id)) {
				ctx.addIssue({
					code: 'custom',
					path: ['questions', i, 'id'],
					message: `id '${q.id}' bị trùng`
				});
			}
			seenQuestionIds.add(q.id);
		}

		const orders = bank.topics.map((t) => t.order);
		if (new Set(orders).size !== orders.length) {
			ctx.addIssue({ code: 'custom', path: ['topics'], message: 'order của topic bị trùng' });
		}
	});

export type ValidatedBank = z.infer<typeof questionBankSchema>;
