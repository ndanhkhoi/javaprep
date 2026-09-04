/**
 * Kiểm tra bộ câu hỏi trước khi build. Chạy trong CI — dữ liệu sai làm fail pipeline
 * thay vì âm thầm lọt lên production, vì nội dung sai còn tệ hơn không có nội dung.
 */
import { authoredBank } from '../src/lib/data/authored';
import { questionBankSchema } from '../src/lib/data/questions.schema';

const bank = authoredBank;
const { questions, topics } = bank;

const EXPECTED_TOTAL = 100;
/** Không quá 40% đáp án đúng dồn về một vị trí, tránh việc đoán mò theo pattern. */
const MAX_CORRECT_SHARE = 0.4;
/** Ngưỡng Jaccard để coi hai câu hỏi là trùng lặp gần đúng. */
const DUPLICATE_THRESHOLD = 0.8;

const EXPECTED_PER_TOPIC: Record<string, number> = {
	'java-core': 14,
	collections: 11,
	concurrency: 11,
	'jvm-memory': 8,
	exceptions: 5,
	'java8-plus': 10,
	'spring-core': 11,
	'spring-boot': 10,
	'spring-web': 8,
	'spring-data': 8,
	'spring-security': 4
};

const errors: string[] = [];
const warnings: string[] = [];

function check(condition: boolean, message: string): void {
	if (!condition) errors.push(message);
}

// 1. Schema
const parsed = questionBankSchema.safeParse(bank);
if (!parsed.success) {
	for (const issue of parsed.error.issues) {
		errors.push(`schema: ${issue.path.join('.')} — ${issue.message}`);
	}
}

// 2. Tổng số câu và phân bổ theo chủ đề
check(
	questions.length === EXPECTED_TOTAL,
	`tổng số câu là ${questions.length}, kỳ vọng ${EXPECTED_TOTAL}`
);

for (const [topicId, expected] of Object.entries(EXPECTED_PER_TOPIC)) {
	const actual = questions.filter((q) => q.topic === topicId).length;
	check(actual === expected, `topic '${topicId}' có ${actual} câu, kỳ vọng ${expected}`);
}

const declaredTopics = new Set(topics.map((t) => t.id));
for (const topicId of Object.keys(EXPECTED_PER_TOPIC)) {
	check(declaredTopics.has(topicId), `topic '${topicId}' có trong bảng phân bổ nhưng chưa khai báo`);
}
for (const topic of topics) {
	check(
		Object.hasOwn(EXPECTED_PER_TOPIC, topic.id),
		`topic '${topic.id}' đã khai báo nhưng không có trong bảng phân bổ`
	);
}

// 3. Phân phối vị trí đáp án đúng
const correctCounts = [0, 0, 0, 0];
for (const q of questions) {
	// Chỉ số ngoài [0,3] đã bị schema bắt ở trên; bỏ qua để thống kê không thành NaN.
	if (q.quiz.correct >= 0 && q.quiz.correct < correctCounts.length) {
		correctCounts[q.quiz.correct] += 1;
	}
}
correctCounts.forEach((count, index) => {
	const share = count / questions.length;
	check(
		share <= MAX_CORRECT_SHARE,
		`${(share * 100).toFixed(0)}% đáp án đúng nằm ở vị trí ${index} (tối đa ${MAX_CORRECT_SHARE * 100}%)`
	);
});

// 4. Trùng lặp gần đúng giữa các câu hỏi
function tokenise(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter((t) => t.length > 2)
	);
}

function jaccard(a: Set<string>, b: Set<string>): number {
	let shared = 0;
	for (const token of a) if (b.has(token)) shared += 1;
	const union = a.size + b.size - shared;
	return union === 0 ? 0 : shared / union;
}

const tokens = questions.map((q) => ({ id: q.id, set: tokenise(q.question) }));
for (let i = 0; i < tokens.length; i += 1) {
	for (let j = i + 1; j < tokens.length; j += 1) {
		const score = jaccard(tokens[i].set, tokens[j].set);
		if (score >= DUPLICATE_THRESHOLD) {
			errors.push(
				`câu '${tokens[i].id}' và '${tokens[j].id}' trùng lặp (Jaccard ${score.toFixed(2)})`
			);
		} else if (score >= 0.6) {
			warnings.push(
				`câu '${tokens[i].id}' và '${tokens[j].id}' khá giống nhau (Jaccard ${score.toFixed(2)})`
			);
		}
	}
}

// 5. Kích thước — nội dung phải đủ nhỏ để precache
const payloadBytes = Buffer.byteLength(JSON.stringify(bank), 'utf8');
const MAX_RAW_BYTES = 600_000;
check(
	payloadBytes < MAX_RAW_BYTES,
	`nội dung nặng ${(payloadBytes / 1024).toFixed(0)}KB, vượt ngưỡng ${MAX_RAW_BYTES / 1024}KB`
);

// Kết quả
for (const warning of warnings) console.warn(`⚠️  ${warning}`);

if (errors.length > 0) {
	console.error(`\n❌ ${errors.length} lỗi nội dung:\n`);
	for (const error of errors) console.error(`   ${error}`);
	process.exit(1);
}

console.log(
	`✅ ${questions.length} câu hỏi / ${topics.length} chủ đề hợp lệ ` +
		`(${(payloadBytes / 1024).toFixed(0)}KB, đáp án đúng phân bố ${correctCounts.join('/')})`
);
