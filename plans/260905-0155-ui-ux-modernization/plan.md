# Refactor UI/UX theo design language hiện đại — "JavaPrep Aurora"

Trạng thái: **hoàn thành** (2026-09-05)

## Mục tiêu

Nâng lớp trình bày của app từ "sạch nhưng phẳng" lên mức có bản sắc thị giác rõ ràng,
giữ **nguyên 100% chức năng** và không đổi contract của `src/lib` (SRS, quiz, storage, stats).

## Nghiên cứu — xu hướng được chọn áp dụng

Nguồn tham khảo (xu hướng 2026): calm interface, dimensional/spatial depth, bento grid,
typography as identity, layered motion system có escape hatch, accessibility as infrastructure.

| Xu hướng | Áp dụng | Lý do |
| --- | --- | --- |
| Spatial depth (layer, translucency, z-hierarchy) | ✅ | Thay flat bằng thang elevation + glass ở nav/overlay. Chiều sâu mà không tốn JS. |
| Bento grid / modular dashboard | ✅ | Giải đúng vấn đề hiện tại: mọi trang bị kẹp `max-w-lg`, desktop bỏ trống 80% màn hình. |
| Typography as identity | ✅ | Self-host Inter + JetBrains Mono variable, thang chữ fluid `clamp()`. |
| Layered motion + reduced-motion | ✅ | View Transitions, `@starting-style`, lật 3D — tắt sạch khi user yêu cầu. |
| Accessibility as infrastructure | ✅ | Giữ toàn bộ a11y đang có, bổ sung landmark, `aria-current`, heading hierarchy. |
| Calm interface | ✅ | Không auto-play, không parallax, không âm thanh. Chuyển động chỉ phản hồi hành động. |
| Generative UI / AI personalization | ❌ | App không có backend, không có LLM. Thêm vào là kiến trúc giả. |
| Kinetic scroll-driven typography | ❌ | Đây là app học tập dùng hàng ngày, không phải landing page. Gây nhiễu khi đọc. |
| Glassmorphism toàn cục | ❌ | Chỉ dùng ở nav/overlay nổi trên nội dung. Dùng cho panel chữ dài làm tụt tương phản. |

## Đã làm

**Nền tảng**

- Hệ token OKLCH đầy đủ: 4 bậc bề mặt + `elevated`, 3 bậc chữ, trạng thái 3 biến thể
  (chữ / nền / khối đặc), thang bóng nhiều lớp, thang bo góc, thang chữ fluid, thang
  chuyển động. Toàn bộ có bản dark tương ứng.
- Accent riêng cho 11 chủ đề, dẫn xuất từ **một** biến hue (`src/lib/theme/topic-accent.ts`).
- Self-host font: Inter (latin + vietnamese) + JetBrains Mono (latin), ~99KB, đặt trong
  `src/` để Vite gắn hash và service worker precache → offline không mất font.
- Bộ icon SVG tự vẽ (~25 icon) thay vì thêm package icon.
- Icon app + favicon vẽ lại theo brand mới, có SVG nguồn trong `scripts/icons/`.

**Layout**

- App shell thích ứng: dock nổi (glass, con trỏ trượt) dưới 1024px, sidebar rail + top bar
  từ 1024px, nội dung mở tới `max-w-6xl`.
- Home và Progress chuyển sang lưới bento; các trang tập trung (phiên ôn, quiz) căn giữa
  dọc trên desktop.

**Component**

- Primitive mới: `Button`, `Icon`, `RingProgress`, `SegmentedControl`, `FilterChip`,
  `StatTile`, `PageHeader`, `SectionHeading`, `Celebrate`, `InlineMarkdown`.
- Shell: `SideNav`, `BottomDock`, `TopBar`, `ThemeToggle` (lối tắt xoay vòng theme).
- Viết lại: `Flashcard` (lật 3D thật), `GradeButtons`, `QuizOption`, `TopicCard`,
  `QuestionListItem`, `DifficultyBadge`, `ProgressBar`, `CodeBlock`, `UpdateToast`.
- Biểu đồ: `MasteryBars`, `ForecastChart` (viết lại), `StreakHeatmap` (mới, kèm module
  thuần `stats/heatmap.ts` + 7 test).

**Nội dung**

- Markdown inline (`` `code` ``, `**đậm**`) giờ được render trong tiêu đề câu hỏi, lựa chọn
  quiz và giải thích — trước đây hiện nguyên dấu markdown.

## Lỗi tìm được trong lúc review (đo, không đoán)

1. **`.bg-aurora` bị Tailwind ghi đè.** Token `--color-aurora` sinh utility `bg-aurora`;
   layer `utilities` thắng layer `components` → panel hero thành khối cyan đặc, chữ mất hẳn.
   → đổi tên thành `.aurora-mesh`.
2. **`.inline-md` bị Tailwind ghi đè** thành `inline-size: 28rem` (namespace `inline-*` lấy
   từ thang container) → mọi tiêu đề câu hỏi rộng 448px và tràn khỏi thẻ, đè lên badge
   độ khó. → đổi tên thành `.prose-inline`.
   Tìm ra bằng cách đo chuỗi tổ tiên qua CDP: cha rộng 225px nhưng con có `width: 448px`.
3. **Tràn ngang bị `body { overflow-x: hidden }` che.** Không có scrollbar nên lỗi chỉ lộ ra
   ở chỗ chữ đè nhau. Đo `scrollWidth` vs `clientWidth` từng route ở 390px: 4 route tràn.
   Sau khi sửa: cả 10 route đều bằng nhau.
4. **Sidebar ở `md` làm layout tệ hơn không có sidebar.** Ở 768px, cột nội dung còn 464px —
   hẹp hơn 768px của khổ 767px. → chuyển ngưỡng sang `lg`.
5. Cột biểu đồ dự báo bo cả 4 góc nên cột thấp thành viên thuốc → bo góc trên + đường trục.
6. Track `ProgressBar` dùng `surface-3`, trong dark mode gần trùng nền card → `surface-4`.

## Kiểm chứng

- `npm run verify` xanh: validate nội dung → 126 test → `svelte-check` 0 error 0 warning → build.
- Smoke test chức năng qua CDP trên bản build thật: **34/34 pass**, không có lỗi console.
  Phủ: lật thẻ, chấm điểm, phím tắt, hàng đợi "Quên" quay lại, quiz (chọn/khoá/phản hồi/
  chuyển câu/kết quả), bộ lọc trang chủ đề, tìm kiếm không dấu + xoá từ khoá, xoay vòng
  theme, ghi localStorage, code highlight, markdown inline, đổi giới hạn thẻ mới, `aria-current`.
- Không tràn ngang ở 390 / 768 / 1920px trên cả 10 route.
- Rà soát tên class tự viết trong CSS đã build: không còn xung đột utility nào.

## Acceptance criteria

- [x] Toàn bộ 10 route hoạt động như trước, không mất tính năng nào.
- [x] Desktop dùng hết chiều rộng với sidebar + bento; mobile/tablet giữ dock nav.
- [x] `prefers-reduced-motion: reduce` tắt hết flip/transition/view-transition/confetti.
- [x] Không có font/CSS/JS tải từ domain ngoài.
- [x] `npm run verify` xanh; `svelte-check` 0 error 0 warning.
