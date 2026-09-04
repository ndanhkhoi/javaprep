---
phase: 2
title: "Content Schema & 100 Questions"
status: completed
priority: P1
dependencies: []
effort: "L"
---

# Phase 2: Content Schema & 100 Questions

## Overview

Định nghĩa schema câu hỏi, viết validator, và biên soạn đủ 100 câu phỏng vấn Java/Spring Boot bằng tiếng Việt (thuật ngữ giữ tiếng Anh). Đây là phase tốn công nhất và quyết định giá trị thực của app.

## Requirements

**Functional**
- Đúng 100 câu, mỗi câu có: câu hỏi, đáp án ngắn (mặt sau flashcard), đáp án dài (markdown), 1 câu quiz 4 lựa chọn + giải thích.
- Phân bổ theo 11 chủ đề, độ khó easy/medium/hard.
- Script validate chạy trong CI và fail nếu dữ liệu sai.

**Non-functional**
- Tổng JSON sau gzip < 120KB (để precache không nặng).
- `answerShort` ≤ 200 ký tự — đọc hết trong 1 màn hình điện thoại.

## Architecture

**Phân bổ 100 câu**

| Topic id | Tên hiển thị | Số câu |
|---|---|---|
| `java-core` | Java Core & OOP | 14 |
| `collections` | Collections Framework | 11 |
| `concurrency` | Concurrency & Multithreading | 11 |
| `jvm-memory` | JVM, Memory & GC | 8 |
| `exceptions` | Exception Handling | 5 |
| `java8-plus` | Java 8+ (Stream, Lambda, Optional) | 10 |
| `spring-core` | Spring Core (IoC, DI, Bean lifecycle) | 11 |
| `spring-boot` | Spring Boot (auto-config, starters, profiles) | 10 |
| `spring-web` | Spring MVC & REST | 8 |
| `spring-data` | Spring Data JPA & Hibernate | 8 |
| `spring-security` | Spring Security | 4 |
| | **Tổng** | **100** |

**Schema** (`src/lib/data/questions.json`)

```jsonc
{
  "schemaVersion": 1,
  "topics": [
    { "id": "java-core", "name": "Java Core & OOP", "icon": "☕", "order": 1 }
  ],
  "questions": [
    {
      "id": "java-core-001",
      "topic": "java-core",
      "difficulty": "medium",
      "question": "Phân biệt `==` và `equals()` khi so sánh object trong Java?",
      "answerShort": "`==` so sánh reference (địa chỉ trên heap); `equals()` so sánh nội dung theo cách class tự định nghĩa. Object.equals() mặc định vẫn là `==`.",
      "answerLong": "Markdown đầy đủ: giải thích, khi nào dùng, bẫy thường gặp, liên hệ hashCode()...",
      "code": "String a = new String(\"x\");\nString b = new String(\"x\");\na == b;      // false\na.equals(b); // true",
      "tags": ["equals", "hashcode", "reference"],
      "quiz": {
        "options": [
          "`==` luôn so sánh nội dung",
          "`equals()` mặc định trong Object so sánh reference",
          "`equals()` luôn được JVM tự override",
          "`==` không dùng được với primitive"
        ],
        "correct": 1,
        "explanation": "Object.equals() mặc định trả về `this == obj`; muốn so sánh nội dung phải tự override."
      }
    }
  ]
}
```

**Quy tắc `correct` index**: là chỉ số 0-based vào `options`. **Không** luôn đặt ở vị trí cố định — validator kiểm tra phân phối chỉ số `correct` không lệch quá 40% về một vị trí, tránh việc user đoán mò theo pattern.

**Quy tắc biên soạn**
- Câu hỏi viết như người phỏng vấn thật hỏi, không phải như đề thi.
- `answerShort` là thứ cần nhớ khi bị hỏi bất chợt; `answerLong` là phần hiểu sâu.
- Distractor trong quiz phải là hiểu lầm phổ biến thật, không phải đáp án ngớ ngẩn.
- Thuật ngữ kỹ thuật giữ nguyên tiếng Anh (`bean`, `heap`, `race condition`, `@Transactional`), phần diễn giải bằng tiếng Việt.
- Mọi khẳng định về hành vi Spring/Java phải ứng với **Java 21 LTS** và **Spring Boot 3.x**. Ghi rõ nếu hành vi khác ở phiên bản cũ.

## Related Code Files

- Create: `src/lib/data/questions.json`
- Create: `src/lib/data/index.ts` — import JSON, `export const topics`, `questionsByTopic`, `questionById`
- Create: `scripts/validate-content.ts` — validator chạy bằng `tsx`
- Create: `src/lib/data/questions.schema.ts` — Zod schema dùng chung cho validator

## Implementation Steps

1. Viết `questions.schema.ts` (Zod): ràng buộc id unique, `topic` phải tồn tại trong `topics`, `options.length === 4`, `correct ∈ [0,3]`, `answerShort.length <= 200`, `difficulty ∈ {easy,medium,hard}`.
2. Viết `scripts/validate-content.ts`:
   - Parse JSON qua Zod.
   - Kiểm số câu mỗi topic khớp bảng phân bổ.
   - Kiểm tổng = 100, id unique.
   - Kiểm phân phối `correct` (không quá 40% ở một index).
   - Cảnh báo câu hỏi trùng lặp gần đúng (normalize + so sánh Jaccard trên token, ngưỡng 0.8).
   - Exit code ≠ 0 khi có lỗi.
3. Thêm script `npm run validate:content`.
4. Biên soạn nội dung theo **từng topic một** (11 lượt), chạy validator sau mỗi topic để lỗi lộ sớm thay vì dồn cuối.
5. Rà soát cuối: đọc lại toàn bộ `answerShort` liên tục để bắt trùng ý và giọng văn không nhất quán.

## Tests / Validation

- `npm run validate:content` pass, 0 warning.
- Kiểm thủ công 10 câu ngẫu nhiên: đáp án đúng về mặt kỹ thuật với Java 21 / Spring Boot 3.x.
- Đo kích thước: `gzip -c src/lib/data/questions.json | wc -c` < 120000.

## Success Criteria

- [ ] `questions.json` có đúng 100 câu, phân bổ khớp bảng topic.
- [ ] Zod schema pass, id unique, mọi `quiz` có đúng 4 options và `correct` hợp lệ.
- [ ] Phân phối `correct` index không lệch quá 40% về một vị trí.
- [ ] Không có cặp câu hỏi trùng lặp (Jaccard ≥ 0.8).
- [ ] JSON gzip < 120KB.
- [ ] `npm run validate:content` chạy được và fail đúng khi cố tình làm hỏng 1 record.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Nội dung sai kỹ thuật (nguy hiểm nhất — học sai còn tệ hơn không học) | Rất cao | Chốt phiên bản Java 21 / Spring Boot 3.x; rà soát thủ công mẫu 10 câu; `answerLong` nêu nguồn/lý do thay vì khẳng định trống |
| 100 câu làm JSON quá nặng cho precache | Trung bình | Đo gzip ở mỗi mốc 25 câu; nếu vượt ngưỡng thì tách `answerLong` ra file riêng theo topic, lazy-load |
| Quiz distractor quá dễ → quiz vô nghĩa | Trung bình | Quy tắc "distractor phải là hiểu lầm phổ biến thật"; tự kiểm bằng cách đọc 4 option mà không nhìn `correct` |
| Câu hỏi trùng ý giữa các topic (vd `HashMap` xuất hiện ở cả collections và concurrency) | Thấp | Validator dò trùng gần đúng; nếu chủ ý thì đặt góc nhìn khác nhau rõ rệt |
