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

1. Thêm một mục vào `src/lib/data/topics.json` (`id` kebab-case, `blurb` một dòng, `order` chưa bị dùng).
2. Tạo `src/lib/data/topics/<id>.json`.
3. Import và nối vào mảng trong `src/lib/data/authored.ts`.
4. Thêm một góc hue vào `HUE_BY_TOPIC` trong `src/lib/theme/topic-accent.ts` — chọn số cách các hue đang có tối thiểu ~25 độ. Bỏ bước này thì chủ đề vẫn hiển thị đúng, chỉ dùng màu brand mặc định.
5. Thêm một icon vào `ICON_BY_TOPIC` trong `src/lib/theme/topic-icon.ts` (tên lấy từ `icons.ts`). Bỏ bước này thì chủ đề dùng icon `book` mặc định.
6. Thêm số lượng câu vào `EXPECTED_PER_TOPIC` trong `scripts/validate-content.ts`.
7. `npm run validate:content && npm run verify`.

Trang topic và trang chi tiết tự sinh từ dữ liệu — không cần thêm route.

## Sửa giao diện

### Design token

Tất cả nằm trong `src/app.css`. Không hardcode màu, bo góc, bóng hay thời lượng ở component — sửa token là đổi cả app.

| Nhóm | Token | Ghi chú |
|---|---|---|
| Bề mặt | `--color-surface`, `-2`, `-3`, `-4`, `--color-elevated` | Thang 4 bậc; `elevated` cho phần tử nổi khỏi mặt phẳng |
| Chữ | `--color-ink`, `--color-ink-muted`, `--color-ink-subtle` | Ba bậc, để không phải hạ opacity (opacity làm chữ mờ, không chỉ nhạt) |
| Trạng thái | `--color-ok/warn/bad` + `-soft` + `-ink` + `-solid` | Bản gốc an toàn cho **chữ**, `-soft` cho **nền nhạt**, `-ink` cho **chữ nằm trên bản gốc** (badge, chip đặc), `-solid` cho **khối đồ hoạ** (cột, vòng, đoạn bar). Không đặt chữ lên `-solid` |
| Chiều sâu | `--shadow-1..3`, `--shadow-glow`, `--edge` | `.dark` định nghĩa lại cả thang bóng và `--edge` |
| Bo góc | `--radius-sm..3xl` | `xl` cho card, `2xl` cho panel lớn |
| Cỡ chữ | `--text-2xs`, `--text-heading/title/display` | `2xs` là 12px — bậc nhỏ nhất được dùng cho chữ; ba cỡ lớn dùng `clamp()` nên không cần breakpoint |
| Nhãn eyebrow | `--tracking-eyebrow` + class `.eyebrow` | Nhãn in hoa mở đầu khối; chỉ truyền màu từ ngoài |
| Chuyển động | `--dur-fast/--dur/--dur-slow`, `--ease-out-quart/spring/soft` | Mọi transition dùng ba mốc này |

Mỗi giá trị trong `@theme` phải được định nghĩa lại trong khối `.dark` nếu dark mode cần khác.

### Quy tắc đặt tên class tự viết

**Không đặt tên class trùng tiền tố của bất kỳ utility Tailwind nào** (`bg-`, `text-`, `inline-`, `w-`, `max-w-`, `animate-`…). Layer `utilities` thắng layer `components` nên class của bạn sẽ bị ghi đè âm thầm — không lỗi build, không cảnh báo. Xem [`decisions.md`](decisions.md) cho hai lần việc này đã xảy ra.

Cách kiểm tra sau khi thêm một class vào `@layer components`: chạy `npm run build`, rồi tìm tên class đó trong CSS đã sinh ra dưới `_app/immutable/assets/` — kết quả phải chỉ chứa đúng những declaration mình viết. Nếu thấy thêm một rule lạ (ví dụ `inline-size`, `background-color` mà mình không khai) thì tên class đang trùng utility.

### Thêm icon

`src/lib/components/ui/icons.ts` là một map `tên → path`, vẽ trên khung `24x24`, chỉ dùng stroke (`fill="none"`) và không đặt `stroke-width` riêng — `Icon.svelte` truyền giá trị đó vào. Thêm một entry là dùng được ngay kèm type-safety, vì `IconName` suy ra từ chính map đó.

Không dùng emoji làm icon giao diện: emoji do font hệ thống vẽ nên mỗi nền tảng ra một hình khác nhau, không nhận `currentColor` và không cùng độ dày nét với bộ icon còn lại. Icon nhận diện chủ đề vì thế nằm ở `topic-icon.ts` chứ không nằm trong dữ liệu.

### Vùng chạm và cỡ chữ

Phần tử bấm được cao tối thiểu 44px ở màn hình cảm ứng (`min-h-11`), có thể gọn lại 40px từ `sm` trở lên. Link chữ nhỏ dùng `min-h-11` cộng `-ms-2 px-2` để mở rộng vùng chạm mà không đổi khoảng cách nhìn thấy. Chữ không dùng cỡ nhỏ hơn `text-2xs` (12px); các nhãn trục biểu đồ là ngoại lệ duy nhất vì chúng đã có bảng số liệu cho screen reader.

### Sinh lại icon app

Nguồn là `scripts/icons/mark.svg` (bản thường) và `scripts/icons/mark-maskable.svg` (nền tràn viền, hình nằm trong vùng an toàn 80% vì hệ điều hành sẽ cắt theo hình dạng riêng). Cần `rsvg-convert` (`brew install librsvg`):

```bash
cp scripts/icons/mark.svg static/icons/favicon.svg
rsvg-convert -w 192 -h 192 scripts/icons/mark.svg -o static/icons/icon-192.png
rsvg-convert -w 512 -h 512 scripts/icons/mark.svg -o static/icons/icon-512.png
rsvg-convert -w 512 -h 512 scripts/icons/mark-maskable.svg -o static/icons/icon-maskable-512.png
```

Đổi màu brand thì nhớ cập nhật cả `theme_color` trong `static/manifest.webmanifest` và hai thẻ `theme-color` trong `src/app.html`.

### Thay font

Font nằm trong `src/lib/assets/fonts/` và được khai báo bằng `@font-face` ở đầu `src/app.css`. Đặt trong `src/` (không phải `static/`) là có chủ đích: Vite gắn hash và tự viết lại URL theo `paths.base`, nên deploy ở subpath vẫn đúng.

Lấy subset mới từ Google Fonts bằng cách đọc CSS của họ để lần ra URL woff2 theo từng subset, rồi tải về `src/lib/assets/fonts/`:

```bash
curl -sA "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
```

Nhớ copy cả `unicode-range` tương ứng vào `@font-face` — thiếu nó thì trình duyệt tải mọi subset thay vì chỉ subset cần dùng. Tiếng Việt cần đúng hai subset: `latin` + `vietnamese`.

### Breakpoint của app shell

Sidebar bật ở `lg` (1024px), dock đáy hiện dưới `lg`. Hai thứ này phải đổi cùng nhau, ở bốn chỗ: `SideNav.svelte` (`lg:flex`), `BottomDock.svelte` (`lg:hidden`), `TopBar.svelte` (các `lg:` cho nhãn brand và ô tìm kiếm), và `+layout.svelte` (`lg:pl-60`, `lg:pb-14`). Trang phiên ôn và quiz cũng dùng `lg:` để căn giữa dọc — việc đó chỉ đúng khi dock đã biến mất.

Đừng hạ xuống `md`: xem [`decisions.md`](decisions.md) cho số đo cụ thể.

### Kiểm tra tràn ngang

`body` có `overflow-x: hidden` nên tràn ngang **không** tạo scrollbar — nó bị cắt âm thầm và chỉ lộ ra ở chỗ chữ đè lên nhau hoặc chạy khỏi thẻ. Cách phát hiện đáng tin: mở từng route ở khổ 390px và so `document.documentElement.scrollWidth` với `clientWidth`; bằng nhau là sạch.

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
