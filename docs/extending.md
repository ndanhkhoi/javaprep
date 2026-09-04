# Mở rộng JavaPrep

## Thêm hoặc sửa câu hỏi

Câu hỏi nằm trong `src/lib/data/topics/<chủ-đề>.json`, mỗi file là một mảng.

```jsonc
{
  "id": "java-core-015",          // <topic>-<số 3 chữ số>, phải liên tục trong file
  "topic": "java-core",           // khớp với id trong topics.json
  "difficulty": "medium",         // easy | medium | hard
  "question": "Câu hỏi viết như người phỏng vấn thật hỏi",
  "answerShort": "Thứ cần nhớ khi bị hỏi bất chợt. Tối đa 240 ký tự.",
  "answerLong": "Markdown đầy đủ: giải thích, khi nào dùng, bẫy thường gặp.",
  "code": "// tuỳ chọn — ví dụ ngắn, tập trung vào đúng ý đang nói",
  "tags": ["equals", "hashcode"],  // 1–6 tag
  "quiz": {
    "options": ["...", "...", "...", "..."],   // đúng 4, không trùng nhau
    "correct": 1,                              // chỉ số 0-based
    "explanation": "Vì sao đáp án đó đúng và vì sao các lựa chọn kia sai."
  }
}
```

Sau khi sửa:

```bash
npm run validate:content
```

Nếu đổi **số lượng** câu trong một chủ đề, cập nhật bảng `EXPECTED_PER_TOPIC` trong `scripts/validate-content.ts` — validator cố tình fail để việc thay đổi phân bổ là một quyết định có ý thức, không phải tai nạn.

### Quy tắc biên soạn

- Câu hỏi viết như **người phỏng vấn thật hỏi**, không phải như đề thi.
- `answerShort` là thứ cần nhớ khi bị hỏi bất chợt; `answerLong` là phần hiểu sâu.
- Distractor trong quiz phải là **hiểu lầm phổ biến thật**, không phải đáp án ngớ ngẩn. Cách tự kiểm: đọc 4 lựa chọn mà không nhìn `correct` — nếu đoán ra ngay thì distractor còn yếu.
- Giữ nguyên thuật ngữ tiếng Anh (`bean`, `heap`, `race condition`, `@Transactional`), diễn giải bằng tiếng Việt.
- Mọi khẳng định về hành vi phải đúng với **Java 21 LTS** và **Spring Boot 3.x**. Ghi rõ nếu hành vi khác ở phiên bản cũ.
- Đừng để `correct` luôn ở một vị trí — validator chặn ở ngưỡng 40%, nhưng phân bố đều vẫn tốt hơn.

## Thêm chủ đề mới

1. Thêm một mục vào `src/lib/data/topics.json` (`id` kebab-case, `icon` là emoji, `blurb` một dòng, `order` chưa bị dùng).
2. Tạo `src/lib/data/topics/<id>.json`.
3. Import và nối vào mảng trong `src/lib/data/authored.ts`.
4. Thêm số lượng câu vào `EXPECTED_PER_TOPIC` trong `scripts/validate-content.ts`.
5. `npm run validate:content && npm run build`.

Trang topic và trang chi tiết tự sinh từ dữ liệu — không cần thêm route.

## Chỉnh thuật toán ôn tập

Toàn bộ nằm trong `src/lib/srs/sm2.ts` và có test đi kèm ở `sm2.test.ts`.

| Hằng số | Mặc định | Ý nghĩa |
|---|---|---|
| `INITIAL_EF` | 2.5 | Ease factor của thẻ mới |
| `MIN_EF` | 1.3 | Sàn ease factor theo SM-2 gốc |
| `MAX_INTERVAL` | 365 | Trần interval, tính bằng ngày |
| `MATURE_INTERVAL` | 21 | Ngưỡng coi là "đã thuộc" |

Sửa xong thì **chạy test trước khi tin vào kết quả** — các test bám sát spec SM-2 gốc và sẽ bắt được thay đổi làm sai thuật toán.

Muốn đổi hẳn sang FSRS hoặc thuật toán khác: thay `review()` và `NEW_CARD`, giữ nguyên hình dạng của `CardState` là phần còn lại của app không cần đụng tới. Nếu `CardState` đổi hình dạng thì phải bump `SCHEMA_VERSION` trong `src/lib/storage.ts` và viết nhánh migration tương ứng.

## Thêm trường vào dữ liệu lưu trữ

1. Thêm field vào `PersistedState` trong `src/lib/types.ts`.
2. Thêm giá trị mặc định trong `defaultState()` ở `src/lib/storage.ts`.
3. Thêm vào `persistedStateSchema` trong `src/lib/backup.ts` để import sao lưu không từ chối file mới.
4. Nếu field mới **bắt buộc** phải có giá trị suy ra từ dữ liệu cũ, bump `SCHEMA_VERSION` và thêm nhánh vào `migrate()`. Nếu giá trị mặc định là đủ thì không cần — `migrate()` đã hợp nhất với `defaultState()`.

## Những hướng mở rộng đáng cân nhắc

**Nhắc nhở thật sự (Web Push)** — cần backend giữ subscription, VAPID key và một scheduler. Đây là thay đổi lớn nhất về kiến trúc vì nó phá vỡ tính chất "không backend". Nếu làm: Cloudflare Workers + Durable Objects là lựa chọn nhẹ nhất.

**Đồng bộ nhiều thiết bị** — cần tài khoản và một server. Một bước trung gian rẻ hơn nhiều: đồng bộ file JSON qua thư mục cloud của người dùng bằng File System Access API (chỉ hoạt động trên Chromium).

**Thuật toán FSRS** — chính xác hơn SM-2 đáng kể, nhưng cần thêm dữ liệu lịch sử từng lần ôn (hiện chỉ lưu state hiện tại). Sẽ phải mở rộng `CardState` thành một mảng review log và bump schema.

**Chế độ nghe (TTS)** — `SpeechSynthesis` API có sẵn trong trình duyệt, dùng để ôn lúc di chuyển. Chất lượng giọng tiếng Việt tuỳ nền tảng.

**Bộ câu hỏi do người dùng thêm** — import từ file JSON và trộn vào bộ có sẵn. Lưu ý: khi đó nội dung không còn do mình kiểm soát, nên phần sanitize markdown (`src/lib/markdown.ts`) chuyển từ "phòng xa" thành "bắt buộc".

## Deploy ở nơi khác

App là static thuần trong `build/`, chạy được ở bất kỳ đâu.

- **Cloudflare Pages / Netlify / Vercel** — build `npm run build`, output `build`, **không** cần `BASE_PATH` vì app nằm ở gốc domain.
- **GitHub Pages** — cần `BASE_PATH=/<tên-repo>`; workflow `.github/workflows/deploy.yml` đã xử lý sẵn.
- **Nginx / bất kỳ web server nào** — copy thẳng thư mục `build`. Không có route động nên không cần cấu hình fallback.
