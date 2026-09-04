---
phase: 4
title: "SM-2 Engine & Flashcard"
status: pending
priority: P1
dependencies: [1, 2]
effort: "M"
---

# Phase 4: SM-2 Engine & Flashcard

## Overview

Cài đặt thuật toán SM-2 thuần (pure function, có test) và chế độ flashcard: lật thẻ, tự chấm 4 mức, lên lịch ôn lại. Đây là trái tim của app — sai ở đây làm hỏng toàn bộ giá trị spaced repetition.

## Requirements

**Functional**
- Phiên ôn gồm: thẻ đến hạn (due) + thẻ mới (giới hạn `dailyNewLimit`, mặc định 10).
- Mặt trước: câu hỏi. Chạm/vuốt để lật. Mặt sau: `answerShort` + link "Xem đầy đủ".
- 4 nút chấm: **Quên** (q=0) / **Khó** (q=3) / **Được** (q=4) / **Dễ** (q=5).
- Mỗi nút hiện trước khoảng thời gian sẽ ôn lại ("3 ngày", "2 tuần") để user chấm có thông tin.
- Thẻ chấm "Quên" quay lại cuối hàng đợi trong cùng phiên (relearn ngay), không chỉ đẩy sang mai.
- Hoàn thành phiên → màn hình tổng kết: số thẻ đã ôn, tỉ lệ nhớ, số thẻ đến hạn kế tiếp.
- Lọc phiên theo chủ đề (tuỳ chọn) hoặc học tất cả.

**Non-functional**
- SM-2 là pure function, không đụng DOM/storage — test được độc lập.
- Lật thẻ ≤ 200ms, tôn trọng `prefers-reduced-motion`.
- Ghi state sau mỗi lần chấm (debounce) — đóng app giữa chừng không mất tiến độ.

## Architecture

**Trạng thái mỗi thẻ**

```ts
export type CardState = {
  ef: number;          // ease factor, khởi tạo 2.5, sàn 1.3
  reps: number;        // số lần trả lời đúng liên tiếp
  interval: number;    // ngày
  due: string;         // 'YYYY-MM-DD' (local date, không phải ISO timestamp)
  lapses: number;      // số lần quên — dùng cho thống kê
  lastGrade: 0 | 3 | 4 | 5 | null;
};
```

**Thuật toán SM-2** (`src/lib/srs/sm2.ts`)

```ts
export function review(state: CardState, q: 0 | 3 | 4 | 5, today: Date): CardState {
  // 1. Cập nhật ease factor — SM-2 gốc áp dụng cho MỌI grade, kể cả fail
  let ef = state.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  let reps: number, interval: number, lapses = state.lapses;

  if (q < 3) {
    // Fail: reset chuỗi, ôn lại sau 1 ngày
    reps = 0;
    interval = 1;
    lapses += 1;
  } else {
    reps = state.reps + 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(state.interval * ef);
  }

  return { ef, reps, interval, lapses, lastGrade: q, due: addDays(today, interval) };
}

export const NEW_CARD: CardState = {
  ef: 2.5, reps: 0, interval: 0, due: '', lapses: 0, lastGrade: null,
};
```

**Quyết định quan trọng — `due` là ngày local, không phải timestamp.**
Dùng `'YYYY-MM-DD'` theo múi giờ máy, so sánh bằng chuỗi. Tránh hoàn toàn lớp bug "thẻ đến hạn lúc 23:00 nhưng hiện sang ngày hôm sau" và bug lệch múi giờ khi đi công tác. Đổi lại: mất độ chính xác dưới ngày — không quan trọng với interval tính bằng ngày.

**Xây hàng đợi phiên** (`src/lib/srs/queue.ts`)

```ts
buildSession({ cards, questions, today, dailyNewLimit, topicFilter }): Question[]
```
1. `due` = thẻ có state và `state.due <= today`.
2. `new` = câu chưa có state, lấy tối đa `dailyNewLimit`, ưu tiên độ khó `easy` trước rồi `medium`, `hard`.
3. Trộn: xen thẻ mới vào giữa thẻ due thay vì dồn cuối (tránh cảm giác "dồn toa" ở cuối phiên).
4. Trong phiên, thẻ chấm q<3 được `push` lại vào cuối hàng đợi — relearn ngay, và chỉ commit state cuối cùng khi thẻ ra khỏi hàng đợi.

**Routes**

```
src/routes/study/+page.svelte        # chọn phạm vi phiên (tất cả / theo topic)
src/routes/study/session/+page.svelte # phiên ôn thực tế
```
Phiên là client-side state, không cần route động → prerender bình thường.

## Related Code Files

- Create: `src/lib/srs/sm2.ts`, `src/lib/srs/sm2.test.ts`
- Create: `src/lib/srs/queue.ts`, `src/lib/srs/queue.test.ts`
- Create: `src/lib/srs/date.ts` — `todayLocal()`, `addDays()`, `daysBetween()`, `formatInterval()`
- Create: `src/routes/study/+page.svelte`, `src/routes/study/session/+page.svelte`
- Create: `src/lib/components/Flashcard.svelte`, `GradeButtons.svelte`, `SessionSummary.svelte`
- Modify: `src/lib/stores/progress.svelte.ts` — `gradeCard(id, q)`, derived `dueCount`

## Implementation Steps

1. `date.ts` trước tiên: `todayLocal()` trả `'YYYY-MM-DD'` từ giờ local. Test với vài múi giờ giả lập.
2. `sm2.ts` theo spec trên. Test trước khi viết UI.
3. `queue.ts`: `buildSession` + `interleaveNew`. Test đầu vào tổng hợp.
4. `progress.svelte.ts`: `gradeCard(id, q)` gọi `review()` rồi ghi vào `$state.cards`, autosave debounce.
5. `Flashcard.svelte`: mặt trước/sau, animation flip qua CSS `transform` — bọc trong `@media (prefers-reduced-motion: no-preference)`, không có motion thì đổi thẳng nội dung.
6. `GradeButtons.svelte`: 4 nút, mỗi nút gọi `review()` ở chế độ "dry run" để hiện trước interval. Vùng chạm ≥ 44×44px.
7. Vuốt: `Escape`/tap để lật; thêm swipe-left/right chỉ khi đã có bàn phím fallback (nút luôn là đường chính, swipe là bổ trợ).
8. `SessionSummary.svelte`: đếm theo `lastGrade`, hiện "Đến hạn tiếp theo: X thẻ vào ngày Y".
9. Xử lý phiên rỗng: "Hôm nay không có thẻ nào đến hạn 🎉" + nút "Học thêm thẻ mới".

## Tests / Validation

Vitest cho `sm2.ts` — đây là phần bắt buộc phải có test:

- Thẻ mới, q=4 → `reps=1, interval=1, ef≈2.5`.
- Lần 2, q=4 → `reps=2, interval=6`.
- Lần 3, q=4, ef=2.5 → `interval = round(6 * 2.5) = 15`.
- q=5 nhiều lần → `ef` tăng dần nhưng không vượt quá mức hợp lý.
- q=0 nhiều lần → `ef` giảm và **kẹp sàn ở 1.3**, không xuống dưới.
- q=0 sau chuỗi dài → `reps=0, interval=1, lapses+1`, `ef` giữ giá trị đã giảm (không reset về 2.5).
- q=3 → `ef` giảm nhẹ, `reps` vẫn tăng (q≥3 là pass).

`queue.test.ts`:
- Không vượt `dailyNewLimit`.
- Thẻ due hôm qua và hôm nay đều được lấy; thẻ due ngày mai thì không.
- `topicFilter` lọc đúng.
- Thẻ mới được xen kẽ, không dồn cuối.

Kiểm tay:
- Chấm 1 thẻ → reload trang → state giữ nguyên.
- Chấm "Quên" → thẻ quay lại trong cùng phiên.

## Success Criteria

- [ ] `sm2.ts` là pure function, 100% nhánh được test phủ.
- [ ] `ef` không bao giờ xuống dưới 1.3 (có test).
- [ ] `due` lưu dạng `'YYYY-MM-DD'` local, so sánh chuỗi hoạt động đúng qua ranh giới nửa đêm.
- [ ] 4 nút chấm hiện trước interval chính xác, khớp với state sau khi chấm.
- [ ] Thẻ "Quên" relearn trong cùng phiên.
- [ ] Đóng app giữa phiên → mở lại không mất thẻ đã chấm.
- [ ] Vùng chạm mọi nút ≥ 44×44px.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Cài sai công thức SM-2 → lịch ôn vô nghĩa, user học sai nhịp mà không biết | Rất cao | Pure function + bộ test bám sát spec gốc, viết test **trước** UI |
| Bug múi giờ / ranh giới nửa đêm | Cao | Dùng `'YYYY-MM-DD'` local thay vì timestamp; test `todayLocal()` |
| `interval` phình vô hạn sau nhiều lần "Dễ" | Trung bình | Kẹp trần `interval` ở 365 ngày trong `review()` |
| Ghi `localStorage` mỗi lần chấm gây giật | Thấp | Debounce 300ms; state 100 thẻ chỉ ~15KB |
| User chấm "Dễ" bừa để chạy nhanh → dữ liệu SRS rác | Thấp | Ngoài phạm vi MVP; ghi vào docs như hạn chế cố hữu của self-grading |
