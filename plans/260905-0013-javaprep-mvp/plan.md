---
title: "JavaPrep — Mobile-first offline PWA ôn 100 câu phỏng vấn Java/Spring Boot"
description: "PWA cá nhân, offline-first, ôn 100 câu phỏng vấn Java/Spring Boot theo 3 chế độ (list, flashcard, quiz) với SM-2 spaced repetition, tiến độ lưu local."
status: completed
priority: P2
branch: "main"
tags: [pwa, sveltekit, offline-first, spaced-repetition, java, spring-boot]
blockedBy: []
blocks: []
created: "2026-09-04T17:13:24.336Z"
createdBy: "ck:plan"
source: skill
---

# JavaPrep — Mobile-first offline PWA ôn 100 câu phỏng vấn Java/Spring Boot

## Overview

Web app tĩnh, cài được như PWA, giúp ôn 100 câu hỏi phỏng vấn Java/Spring Boot theo chủ đề.
Ba chế độ học: **danh sách** (tra cứu), **flashcard** (lật thẻ + chấm điểm SM-2), **quiz** (trắc nghiệm 4 đáp án).
Không backend — toàn bộ nội dung là JSON tĩnh được precache, tiến độ lưu trong `localStorage`.

## Quyết định đã chốt

| Quyết định | Lựa chọn | Lý do |
|---|---|---|
| Framework | SvelteKit + `@sveltejs/adapter-static` | Bundle nhỏ, prerender toàn bộ ra static, không runtime server |
| Styling | Tailwind CSS v4 | Mobile-first utilities, không cần viết CSS riêng |
| Offline | `src/service-worker.ts` built-in (`$service-worker`) | Không thêm dependency; SvelteKit đã expose `build`/`files`/`version` |
| Nhắc ôn tập | In-app due badge (**không** OS notification) | Web Push cần backend + VAPID; iOS Safari không đáng tin cậy |
| SRS | SM-2 (Anki-like) | User chọn; đủ chính xác, spec rõ ràng |
| Lưu trữ | `localStorage`, key có version | ~10–20KB state cho 100 thẻ; đồng bộ, KISS. IndexedDB là over-engineering ở quy mô này |
| Ngôn ngữ nội dung | Tiếng Việt, thuật ngữ giữ tiếng Anh | Sát thực tế phỏng vấn VN |
| Deploy | GitHub Pages (đổi từ Cloudflare Pages) | Người dùng yêu cầu repo public + Pages; đánh đổi là cần `BASE_PATH=/javaprep` lúc build trong CI |

## Giới hạn đã biết (không phải bug)

- **Không có push notification khi app đóng.** "Nhắc nhở" = due-count hiển thị khi mở app + `navigator.setAppBadge()` (best-effort, chỉ chạy trên installed PWA ở một số nền tảng). Nếu sau này cần nhắc thật, xem "Mở rộng" trong `docs/extending.md` (Phase 7).
- **Tiến độ chỉ nằm trên 1 thiết bị.** Không sync. Bù bằng export/import JSON thủ công (Phase 6).
- **Xoá dữ liệu trình duyệt = mất tiến độ.** Cảnh báo trong UI Settings và docs.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundation & PWA Shell](./phase-01-foundation-pwa-shell.md) | Done |
| 2 | [Content Schema & 100 Questions](./phase-02-content-schema-100-questions.md) | Done |
| 3 | [Browse & Question Detail](./phase-03-browse-question-detail.md) | Done |
| 4 | [SM-2 Engine & Flashcard](./phase-04-sm-2-engine-flashcard.md) | Done |
| 5 | [Quiz Mode](./phase-05-quiz-mode.md) | Done |
| 6 | [Progress Dashboard & Due Badge](./phase-06-progress-dashboard-due-badge.md) | Done |
| 7 | [Deploy & Docs](./phase-07-deploy-docs.md) | Done |

### Thứ tự phụ thuộc

```
1 (Foundation)
├── 2 (Content) ──┬── 3 (Browse)
│                 ├── 4 (Flashcard + SM-2) ──┐
│                 └── 5 (Quiz) ──────────────┴── 6 (Dashboard)
└──────────────────────────────────────────────── 7 (Deploy)
```

Phase 2 chạy song song được với Phase 1 (soạn nội dung không phụ thuộc code).
Phase 3 và 5 độc lập với nhau. Phase 6 cần 4 (SM-2 state) và 5 (quiz stats).

## Acceptance criteria toàn dự án

- [x] `npm run build` ra thư mục static thuần (119 trang), deploy lên GitHub Pages.
- [x] Hoạt động đầy đủ khi tắt hẳn server — kiểm cả 3 mode ở local lẫn bản deploy.
- [x] Đủ 100 câu hỏi, mỗi câu có `answerShort`, `answerLong`, và 1 câu quiz 4 đáp án hợp lệ.
- [x] Lighthouse mobile: Performance 98, Accessibility 100 (desktop 99/100).
- [x] Tiến độ SM-2 sống sót qua reload; schema có version và hàm migrate.
- [x] Mọi thao tác chính đạt được trong ≤ 2 chạm từ màn hình chính.
- [x] Không có horizontal scroll ở viewport 320px (đo `scrollWidth` trên 7 trang).

## Kết quả

- Repo: https://github.com/ndanhkhoi/javaprep
- Demo: https://ndanhkhoi.github.io/javaprep/
- 119 unit test pass; validator nội dung và `svelte-check` sạch; CI chạy cả bốn bước trước khi deploy.
- Initial JS 73KB gzip sau khi tách `answerLong`/`code` thành chunk tải lười (trước đó 141KB).

## Dependencies

Không có plan nào khác trong scope này. Đây là plan đầu tiên của project.
