/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `javaprep-${version}`;

/**
 * File đánh dấu bắt đầu bằng dấu chấm (`.nojekyll`) nằm trong `files` nhưng không phải
 * tài nguyên phục vụ được — nhiều static server trả 404 cho chúng. Để lọt vào `addAll`
 * thì **cả** lệnh cache thất bại, install fail và app mất hoàn toàn khả năng offline.
 */
const PRECACHE = [...build, ...files, ...prerendered].filter(
	(path) => !path.split('/').pop()?.startsWith('.')
);

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

sw.addEventListener('activate', (event) => {
	// Mỗi bản deploy có `version` mới -> cache cũ bị dọn sạch, không tích luỹ vô hạn.
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('message', (event) => {
	// UI gửi tín hiệu này khi user bấm "Tải lại" trên thông báo có bản mới.
	if (event.data === 'SKIP_WAITING') sw.skipWaiting();
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== location.origin) return;
	if (!url.protocol.startsWith('http')) return;

	event.respondWith(respond(request, url));
});

async function respond(request: Request, url: URL): Promise<Response> {
	const cache = await caches.open(CACHE);

	// Asset precache có hash trong tên file -> cache-first là an toàn tuyệt đối.
	if (PRECACHE.includes(url.pathname)) {
		const cached = await cache.match(url.pathname);
		if (cached) return cached;
	}

	try {
		const response = await fetch(request);
		if (response.ok && response.type === 'basic') {
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await cache.match(request);
		if (cached) return cached;
		// Offline và chưa từng cache: trả lỗi rõ ràng thay vì để trình duyệt hiện trang lỗi mặc định.
		return new Response('Ngoại tuyến và tài nguyên này chưa được lưu.', {
			status: 503,
			headers: { 'content-type': 'text/plain; charset=utf-8' }
		});
	}
}
