---
phase: 5
title: "Quiz Mode"
status: completed
priority: P2
dependencies: [1, 2]
effort: "S"
---

# Phase 5: Quiz Mode

## Overview

Chế độ trắc nghiệm: chọn phạm vi (chủ đề / tất cả) và số câu, trả lời 4 lựa chọn, phản hồi ngay kèm giải thích, kết thúc có bảng điểm và danh sách câu sai để ôn lại.

## Requirements

**Functional**
- Cấu hình nhanh: phạm vi (tất cả / 1 chủ đề) + số câu (10 / 20 / tất cả).
- Mỗi câu: câu hỏi + 4 lựa chọn. Chọn xong khoá đáp án, tô xanh đúng / đỏ sai, hiện `explanation`.
- Thứ tự câu **và** thứ tự option đều xáo trộn mỗi lần chơi.
- Thanh tiến độ + đếm số đúng theo thời gian thực.
- Kết thúc: điểm số, thời gian, danh sách câu sai kèm link tới trang chi tiết.
- Ghi `QuizStat` mỗi câu (`seen`, `correct`) để dashboard dùng ở Phase 6.

**Non-functional**
- Quiz **không** ghi vào SM-2 `CardState`. Hai hệ thống tách biệt — quiz đo nhận diện, flashcard đo hồi tưởng; trộn vào nhau làm hỏng interval.
- Chơi được hoàn toàn offline.

## Architecture

```
src/routes/quiz/+page.svelte           # cấu hình phiên
src/routes/quiz/play/+page.svelte      # chơi
```

**Xáo trộn có kiểm soát**

```ts
// src/lib/quiz/shuffle.ts
export function shuffleOptions(q: Question, rng: () => number): ShuffledQuestion {
  // Fisher-Yates trên mảng chỉ số, trả về options mới + correct index MỚI
}
```
Xáo option phải map lại `correct` sang chỉ số mới — đây là chỗ dễ sai nhất và bắt buộc có test.

**Chọn câu ưu tiên**: khi số câu < tổng câu trong phạm vi, ưu tiên theo thứ tự:
1. Câu đã sai lần gần nhất (`quiz[id].seen > 0 && correct/seen < 0.5`).
2. Câu chưa từng thấy (`seen === 0`).
3. Còn lại chọn ngẫu nhiên.

Nhờ vậy quiz tự tập trung vào chỗ yếu thay vì random đều.

**State phiên**: giữ trong component (`$state`), không persist. Rời giữa chừng = mất phiên — chấp nhận được vì quiz ngắn (khác flashcard). Có confirm khi bấm back giữa phiên.

**QuizStat** ghi vào `progress` ngay sau mỗi câu trả lời (không đợi hết phiên) — rời giữa chừng vẫn giữ được dữ liệu đã trả lời.

```ts
export type QuizStat = { seen: number; correct: number; lastAt: string };
```

## Related Code Files

- Create: `src/routes/quiz/+page.svelte`, `src/routes/quiz/play/+page.svelte`
- Create: `src/lib/quiz/shuffle.ts`, `src/lib/quiz/shuffle.test.ts`
- Create: `src/lib/quiz/select.ts`, `src/lib/quiz/select.test.ts`
- Create: `src/lib/components/QuizOption.svelte`, `QuizResult.svelte`, `ProgressBar.svelte`
- Modify: `src/lib/stores/progress.svelte.ts` — `recordQuizAnswer(id, isCorrect)`

## Implementation Steps

1. `shuffle.ts`: Fisher-Yates, nhận `rng` injectable để test deterministic.
2. `select.ts`: chọn câu theo thứ tự ưu tiên ở trên.
3. `progress.svelte.ts`: `recordQuizAnswer(id, isCorrect)` cập nhật `seen`/`correct`/`lastAt`.
4. Trang cấu hình: 2 nhóm chip (phạm vi, số câu) + nút "Bắt đầu". Truyền config qua query string để reload không mất lựa chọn.
5. Trang chơi:
   - `QuizOption.svelte` là `<button>` thật (không phải `<div>`), có `aria-pressed`, disabled sau khi chọn.
   - Sau khi chọn: tô màu, hiện `explanation` trong vùng expand, nút "Câu tiếp".
   - Màu **không phải** tín hiệu duy nhất — thêm icon ✓/✗ cho người mù màu.
6. `QuizResult.svelte`: điểm `x/n`, phần trăm, thời gian, list câu sai (câu hỏi + đáp án đúng + link chi tiết), nút "Chơi lại" / "Ôn câu sai bằng flashcard".
7. Confirm khi rời giữa phiên (`beforeNavigate` từ `$app/navigation`).

## Tests / Validation

`shuffle.test.ts` — quan trọng nhất:
- Sau khi xáo, `options[correct]` phải bằng đúng option đúng ban đầu. Chạy 1000 lần với rng ngẫu nhiên, không được sai lần nào.
- Xáo giữ nguyên đủ 4 option, không mất/nhân bản.

`select.test.ts`:
- Câu sai gần nhất được ưu tiên trước câu chưa thấy.
- Không trả về nhiều hơn số câu yêu cầu.
- `topicFilter` lọc đúng.

Kiểm tay:
- Chơi 1 phiên offline hoàn chỉnh.
- Trả lời 3 câu rồi thoát → `QuizStat` của 3 câu đó đã được ghi.
- Kiểm tương phản màu đúng/sai đạt WCAG AA.

## Success Criteria

- [ ] `shuffleOptions` map lại `correct` chính xác — test 1000 vòng không sai.
- [ ] Quiz không ghi vào `CardState` (SM-2 hoàn toàn không bị ảnh hưởng).
- [ ] `QuizStat` ghi ngay sau mỗi câu, không đợi hết phiên.
- [ ] Đúng/sai phân biệt được bằng icon, không chỉ bằng màu.
- [ ] Option là `<button>` thật, dùng được bằng bàn phím.
- [ ] Câu sai gần nhất được ưu tiên chọn lại.
- [ ] Toàn bộ mode chạy offline.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Xáo option nhưng quên map `correct` → app chấm sai toàn bộ | Rất cao | Test 1000 vòng bắt buộc pass trước khi ghép UI |
| Quiz ghi đè SM-2 state | Cao | Tách hẳn `quiz` và `cards` trong `PersistedState`; không có code path nào từ quiz gọi `gradeCard` |
| Chỉ dùng màu để báo đúng/sai | Trung bình | Thêm icon ✓/✗ + text |
| Rời giữa phiên mất hết dữ liệu | Thấp | Ghi `QuizStat` từng câu; confirm dialog khi back |
