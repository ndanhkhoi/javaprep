/**
 * Tách bộ câu hỏi thành hai phần trước khi build:
 *
 * - `generated/questions.json` — phần rút gọn, nạp ngay lúc khởi động (~31KB gzip).
 * - `generated/detail/<topic>.json` — `answerLong` và `code`, tải lười theo chủ đề.
 *
 * Gộp tất cả vào bundle khởi động tốn thêm khoảng 71KB gzip cho dữ liệu mà 95% màn hình
 * không dùng tới. Service worker vẫn precache cả hai nên chế độ offline không đổi.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authoredBank } from '../src/lib/data/authored';
import type { Question, QuestionDetail } from '../src/lib/types';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'src', 'lib', 'data', 'generated');
const detailDir = join(outDir, 'detail');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(detailDir, { recursive: true });

const summaries: Question[] = [];
const detailsByTopic = new Map<string, Record<string, QuestionDetail>>();

for (const q of authoredBank.questions) {
	const { answerLong, code, ...summary } = q;
	summaries.push(summary);

	let bucket = detailsByTopic.get(q.topic);
	if (!bucket) {
		bucket = {};
		detailsByTopic.set(q.topic, bucket);
	}
	bucket[q.id] = code === undefined ? { answerLong } : { answerLong, code };
}

writeFileSync(join(outDir, 'questions.json'), JSON.stringify(summaries), 'utf8');
for (const [topic, details] of detailsByTopic) {
	writeFileSync(join(detailDir, `${topic}.json`), JSON.stringify(details), 'utf8');
}

console.log(
	`✅ Sinh ${summaries.length} câu rút gọn và ${detailsByTopic.size} file chi tiết theo chủ đề`
);
