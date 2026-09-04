---
phase: 6
title: "Progress Dashboard & Due Badge"
status: completed
priority: P2
dependencies: [4, 5]
effort: "M"
---

# Phase 6: Progress Dashboard & Due Badge

## Overview

Màn hình tiến độ: số thẻ đến hạn, streak, phân bố mức thành thạo theo chủ đề, lịch ôn sắp tới, thống kê quiz. Cộng thêm cơ chế "nhắc nhở" trong khả năng của một app không backend, và export/import dữ liệu.

## Requirements

**Functional**
- Badge số thẻ đến hạn hôm nay, hiện trên bottom nav (tab Ôn thẻ) và trên home.
- Streak: số ngày liên tiếp có ôn ít nhất 1 thẻ.
- Mức thành thạo theo chủ đề: `mới / đang học (interval < 21 ngày) / đã thuộc (interval ≥ 21 ngày)`, hiện dạng stacked bar.
- Lịch 14 ngày tới: số thẻ đến hạn mỗi ngày (bar chart).
- Thống kê quiz: tổng lượt, tỉ lệ đúng chung, top 5 câu hay sai nhất.
- Settings: `dailyNewLimit`, theme, export JSON, import JSON, reset toàn bộ tiến độ.
- `navigator.setAppBadge(dueCount)` khi API tồn tại — best-effort, không có thì bỏ qua im lặng.

**Non-functional**
- Chart vẽ bằng SVG thuần, không thêm thư viện charting (Chart.js ~70KB là không đáng cho 2 biểu đồ).
- Dashboard tính toán < 16ms với 100 thẻ.

## Architecture

**Ngưỡng "đã thuộc" = `interval >= 21` ngày.** Đây là ngưỡng quy ước của Anki (mature card) — chọn nó vì đã được dùng rộng rãi và dễ giải thích, không phải vì có cơ sở lý thuyết riêng. Ghi rõ trong `docs/extending.md` để sau này chỉnh được.

**Streak** — tính từ `studyLog: string[]`, field này đã có sẵn trong `PersistedState` v1 (Phase 1). Không cần bump `schemaVersion`.

`streak(log, today)`: đếm ngược từ `today` (hoặc từ `today - 1` nếu hôm nay chưa học — chưa học hôm nay **không** làm đứt streak cho tới hết ngày).

**Lịch 14 ngày**: gom `cards` theo `due`, chỉ đếm `due` trong `[today, today+13]`. Thẻ quá hạn dồn hết vào cột "Hôm nay" (đúng với thực tế: quá hạn thì phải ôn ngay).

**Chart SVG thuần**

```
src/lib/components/charts/
  StackedBar.svelte      # mastery theo topic
  ForecastBars.svelte    # 14 ngày tới
```
Nhận `data` + `max`, tính `%` rồi vẽ `<rect>`. Có `<title>` cho từng cột (tooltip native + accessible), và bảng số liệu ẩn (`sr-only`) cho screen reader.

**Export / Import**

- Export: `JSON.stringify(state)` → `Blob` → `<a download>` với tên `javaprep-progress-YYYY-MM-DD.json`.
- Import: `<input type="file">` → parse → **validate bằng Zod** trước khi ghi đè. File hỏng → báo lỗi rõ, không đụng vào state hiện tại.
- Import hiện confirm nêu rõ: "Sẽ ghi đè toàn bộ tiến độ hiện tại (X thẻ). Không hoàn tác được."

**setAppBadge**: gọi trong `$effect` ở `+layout.svelte`, bọc `if ('setAppBadge' in navigator)` và try/catch. Không hiện lỗi cho user nếu thất bại — đây là tính năng bonus, không phải chức năng cốt lõi.

## Related Code Files

- Create: `src/routes/progress/+page.svelte`, `src/routes/settings/+page.svelte`
- Create: `src/lib/stats/mastery.ts`, `src/lib/stats/streak.ts`, `src/lib/stats/forecast.ts` (+ test cho cả 3)
- Create: `src/lib/components/charts/StackedBar.svelte`, `ForecastBars.svelte`
- Create: `src/lib/components/StatTile.svelte`, `DueBadge.svelte`
- Create: `src/lib/backup.ts` — export/import + Zod validate
- Modify: `src/lib/stores/progress.svelte.ts` — ghi `studyLog` khi `gradeCard`
- Modify: `src/lib/components/BottomNav.svelte` — gắn `DueBadge`
- Modify: `src/routes/+layout.svelte` — `setAppBadge`

## Implementation Steps

1. `progress.svelte.ts`: `gradeCard` push `todayLocal()` vào `studyLog` nếu chưa có, cắt bớt quá 365 phần tử.
2. `streak.ts`: pure function `(log: string[], today: string) => number`. Test kỹ các ca biên.
3. `mastery.ts`: `(cards, questions) => Record<topicId, {new, learning, mature}>`.
4. `forecast.ts`: `(cards, today) => {date, count}[]` độ dài 14, quá hạn dồn vào cột đầu.
5. Chart component SVG, kèm `sr-only` table.
6. Trang `/progress`: hàng `StatTile` (đến hạn / streak / đã thuộc / tỉ lệ quiz) → StackedBar → ForecastBars → top 5 câu hay sai.
7. `backup.ts` + trang `/settings`.
8. `DueBadge` trên bottom nav; `setAppBadge` trong layout effect.

## Tests / Validation

`streak.test.ts` — nhiều ca biên nhất:
- Log rỗng → 0.
- Học hôm nay + 4 ngày trước liên tục → 5.
- Học đến hôm qua, hôm nay chưa học → vẫn trả về streak (chưa đứt).
- Nghỉ 2 ngày rồi học lại → streak tính từ lần học lại.
- Log có ngày trùng lặp → không đếm đôi.

`mastery.test.ts`: `interval = 20` → learning; `interval = 21` → mature; chưa có state → new.

`forecast.test.ts`: thẻ quá hạn 5 ngày → nằm ở cột index 0; thẻ due sau 20 ngày → không xuất hiện.

Kiểm tay:
- Export → xoá `localStorage` → import lại → tiến độ khôi phục nguyên vẹn.
- Import file JSON rác → báo lỗi, state cũ không bị đụng.
- Chart hiển thị đúng ở 320px, không tràn.

## Success Criteria

- [ ] Badge đến hạn khớp chính xác với số thẻ mà `buildSession` trả về.
- [ ] `streak` đúng ở mọi ca biên đã liệt kê (có test).
- [ ] Chart vẽ bằng SVG thuần, không thêm dependency charting.
- [ ] Chart có `sr-only` table cho screen reader.
- [ ] Export → import round-trip khôi phục 100% state.
- [ ] Import file hỏng không phá state hiện tại.
- [ ] `setAppBadge` fail im lặng trên nền tảng không hỗ trợ.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Import ghi đè mất tiến độ nhiều tháng | Cao | Zod validate trước; confirm nêu rõ số thẻ sẽ mất; gợi ý export trước khi import |
| Badge đến hạn lệch với hàng đợi thật → mất niềm tin vào app | Trung bình | Cả hai dùng chung `buildSession`/cùng predicate `due <= today`, không tính hai đường |
| Streak sai ở ranh giới nửa đêm | Trung bình | Dùng chung `todayLocal()` với Phase 4 |
| `setAppBadge` throw trên iOS | Thấp | Feature-detect + try/catch, không báo lỗi cho user |
