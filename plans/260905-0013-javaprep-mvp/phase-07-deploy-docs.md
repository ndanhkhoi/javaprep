---
phase: 7
title: "Deploy & Docs"
status: pending
priority: P3
dependencies: [3, 4, 5, 6]
effort: "S"
---

# Phase 7: Deploy & Docs

## Overview

Đưa app lên Cloudflare Pages, dựng CI kiểm tra tối thiểu, đo Lighthouse trên thiết bị thật, và viết tài liệu hướng dẫn dùng + mở rộng.

## Requirements

**Functional**
- Deploy được bằng 1 lệnh, có URL HTTPS công khai.
- CI chạy typecheck + test + validate content trên mỗi push.
- Tài liệu: `README.md` (dùng + phát triển) và `docs/extending.md` (thêm câu hỏi, chỉnh SRS, bật notification thật).

**Non-functional**
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, PWA installable.
- Đo trên thiết bị thật (điện thoại của user), không chỉ trên emulator DevTools.

## Architecture

**Deploy — Cloudflare Pages**

- Kết nối repo hoặc dùng `wrangler pages deploy`.
- Output directory: thư mục static do adapter sinh ra.
- Không cần `paths.base` vì deploy ở root domain (khác với GitHub Pages dưới subpath — nếu đổi sang GH Pages thì phải set `kit.paths.base` và cập nhật service worker `base`).
- Headers: `_headers` file đặt `Cache-Control: public, max-age=31536000, immutable` cho asset có hash, `no-cache` cho `index.html` và `manifest.webmanifest` — nếu không, HTML cũ bị cache sẽ trỏ tới asset đã bị xoá.

**CI** (`.github/workflows/ci.yml`)

```
on: [push, pull_request]
jobs: check
  - npm ci
  - npm run check          # svelte-check + tsc
  - npm run test           # vitest run
  - npm run validate:content
```
Không thêm e2e ở MVP — chi phí bảo trì cao hơn giá trị ở quy mô này. Ghi rõ lựa chọn này trong `docs/extending.md`.

**Tài liệu**

`README.md`:
- App làm gì, screenshot mobile.
- Cách cài lên home screen (Android: menu → Add to Home screen; iOS: Share → Add to Home Screen — **bắt buộc dùng Safari**, Chrome iOS không cài PWA được).
- Chạy local: install / dev / test / validate.
- Cảnh báo: tiến độ lưu trên trình duyệt, xoá dữ liệu site = mất; nhớ export định kỳ.

`docs/extending.md`:
- Thêm/sửa câu hỏi: chỉnh `questions.json`, chạy validator, chỉnh bảng phân bổ trong validator nếu đổi số lượng.
- Chỉnh tham số SRS: `dailyNewLimit`, ngưỡng mature 21 ngày, trần interval 365 ngày — nằm ở đâu.
- **Bật nhắc nhở thật (Web Push)**: cần Cloudflare Worker + KV lưu subscription, cặp khoá VAPID, cron trigger quét thẻ đến hạn. Nêu rõ đây là đánh đổi: mất tính chất "không backend" và trên iOS chỉ chạy khi PWA đã được Add to Home Screen (iOS 16.4+).
- Đổi hosting sang GitHub Pages: cần `kit.paths.base`.
- Vì sao không có e2e test.

## Related Code Files

- Create: `README.md`, `docs/extending.md`
- Create: `.github/workflows/ci.yml`
- Create: `static/_headers`
- Modify: `package.json` — scripts `check`, `test`, `validate:content`, `deploy`

## Implementation Steps

1. `static/_headers` với quy tắc cache ở trên.
2. `.github/workflows/ci.yml`.
3. Deploy thử lên Cloudflare Pages, lấy URL.
4. Mở URL trên điện thoại thật → Add to Home Screen → bật airplane mode → chạy thử cả 3 mode.
5. Chạy Lighthouse mobile trên URL production, ghi lại điểm số vào README.
6. Viết `README.md` + `docs/extending.md`.
7. Chụp 3-4 screenshot mobile cho README.

## Tests / Validation

- CI xanh trên push.
- Deploy 2 lần liên tiếp: lần 2 phải hiện toast "Có bản mới", bấm tải lại → nội dung mới xuất hiện, cache cũ đã bị xoá (kiểm trong DevTools → Application → Cache Storage chỉ còn 1 cache).
- Airplane-mode test trên điện thoại thật, cả 3 mode.
- Lighthouse mobile đạt ngưỡng.
- Xoá `localStorage` trên production → app vẫn khởi động sạch, không crash.

## Success Criteria

- [ ] URL production HTTPS hoạt động, cài được lên home screen iOS + Android.
- [ ] Airplane mode trên thiết bị thật: cả list, flashcard, quiz đều chạy.
- [ ] Lighthouse mobile ≥ 90 ở Performance, Accessibility, Best Practices; PWA installable.
- [ ] Deploy mới hiện toast cập nhật và dọn cache cũ (chỉ còn 1 cache entry).
- [ ] CI chạy typecheck + test + validate content, fail đúng khi content sai.
- [ ] `README.md` có hướng dẫn cài PWA cho cả iOS và Android + cảnh báo mất dữ liệu.
- [ ] `docs/extending.md` mô tả đủ đường nâng cấp lên Web Push thật.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| HTML cũ bị cache → trỏ tới asset đã xoá → app trắng màn hình | Cao | `_headers`: `no-cache` cho HTML/manifest, `immutable` cho asset có hash |
| Service worker giữ bản cũ vĩnh viễn | Cao | Cache name gắn `version` + `activate` xoá cache khác tên (Phase 1); verify bằng deploy 2 lần |
| Lighthouse Performance < 90 vì content JSON nặng | Trung bình | Đã kẹp gzip < 120KB ở Phase 2; nếu vẫn thấp thì tách `answerLong` lazy-load theo topic |
| iOS không cài được PWA vì user dùng Chrome | Thấp | README ghi rõ phải dùng Safari trên iOS |
