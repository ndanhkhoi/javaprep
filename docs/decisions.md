# Quyết định thiết kế

Ghi lại **vì sao** chọn như vậy, không phải mô tả code làm gì. Code tự nói được phần sau.

## Ngày là chuỗi `'YYYY-MM-DD'` local, không phải timestamp

Interval của SRS tính bằng ngày. Dùng timestamp mở ra hai lớp bug: thẻ đến hạn lúc 23:00 nhưng hiện sang hôm sau, và lệch ngày khi người dùng đổi múi giờ.

Chuỗi ISO date so sánh theo thứ tự từ điển tương đương so sánh thời gian, nên `state.due <= today` hoạt động đúng mà không cần parse. Đánh đổi: mất độ chính xác dưới một ngày — không quan trọng khi interval nhỏ nhất là 1 ngày.

Xem `src/lib/srs/date.ts`.

## SM-2 là hàm thuần, nhận `today` từ ngoài

`review(state, grade, today)` không đọc đồng hồ và không đụng storage. Đây là phần quyết định toàn bộ giá trị của app — sai ở đây thì lịch ôn vô nghĩa mà người dùng không có cách nào biết. Hàm thuần cho phép test mọi ca biên (sàn ease factor 1.3, trần interval 365, chuỗi sau khi quên) mà không cần mock thời gian.

## `interval` bị kẹp trần ở 365 ngày

SM-2 gốc không có trần. Với bộ 100 câu, interval vượt một năm không còn ý nghĩa thực tế — người dùng sẽ đổi việc hoặc bộ câu hỏi sẽ lỗi thời trước khi thẻ đến hạn.

## Thẻ chấm "Quên" quay lại ngay trong phiên

SM-2 gốc chỉ đặt lại `interval = 1`, tức là ôn lại vào ngày mai. Trong thực tế, thẻ vừa quên cần gặp lại **ngay** để việc học có hiệu quả. Hàng đợi phiên đẩy thẻ đó xuống cuối và người dùng gặp lại trong cùng phiên; state SM-2 vẫn được ghi đúng theo thuật toán.

## Quiz và flashcard dùng hai hệ thống state tách biệt

`cards` (SM-2) và `quiz` (`seen`/`correct`) không có đường nào chạm nhau. Lý do: quiz đo **nhận diện** (thấy đáp án đúng trong 4 lựa chọn), flashcard đo **hồi tưởng** (tự nhớ ra). Trộn kết quả quiz vào interval SRS sẽ làm lịch ôn lạc quan quá mức, vì đoán đúng 1/4 không chứng minh được điều gì.

## Xáo trộn lựa chọn quiz bằng cách xáo mảng chỉ số

`shuffleOptions` xáo một mảng chỉ số rồi tra lại vị trí mới của chỉ số đúng, thay vì xáo mảng chuỗi và ánh xạ thủ công. Cách này không để lại đường nào cho `options` và `correct` lệch nhau — lỗi mà nếu xảy ra sẽ khiến app chấm sai **mọi** câu, và người dùng sẽ tin vào đáp án sai. Có test 1000 vòng cho mọi vị trí ban đầu.

## `localStorage` chứ không phải IndexedDB

State cho 100 thẻ khoảng 15KB. `localStorage` đồng bộ nên không cần quản lý trạng thái loading ở mọi nơi. IndexedDB có ý nghĩa từ hàng megabyte trở lên hoặc khi cần truy vấn — không phải ở đây.

Ghi qua debounce 300ms để lật thẻ nhanh không gây giật, và flush ngay khi trang bị ẩn để đóng app giữa phiên không mất tiến độ.

## Nội dung tách thành phần nhẹ và phần tải lười

`answerLong` và `code` chiếm 73KB gzip trong tổng số 104KB của bộ câu hỏi, nhưng chỉ trang chi tiết dùng tới. Gộp hết vào bundle khởi động đưa initial JS lên 141KB gzip.

`scripts/build-content.ts` tách thành `generated/questions.json` (nạp ngay) và `generated/detail/<topic>.json` (tải lười theo chủ đề), đưa initial JS xuống **73KB gzip**. Service worker vẫn precache mọi chunk nên chế độ offline không đổi.

Đánh đổi: có thêm một bước sinh dữ liệu trước build. Chấp nhận được vì nó chạy trong `prebuild`/`predev`/`precheck` nên không ai phải nhớ.

## Không có Web Push

Nhắc ôn tập đúng nghĩa cần Web Push, tức là cần backend, VAPID key và một service để lên lịch. Điều đó phá vỡ tính chất "không backend" của dự án. Thêm nữa, hỗ trợ Web Push trên iOS Safari yêu cầu app đã được cài lên màn hình chính và vẫn không đáng tin cậy.

Thay thế: due count hiển thị ngay khi mở app, cộng `navigator.setAppBadge()` ở nền tảng hỗ trợ. Đây là mức nhắc nhở tốt nhất đạt được mà không cần server.

## Service worker tự viết thay vì Workbox

SvelteKit đã cung cấp `build`, `files`, `prerendered` và `version` qua `$service-worker`. Chiến lược cần thiết chỉ gồm hai quy tắc: cache-first cho asset có hash trong tên, network-first cho phần còn lại. Workbox nặng hơn nhiều so với 60 dòng code này và mang theo lớp trừu tượng không cần thiết.

Cache name gắn với `version`, nên mỗi lần deploy tự dọn sạch cache cũ.

## Có bản mới thì hiện toast, không tự reload

Tự reload giữa phiên ôn làm mất hàng đợi đang chạy. Toast để người dùng chọn thời điểm.

## Biểu đồ tự vẽ, không thêm thư viện charting

Ba biểu đồ (mức thành thạo theo chủ đề, dự báo 14 ngày, heatmap nhịp học) không đáng để thêm Chart.js (~70KB) hay bất kỳ thư viện charting nào.

Chỉ vòng tiến độ (`RingProgress`) dùng SVG, vì cung tròn cần `stroke-dasharray`. Hai biểu đồ còn lại dùng flex + phần trăm: ít DOM hơn SVG, tự co giãn theo container mà không cần `viewBox`, và animate được bằng `transition` trên `width`/`height`. Mỗi biểu đồ kèm bảng hoặc đoạn `sr-only` để screen reader đọc được số liệu.

## Ngưỡng "đã thuộc" là `interval >= 21` ngày

Đây là quy ước *mature card* của Anki. Chọn nó vì đã được cộng đồng SRS dùng rộng rãi và dễ giải thích, không phải vì có cơ sở lý thuyết riêng. Đổi ngưỡng chỉ cần sửa `MATURE_INTERVAL` trong `src/lib/srs/sm2.ts`.

## Dark mode điều khiển bằng class, không bằng media query

Dùng thẳng `prefers-color-scheme` thì người dùng không override được theme hệ thống. Class trên `<html>` cho phép ba lựa chọn: theo hệ thống / sáng / tối. Một script nhỏ trong `app.html` áp theme **trước khi paint** để không bị nháy màu.

## `ssr = false` cho toàn bộ app

App đọc `localStorage` ngay khi mount. Tắt SSR loại bỏ hoàn toàn lớp bug hydration mismatch mà không mất gì: đây là app cá nhân sau khi tải, không cần SEO hay first paint có nội dung từ server. Các trang vẫn được prerender ra HTML shell nên service worker precache được.

## Validator nội dung chạy trong CI

Nội dung sai về mặt kỹ thuật còn tệ hơn không có nội dung — người dùng sẽ học sai và tin vào điều đó. Validator kiểm schema, phân bổ theo chủ đề, độ dài `answerShort`, phân phối vị trí đáp án đúng (không quá 40% ở một vị trí, tránh đoán mò theo pattern), và trùng lặp gần đúng bằng Jaccard.

Nó không thay được việc rà soát bằng mắt về tính đúng đắn kỹ thuật, nhưng nó bắt được mọi lỗi cấu trúc.

## Deploy lên GitHub Pages với `paths.base`

Pages phục vụ app tại `/<tên-repo>`, nên `BASE_PATH` được truyền vào lúc build trong CI. SvelteKit sinh đường dẫn asset dạng tương đối nên phần lớn hoạt động ở mọi subpath; `base` chỉ cần cho các liên kết nội bộ do client dựng.

## Design language: OKLCH + hue dẫn xuất cho từng chủ đề

Toàn bộ màu khai báo bằng OKLCH. Lý do thực dụng chứ không phải theo trend: trong OKLCH, L là độ sáng cảm nhận được. Nhờ vậy `oklch(52% 0.165 <hue>)` cho **mọi** hue đều có cùng độ tương phản trên nền trắng — đổi hue không phá vỡ khả năng đọc.

Điều đó dẫn tới cách làm accent cho 11 chủ đề: mỗi chủ đề chỉ khai báo **một con số hue** trong `src/lib/theme/topic-accent.ts`, còn class `.accent` trong `app.css` dẫn xuất cả bộ (`--accent`, `--accent-soft`, `--accent-line`, `--accent-solid`) từ nó với L và C cố định. Thêm chủ đề mới là thêm một số, không phải thêm bảng màu và không phải kiểm tra lại tương phản.

Trạng thái (`ok`/`warn`/`bad`) có ba biến thể: bản gốc đủ tương phản để làm **màu chữ**, `-soft` để làm **nền**, `-solid` để làm **khối đặc**. Trước đây chỉ có một biến thể nên `text-warn` ở light mode chỉ đạt ~3:1.

## Tên class tự viết không được trùng namespace utility của Tailwind

Tailwind v4 sinh utility từ các namespace token. Layer `utilities` luôn thắng layer `components`, nên một class tự viết trùng tên sẽ bị ghi đè **âm thầm** — không lỗi build, không cảnh báo.

Lỗi này đã xảy ra hai lần trong lần refactor giao diện:

- `.bg-aurora` (nền gradient) bị `bg-aurora` sinh từ token `--color-aurora` ghi đè thành `background-color` đặc → panel hero thành một khối cyan, chữ mất hẳn.
- `.inline-md` (chữ markdown inline) bị `inline-md` sinh từ thang container ghi đè thành `inline-size: 28rem` → mọi tiêu đề câu hỏi rộng 448px và tràn ra khỏi thẻ.

Hai class đó giờ tên là `.aurora-mesh` và `.prose-inline`. Quy tắc: **không đặt tên class trùng tiền tố của bất kỳ utility Tailwind nào** (`bg-`, `text-`, `inline-`, `w-`, `animate-`, `max-w-`…). Cách kiểm tra sau khi build: tìm tên class trong CSS đã build và xác nhận nó chỉ có đúng những declaration mình viết.

## Font self-host, không dùng Google Fonts CDN

App phải chạy offline từ lần mở thứ hai. Nhúng `fonts.googleapis.com` phá điều đó: lần mở đầu không mạng là mất font, và mọi lần mở đều phụ thuộc một domain thứ ba.

Ba file woff2 (Inter latin, Inter vietnamese, JetBrains Mono latin — tổng ~99KB) nằm trong `src/lib/assets/fonts/`. Đặt trong `src/` chứ không phải `static/` để Vite gắn hash và tự viết lại URL trong CSS theo `paths.base` — nhờ vậy deploy ở subpath (GitHub Pages) vẫn đúng, và service worker precache chúng cùng các asset khác.

Chỉ lấy subset `latin` + `vietnamese`: `latin-ext` của Inter nặng 85KB mà tiếng Việt không cần tới nó (Ă, Đ, Ơ, Ư và các dấu tổ hợp nằm trong subset `vietnamese`).

## Sidebar xuất hiện từ `lg` (1024px), không phải `md` (768px)

Sidebar rộng 15rem. Bật nó ở 768px làm cột nội dung tụt xuống 464px — **hẹp hơn cả khi không có sidebar ở 767px**, và lưới 3 cột bị bóp đến mức tiêu đề thẻ vỡ thành từng chữ.

Ngưỡng đúng là 1024px, nơi còn lại 720px cho nội dung. Khoảng 768–1023px dùng dock nổi ở đáy như mobile nhưng nội dung tràn hết chiều rộng.

## Thẻ lật 3D thật, làm được vì hai mặt cân nhau

`transform-style: preserve-3d` + hai mặt xếp tuyệt đối trong một khung có `min-height` cố định. Cách này thường thất bại vì hai mặt lệch chiều cao gây nhảy layout, nhưng ở đây nó hợp lệ: `question` dài tối đa 133 ký tự và `answerShort` bị validator chặn ở 240 ký tự, nên chiều cao hai mặt chênh nhau không đáng kể.

`backface-visibility: hidden` chỉ ẩn phần vẽ, mặt đang úp vẫn nhận chuột — nên có thêm `pointer-events: none` cho mặt úp, và `tabindex="-1"` cho phần tử focus được trên đó.

Khi `prefers-reduced-motion: reduce`, phép quay bị tắt và hai mặt đổi nhau bằng `opacity` — vẫn đọc ra là hai mặt của một thẻ, không phải hai khối rời.

## View Transitions là tăng cường thuần

`onNavigate` gọi `document.startViewTransition` nếu có. Trình duyệt chưa hỗ trợ thì điều hướng diễn ra bình thường, chỉ không có hiệu ứng — không cần polyfill, không cần nhánh code thứ hai.

Phần animation nằm trong `app.css` dưới `@media (prefers-reduced-motion: no-preference)`, và `onNavigate` cũng tự kiểm tra media query đó trước khi bật transition: nếu chỉ dựa vào CSS thì view transition vẫn chạy (chỉ mất animation) và gây một khung đứng hình.

## Markdown inline được render trong tiêu đề câu hỏi

Nội dung câu hỏi, lựa chọn quiz và giải thích quiz có backtick (`` `ArrayList` ``) và `**đậm**`. Trước đây chúng được in ra dưới dạng chữ thuần nên người đọc thấy nguyên dấu markdown.

`renderInlineMarkdown()` dùng `marked.parseInline` (chứ không phải `parse`, vì `parse` bọc kết quả trong `<p>` và làm vỡ layout flex của các chỗ gọi) rồi sanitize với allowlist chỉ gồm `code`, `strong`, `em`, `br`.

Chỗ chỉ nhận chữ thuần — thẻ `<title>`, `aria-label` — dùng `stripInlineMarkdown()` để bỏ dấu markdown thay vì render.

## Chiều sâu dựng bằng bóng nhiều lớp ở light, viền sáng ở dark

`--shadow-1..3` là bóng nhiều lớp với blur lớn hơn offset, cho bóng mềm thay vì cảm giác "dán tem".

Trong dark mode bóng đổ gần như vô hình. Vì thế `.dark` định nghĩa lại thang bóng đậm hơn **và** `--edge` (viền sáng nội bộ ở cạnh trên, `inset 0 1px 0`) chuyển từ trắng đục sang trắng 6% — đúng cách các hệ điều hành tối dựng elevation.

`backdrop-filter` chỉ dùng ở thanh nổi trên nội dung (dock, top bar, toast). Không dùng cho panel chứa chữ dài: tương phản chữ sẽ dao động theo nội dung phía sau, và có kèm fallback `@supports not (backdrop-filter: …)` sang nền đặc.
