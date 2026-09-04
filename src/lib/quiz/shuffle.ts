import type { Question } from '../types';

export type ShuffledQuestion = {
	question: Question;
	options: string[];
	/** Chỉ số đáp án đúng **sau khi** xáo trộn. */
	correct: number;
};

export type Rng = () => number;

/**
 * Fisher-Yates trên bản sao. `rng` được tiêm vào để test tất định.
 * Không sửa mảng đầu vào.
 */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rng() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/**
 * Xáo thứ tự lựa chọn và ánh xạ lại chỉ số đáp án đúng.
 *
 * Đây là chỗ dễ sai nhất trong toàn bộ chế độ quiz: quên map lại `correct` khiến
 * app chấm sai mọi câu. Cách cài đặt dưới đây xáo **chỉ số** rồi tìm lại vị trí mới
 * của chỉ số đúng, nên không có đường nào để hai thứ lệch nhau.
 */
export function shuffleOptions(question: Question, rng: Rng = Math.random): ShuffledQuestion {
	const order = shuffle(
		question.quiz.options.map((_, i) => i),
		rng
	);
	return {
		question,
		options: order.map((i) => question.quiz.options[i]),
		correct: order.indexOf(question.quiz.correct)
	};
}
