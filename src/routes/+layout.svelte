<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import UpdateToast from '$lib/components/UpdateToast.svelte';
	import { applyTheme, progress } from '$lib/stores/progress.svelte';

	let { children } = $props();

	let waitingWorker = $state<ServiceWorker | null>(null);

	onMount(() => {
		applyTheme(progress.settings.theme);
		registerServiceWorker();

		const onVisibility = () => {
			if (document.visibilityState === 'hidden') progress.flush();
			else progress.refreshToday();
		};
		document.addEventListener('visibilitychange', onVisibility);

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const onScheme = () => applyTheme(progress.settings.theme);
		media.addEventListener('change', onScheme);

		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			media.removeEventListener('change', onScheme);
			progress.flush();
		};
	});

	// Badge trên icon app — tính năng bổ sung, thất bại thì im lặng bỏ qua.
	$effect(() => {
		const count = progress.dueCount;
		if (!('setAppBadge' in navigator)) return;
		try {
			if (count > 0) void navigator.setAppBadge(count);
			else void navigator.clearAppBadge?.();
		} catch {
			/* nền tảng không hỗ trợ — không phải chức năng cốt lõi */
		}
	});

	async function registerServiceWorker(): Promise<void> {
		if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
		try {
			const registration = await navigator.serviceWorker.register(`${base}/service-worker.js`, {
				type: 'module'
			});
			if (registration.waiting) waitingWorker = registration.waiting;

			registration.addEventListener('updatefound', () => {
				const installing = registration.installing;
				if (!installing) return;
				installing.addEventListener('statechange', () => {
					// Chỉ báo có bản mới khi đã có SW đang điều khiển trang — lần cài đầu thì không.
					if (installing.state === 'installed' && navigator.serviceWorker.controller) {
						waitingWorker = installing;
					}
				});
			});
		} catch {
			/* SW không cài được thì app vẫn chạy, chỉ mất khả năng offline */
		}
	}

	function reload(): void {
		waitingWorker?.postMessage('SKIP_WAITING');
		window.location.reload();
	}
</script>

<div class="flex min-h-full flex-col bg-surface text-ink">
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50
		       focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-ink"
	>
		Bỏ qua điều hướng
	</a>

	{#if !progress.storageAvailable}
		<p class="bg-warn/15 px-4 py-2 text-center text-xs text-warn" role="status">
			Trình duyệt đang chặn lưu trữ cục bộ — tiến độ sẽ không được giữ lại.
		</p>
	{/if}

	<main id="main" class="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">
		{@render children()}
	</main>

	<BottomNav />

	{#if waitingWorker}
		<UpdateToast onReload={reload} />
	{/if}
</div>
