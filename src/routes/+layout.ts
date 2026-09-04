// Toàn bộ route đều tĩnh và biết trước -> prerender ra HTML.
export const prerender = true;
// App đọc localStorage ngay khi mount; tắt SSR loại bỏ hẳn lớp bug hydration mismatch.
export const ssr = false;
