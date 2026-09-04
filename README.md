# JavaPrep

> PWA cá nhân, hoạt động offline — ôn 100 câu hỏi phỏng vấn Java & Spring Boot theo chủ đề, có flashcard, quiz và spaced repetition. Giao diện thích ứng: dock nổi trên điện thoại, sidebar + dashboard dạng bento trên desktop.

**Demo:** https://ndanhkhoi.github.io/javaprep/

## Mục tiêu

Ôn tập phỏng vấn Java/Spring Boot phần lớn diễn ra trên điện thoại, trong những khoảng thời gian ngắn: lúc chờ, lúc di chuyển, tối trước khi ngủ. JavaPrep được thiết kế đúng cho hoàn cảnh đó — mở là học được ngay, không cần mạng, không cần đăng nhập, và tự nhớ giúp bạn hôm nay nên ôn lại câu nào.

## Tính năng

| Chế độ | Dùng khi |
|---|---|
| **Danh sách** | Tra cứu theo chủ đề, tìm kiếm không dấu, đọc giải thích đầy đủ kèm code |
| **Flashcard** | Ôn chủ động: lật thẻ, tự chấm 4 mức, lịch ôn tự điều chỉnh theo SM-2 |
| **Quiz** | Kiểm tra nhanh bằng trắc nghiệm 4 lựa chọn, có giải thích ngay sau mỗi câu |
| **Tiến độ** | Số thẻ đến hạn, chuỗi ngày học, nhịp học dạng heatmap, mức thành thạo theo chủ đề, lịch ôn 14 ngày tới |

Ngoài ra:

- **Spaced repetition SM-2** — thẻ nhớ tốt giãn ra dần, thẻ hay quên quay lại sớm.
- **Offline hoàn toàn** sau lần mở đầu tiên; cài được lên màn hình chính như một app.
- **Badge số thẻ đến hạn** trên thanh điều hướng và trên icon app (nền tảng nào hỗ trợ).
- **Ưu tiên chỗ yếu** — quiz tự đưa lại những câu bạn hay trả lời sai.
- **Xuất / nhập tiến độ** dạng JSON để chuyển máy hoặc sao lưu; ghi đè và xoá đều hoàn tác được ngay sau đó.
- **Bộ lọc và từ khoá nằm trong URL** — chia sẻ được một lần tìm, và nút back trả về đúng kết quả cũ.
- **Dark mode**, tôn trọng `prefers-reduced-motion`, điều hướng được bằng bàn phím (vùng chạm 44px, tương phản đạt WCAG AA ở cả hai theme).
- **Layout thích ứng** — dock nổi ở mobile/tablet, sidebar cố định và lưới bento từ 1024px.
- **Thẻ lật 3D thật**, chuyển trang bằng View Transitions; tắt sạch khi user chọn giảm chuyển động.
- **Font self-host** (Inter + JetBrains Mono, subset latin + vietnamese) — không gọi CDN nào, giữ nguyên tính offline-first.

## Nội dung

100 câu chia theo 11 chủ đề, biên soạn bằng tiếng Việt và giữ nguyên thuật ngữ tiếng Anh — sát với cách phỏng vấn diễn ra trong thực tế. Mọi khẳng định về hành vi bám theo **Java 21 LTS** và **Spring Boot 3.x**.

| Chủ đề | Số câu | Chủ đề | Số câu |
|---|---|---|---|
| Java Core & OOP | 14 | Spring Core | 11 |
| Collections Framework | 11 | Spring Boot | 10 |
| Concurrency & Multithreading | 11 | Spring MVC & REST | 8 |
| JVM, Memory & GC | 8 | Spring Data JPA & Hibernate | 8 |
| Exception Handling | 5 | Spring Security | 4 |
| Java 8+ Modern | 10 | | |

Mỗi câu gồm: câu hỏi, đáp án ngắn (mặt sau flashcard), giải thích đầy đủ dạng markdown, ví dụ code khi cần, và một câu quiz 4 lựa chọn kèm giải thích.

## Tech stack

| | | Lý do |
|---|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) | Bundle nhỏ, prerender ra static thuần, không cần runtime server |
| Adapter | `@sveltejs/adapter-static` | 119 trang tĩnh, host được ở bất kỳ đâu |
| Styling | Tailwind CSS v4 | Design token OKLCH qua `@theme`; hue của 11 chủ đề dẫn xuất từ một biến duy nhất |
| Chữ | Inter + JetBrains Mono variable, self-host (~99KB) | Không phụ thuộc CDN nên offline vẫn đủ font; subset chỉ latin + vietnamese |
| Icon | Bộ SVG tự vẽ trong `components/ui/icons.ts` | App cần ~40 icon (gồm icon nhận diện 11 chủ đề); mọi package icon đều kéo theo cả bộ hàng nghìn glyph |
| Offline | Service worker tự viết (`$service-worker`) | Không thêm dependency; SvelteKit đã cung cấp danh sách asset và `version` |
| Lưu trữ | `localStorage` có versioning | ~15KB state cho 100 thẻ; IndexedDB là over-engineering ở quy mô này |
| Kiểm tra dữ liệu | Zod | Dùng chung cho validator nội dung và validate file sao lưu khi import |
| Markdown | `marked` + `DOMPurify` | Sanitize sẵn để không mở đường XSS nếu sau này nhập nội dung ngoài |
| Syntax highlight | `highlight.js/lib/core` (3 ngôn ngữ), tải lười | ~15KB thay vì ~300KB của bản đầy đủ |
| Test | Vitest | 126 test cho toàn bộ logic thuần |

Không có backend, không có tài khoản, không có tracking. Toàn bộ dữ liệu nằm trên máy bạn.

## Chạy local

Yêu cầu Node.js 22+.

```bash
npm install
npm run dev          # http://localhost:5173
```

Các lệnh khác:

```bash
npm run build              # sinh site tĩnh vào build/
npm run preview            # xem thử bản build
npm run test               # chạy unit test
npm run check              # kiểm tra kiểu (svelte-check)
npm run validate:content   # kiểm tra bộ 100 câu hỏi
npm run verify             # chạy tất cả những cái trên
```

> Service worker chỉ được đăng ký ở bản production. Muốn thử chế độ offline thì dùng `npm run build && npm run preview`.

## Kiến trúc

```
src/
  lib/
    data/          bộ câu hỏi (11 file theo chủ đề) + module tra cứu
    srs/           SM-2, tiện ích ngày, hàng đợi phiên ôn   — hàm thuần, có test
    quiz/          xáo trộn lựa chọn, chọn câu theo độ yếu  — hàm thuần, có test
    stats/         streak, thành thạo, dự báo, heatmap nhịp học — hàm thuần, có test
    stores/        state phản ứng + autosave có debounce
    theme/         hue accent theo chủ đề
    assets/fonts/  woff2 self-host, Vite gắn hash
    components/
      ui/          primitive: Button, Icon, RingProgress, SegmentedControl…
      shell/       app shell: SideNav, BottomDock, TopBar, ThemeToggle
      charts/      3 biểu đồ SVG/flex thuần
      …            component theo miền: Flashcard, QuizOption, TopicCard…
  routes/          các trang, toàn bộ prerender
scripts/
  build-content.ts     tách nội dung thành phần nhẹ + phần tải lười
  validate-content.ts  kiểm tra bộ câu hỏi, chạy trong CI
```

Nguyên tắc xuyên suốt: **mọi thứ quyết định tính đúng đắn đều là hàm thuần và có test** — SM-2, hàng đợi, xáo trộn lựa chọn, streak, dự báo. UI chỉ gọi chúng và hiển thị kết quả.

Chi tiết các quyết định thiết kế và lý do đằng sau: [`docs/decisions.md`](docs/decisions.md).
Hướng dẫn thêm câu hỏi, sửa giao diện và mở rộng tính năng: [`docs/extending.md`](docs/extending.md).

## Giới hạn đã biết

Đây là những đánh đổi có chủ đích, không phải bug:

- **Không có thông báo đẩy khi app đóng.** Web Push cần backend và VAPID key, còn iOS Safari thì không đáng tin cậy. Thay vào đó, số thẻ đến hạn hiện ngay trên thanh điều hướng khi bạn mở app, cộng với badge trên icon ở nền tảng hỗ trợ.
- **Tiến độ chỉ nằm trên một thiết bị.** Không có đồng bộ. Bù lại bằng xuất/nhập JSON trong phần Cài đặt.
- **Xoá dữ liệu trình duyệt là mất tiến độ.** Nên xuất sao lưu định kỳ.
- **Tự chấm điểm phụ thuộc vào sự trung thực.** Chấm "Dễ" cho qua sẽ làm lịch ôn mất tác dụng — đây là hạn chế cố hữu của mọi hệ SRS tự chấm.

## Đóng góp nội dung

Câu hỏi nằm trong `src/lib/data/topics/<chủ-đề>.json`. Thêm hoặc sửa xong thì chạy `npm run validate:content` — validator kiểm tra schema, phân bổ theo chủ đề, độ dài đáp án ngắn, phân phối vị trí đáp án đúng, và cả trùng lặp gần đúng giữa các câu.

Xem [`docs/extending.md`](docs/extending.md) để biết quy tắc biên soạn.

## Giấy phép

MIT — xem [LICENSE](LICENSE).
