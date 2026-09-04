<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import BottomDock from '$lib/components/shell/BottomDock.svelte';
	import SideNav from '$lib/components/shell/SideNav.svelte';
	import TopBar from '$lib/components/shell/TopBar.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
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

	/**
	 * Chuyển trang mượt bằng View Transitions API. Tăng cường thuần: trình duyệt nào
	 * chưa hỗ trợ thì điều hướng vẫn diễn ra bình thường, chỉ không có hiệu ứng. Phần
	 * animation nằm ở `app.css` và bị tắt hẳn khi user chọn giảm chuyển động.
	 */
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
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

<div class="min-h-full bg-surface text-ink">
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50
		       focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm
		       focus:font-semibold focus:text-brand-ink"
	>
		Bỏ qua điều hướng
	</a>

	<SideNav />

	<div class="flex min-h-full flex-col lg:pl-60">
		<TopBar />

		{#if !progress.storageAvailable}
			<p
				class="flex items-center justify-center gap-2 bg-warn-soft px-4 py-2 text-center text-xs
				       font-medium text-warn"
				role="status"
			>
				<Icon name="alert" size={14} />
				Trình duyệt đang chặn lưu trữ cục bộ — tiến độ sẽ không được giữ lại.
			</p>
		{/if}

		<main
			id="main"
			class="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-5 md:px-8 md:pt-7 lg:pb-14"
		>
			{@render children()}
		</main>
	</div>

	<BottomDock />

	{#if waitingWorker}
		<UpdateToast onReload={reload} onDismiss={() => (waitingWorker = null)} />
	{/if}
</div>
