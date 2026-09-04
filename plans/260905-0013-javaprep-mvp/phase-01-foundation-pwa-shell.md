---
phase: 1
title: "Foundation & PWA Shell"
status: completed
priority: P1
dependencies: []
effort: "S"
---

# Phase 1: Foundation & PWA Shell

## Overview

Dựng khung SvelteKit static + Tailwind, service worker precache, web manifest, và lớp persistence `localStorage` có versioning. Kết thúc phase này app đã cài được như PWA và chạy offline (dù chưa có nội dung).

## Requirements

**Functional**
- App biên dịch ra static thuần, host được trên static hosting bất kỳ, không cần Node runtime.
- Cài được lên home screen (Android + iOS), có icon và splash.
- Lần load thứ 2 chạy offline hoàn toàn.
- Layout mobile-first: bottom tab bar 4 mục (Chủ đề / Ôn thẻ / Quiz / Tiến độ).

**Non-functional**
- Bundle JS ban đầu < 60KB gzipped (chưa tính content JSON).
- Không horizontal scroll ở 320px.
- Respect `prefers-reduced-motion` và `prefers-color-scheme`.

## Architecture

```
src/
  app.html                 # <meta viewport>, theme-color, manifest link
  app.css                  # Tailwind entry + design tokens
  service-worker.ts        # precache assets, cache-first
  lib/
    storage.ts             # load/save/migrate localStorage, key: javaprep:v1
    stores/
      progress.svelte.ts   # $state rune, autosave có debounce
  routes/
    +layout.svelte         # shell: <main> + <BottomNav>
    +layout.ts             # export const prerender = true; ssr = false
    +page.svelte           # Home / Chủ đề
static/
  manifest.webmanifest
  icons/icon-192.png, icon-512.png, icon-maskable-512.png
```

**Chiến lược cache của service worker**

SvelteKit expose `{ base, build, files, prerendered, version }` từ `$service-worker`.

- `install`: `cache.addAll([...build, ...files])`, cache name = `javaprep-${version}`.
- `activate`: xoá mọi cache khác tên → deploy mới tự dọn cache cũ.
- `fetch`: chỉ xử lý `GET` cùng origin, bỏ qua scheme khác `http(s)`.
  - Asset thuộc danh sách precache → **cache-first** (hash trong tên file đảm bảo tươi).
  - Còn lại → **network-first**, fallback sang cache khi offline.
- Cập nhật: khi có SW mới → hiện toast "Có bản mới — tải lại". Không auto-reload giữa phiên học.

**Lớp storage**

```ts
// src/lib/storage.ts
const KEY = 'javaprep:v1';
export type PersistedState = {
  schemaVersion: 1;
  cards: Record<string, CardState>;   // questionId -> SM-2 state
  quiz: Record<string, QuizStat>;     // questionId -> {seen, correct}
  settings: { dailyNewLimit: number; theme: 'system' | 'light' | 'dark' };
  studyLog: string[];                 // 'YYYY-MM-DD' các ngày có ôn, tăng dần, giữ tối đa 365
};
```

`studyLog` được đưa vào ngay từ v1 dù chỉ Phase 6 dùng — thêm sau sẽ phải bump `schemaVersion` và viết migration cho một field rỗng, không đáng.

- `load()` bọc trong try/catch — JSON hỏng hoặc `localStorage` bị chặn (Safari private mode) → trả về state mặc định + set cờ `storageAvailable = false` để UI cảnh báo.
- `migrate(raw)`: switch theo `schemaVersion`. v1 là bản đầu, hàm chỉ có nhánh default cho tương lai.
- Ghi qua debounce 300ms để tránh ghi mỗi lần lật thẻ.

## Related Code Files

- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`
- Create: `src/app.html`, `src/app.css`, `src/service-worker.ts`
- Create: `src/lib/storage.ts`, `src/lib/types.ts`, `src/lib/stores/progress.svelte.ts`
- Create: `src/routes/+layout.svelte`, `src/routes/+layout.ts`, `src/routes/+page.svelte`
- Create: `src/lib/components/BottomNav.svelte`, `src/lib/components/UpdateToast.svelte`
- Create: `static/manifest.webmanifest`, `static/icons/*`

## Implementation Steps

1. `npx sv create .` → template minimal, TypeScript.
2. Cài `@sveltejs/adapter-static`, `tailwindcss`, `@tailwindcss/vite`.
3. `svelte.config.js`: dùng `adapter()` mặc định — prerender toàn bộ, không cần SPA fallback vì mọi route đều tĩnh và biết trước.
4. `src/routes/+layout.ts`: `export const prerender = true; export const ssr = false;`
   `ssr = false` vì app đọc `localStorage` ngay khi mount; tắt SSR loại bỏ toàn bộ nhánh hydration mismatch.
5. Viết `src/lib/types.ts`: `Question`, `CardState`, `QuizStat`, `PersistedState`, `Topic`.
6. Viết `storage.ts` + `progress.svelte.ts` (Svelte 5 runes, `$state` + `$effect` autosave debounce).
7. Viết `service-worker.ts` theo chiến lược trên.
8. Tạo `manifest.webmanifest`: `display: standalone`, `orientation: portrait`, `theme_color`, `background_color`, 3 icon size.
9. Sinh icon (SVG → PNG 192/512/maskable-512).
10. Shell layout: `+layout.svelte` với `<main class="pb-16">` + `<BottomNav>` fixed bottom, safe-area inset (`env(safe-area-inset-bottom)`), `viewport-fit=cover` trong `app.html`.
11. `UpdateToast.svelte` lắng nghe `updated` từ `$app/state`.

## Tests / Validation

- Chạy production preview → DevTools → Application → Service Workers: registered, activated.
- DevTools → Network → Offline → reload → app vẫn render shell.
- Lighthouse (mobile): "Installable" pass.
- Responsive check ở 320px / 390px / 768px: không tràn ngang.
- Vitest unit test cho `storage.ts`: load state hỏng → trả default; save→load round-trip giữ nguyên dữ liệu.

## Success Criteria

- [ ] Lệnh biên dịch production sinh thư mục static, không có server bundle.
- [ ] Service worker precache toàn bộ asset, `activate` xoá cache cũ.
- [ ] Reload offline → shell render đầy đủ, bottom nav hoạt động.
- [ ] `manifest.webmanifest` hợp lệ, Lighthouse báo installable.
- [ ] `storage.ts` có test cho corrupt-JSON và localStorage-unavailable.
- [ ] Bundle JS ban đầu < 60KB gz.

## Risk Assessment

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| SW cache asset cũ, user kẹt bản lỗi | Cao | Cache name gắn `version`; `activate` xoá cache khác tên; toast "Có bản mới" |
| Safari private mode chặn `localStorage` | Trung bình | try/catch + cờ `storageAvailable`, UI cảnh báo "tiến độ sẽ không được lưu" |
| `ssr = false` làm mất SEO | Thấp | App cá nhân, SEO không phải mục tiêu |
| Bottom nav bị che bởi home indicator iOS | Trung bình | `padding-bottom: env(safe-area-inset-bottom)` + `viewport-fit=cover` |
