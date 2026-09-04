---
phase: 3
title: "Browse & Question Detail"
status: pending
priority: P2
dependencies: [1, 2]
effort: "M"
---

# Phase 3: Browse & Question Detail

## Overview

Chế độ **danh sách**: duyệt câu hỏi theo chủ đề, tìm kiếm, mở chi tiết đọc đáp án đầy đủ. Đây là mode tra cứu — không đụng vào SM-2 state.

## Requirements

**Functional**
- Home hiển thị 11 chủ đề dạng card: tên, số câu, số đã thuộc (từ SM-2 state nếu có).
- Trang chủ đề: list câu hỏi, mỗi item hiện câu hỏi + badge độ khó + chấm trạng thái học.
- Trang chi tiết: câu hỏi, đáp án ngắn, đáp án dài (render markdown), code block có syntax highlight.
- Tìm kiếm toàn văn client-side trên `question` + `tags`, không cần mạng.
- Lọc theo độ khó và theo trạng thái (chưa học / đang học / đã thuộc).
- Điều hướng câu trước/sau trong cùng chủ đề.

**Non-functional**
- Tìm kiếm phản hồi < 50ms với 100 câu (không cần index library — filter tuyến tính là đủ).
- Danh sách cuộn mượt, không cần virtual list ở quy mô 100 item.

## Architecture

```
src/routes/
  +page.svelte                          # Home: grid 11 topic card
  topic/[topicId]/+page.svelte          # List câu hỏi trong topic
  topic/[topicId]/+page.ts              # entries() cho prerender
  q/[questionId]/+page.svelte           # Chi tiết
  q/[questionId]/+page.ts               # entries() cho prerender
  search/+page.svelte                   # Tìm kiếm
```

**Prerender các route động**: `adapter-static` cần biết trước danh sách route. Mỗi `+page.ts` export `entries()` đọc từ `src/lib/data` để sinh 11 + 100 trang tĩnh.

```ts
// src/routes/q/[questionId]/+page.ts
import { questions } from '$lib/data';
export const prerender = true;
export function entries() {
  return questions.map((q) => ({ questionId: q.id }));
}
```

**Markdown rendering**: dùng `marked` (~10KB gz) + `DOMPurify`. Nội dung là của chính mình nên rủi ro XSS thấp, nhưng sanitize vẫn rẻ và loại bỏ hẳn lớp rủi ro nếu sau này có import nội dung ngoài.

**Syntax highlight**: `shiki` build-time là tốt nhất về runtime cost nhưng phức tạp hoá pipeline. MVP dùng `highlight.js` với **chỉ ngôn ngữ Java + XML + Properties** (`highlight.js/lib/core` + 3 language import) → ~15KB gz thay vì 300KB bản full. Lazy import trong trang chi tiết để không nằm trong initial bundle.

**Search**: filter tuyến tính, normalize bỏ dấu tiếng Việt (`String.normalize('NFD').replace(/[̀-ͯ]/g, '')`) để gõ "ke thua" vẫn ra "kế thừa". Debounce 150ms.

## Related Code Files

- Create: `src/routes/+page.svelte`, `src/routes/topic/[topicId]/+page.{svelte,ts}`
- Create: `src/routes/q/[questionId]/+page.{svelte,ts}`, `src/routes/search/+page.svelte`
- Create: `src/lib/components/TopicCard.svelte`, `QuestionListItem.svelte`, `DifficultyBadge.svelte`, `MarkdownBody.svelte`, `CodeBlock.svelte`
- Create: `src/lib/search.ts` — normalize + filter
- Modify: `src/lib/stores/progress.svelte.ts` — thêm derived `masteryByTopic`

## Implementation Steps

1. `src/lib/search.ts`: `normalize(s)` bỏ dấu + lowercase; `searchQuestions(query, filters)` trả về mảng đã lọc, sắp theo số lần khớp.
2. `TopicCard.svelte`: tên, icon, `n/total đã thuộc`, thanh progress mảnh.
3. Home `+page.svelte`: grid 2 cột ở mobile, 3 cột ≥ 640px. Ô search dính trên đầu (`sticky top-0`).
4. Trang topic: header có tên topic + filter chips (độ khó, trạng thái). List `QuestionListItem`.
5. `MarkdownBody.svelte`: `marked.parse` → `DOMPurify.sanitize` → `{@html}`. Style bằng Tailwind typography-ish class thủ công (tránh thêm plugin).
6. `CodeBlock.svelte`: lazy `import('highlight.js/lib/core')`, đăng ký java/xml/properties, nút "Copy". Có `overflow-x: auto` — code block là chỗ duy nhất được phép cuộn ngang.
7. Trang chi tiết: đáp án ngắn hiện luôn; đáp án dài trong `<details>` mở sẵn. Nav trước/sau ở cuối trang.
8. Thêm `entries()` cho cả 2 route động, kiểm tra output có đủ 111 trang HTML.

## Tests / Validation

- Sau khi biên dịch: đếm số file HTML sinh ra = 1 (home) + 11 (topic) + 100 (question) + search + các route phase sau.
- Test `search.ts` bằng Vitest: "ke thua" khớp câu chứa "kế thừa"; query rỗng trả toàn bộ; filter độ khó đúng.
- Kiểm tay ở 320px: code block cuộn ngang được, phần còn lại không tràn.
- Offline: mở 1 câu chi tiết bất kỳ khi đã precache → render đầy đủ kể cả highlight.

## Success Criteria

- [ ] Đủ 111 trang tĩnh được prerender, không lỗi `entries()`.
- [ ] Search bỏ dấu hoạt động, phản hồi < 50ms.
- [ ] Markdown + code block render đúng, có nút copy.
- [ ] Filter độ khó và trạng thái hoạt động đồng thời.
- [ ] `highlight.js` không nằm trong initial bundle (kiểm bằng bundle output).
- [ ] Toàn bộ mode này chạy offline.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| `highlight.js` full bundle kéo initial JS lên 300KB | Cao | Dùng `lib/core` + 3 language, lazy import trong component |
| Prerender fail vì `entries()` không khớp id thật | Trung bình | Validator phase 2 đảm bảo id hợp lệ; kiểm số file HTML sau khi biên dịch |
| `{@html}` mở đường XSS nếu sau này import nội dung ngoài | Thấp hiện tại | DOMPurify ngay từ đầu, không đợi đến lúc cần |
| 100 item list giật trên máy yếu | Thấp | 100 item là nhỏ; nếu đo thấy giật mới thêm virtual list |
