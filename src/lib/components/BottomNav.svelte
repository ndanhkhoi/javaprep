<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { progress } from '$lib/stores/progress.svelte';

	type Item = { href: string; label: string; icon: string; badge?: boolean };

	const items: Item[] = [
		{ href: '/', label: 'Chủ đề', icon: 'M3 5h7v7H3zM14 5h7v7h-7zM3 16h7v3H3zM14 16h7v3h-7z' },
		{ href: '/study', label: 'Ôn thẻ', icon: 'M4 5h11a2 2 0 0 1 2 2v12l-6-3-6 3V7a2 2 0 0 1 2-2z', badge: true },
		{ href: '/quiz', label: 'Quiz', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 13.5h.01M12 8a2 2 0 0 1 1.4 3.4c-.6.6-1.4 1-1.4 2' },
		{ href: '/progress', label: 'Tiến độ', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' }
	];

	const dueCount = $derived(progress.dueCount);

	function isActive(href: string): boolean {
		const path = page.url.pathname.replace(base, '') || '/';
		return href === '/' ? path === '/' : path.startsWith(href);
	}
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur
	       pb-[env(safe-area-inset-bottom)]"
	aria-label="Điều hướng chính"
>
	<ul class="mx-auto flex max-w-lg">
		{#each items as item (item.href)}
			{@const active = isActive(item.href)}
			<li class="flex-1">
				<a
					href="{base}{item.href}"
					class="relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 py-2
					       text-[11px] font-medium transition-colors
					       {active ? 'text-brand' : 'text-ink-muted hover:text-ink'}"
					aria-current={active ? 'page' : undefined}
				>
					<svg
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d={item.icon} />
					</svg>
					<span>{item.label}</span>
					{#if item.badge && dueCount > 0}
						<span
							class="absolute right-[calc(50%-1.65rem)] top-1 min-w-[1.15rem] rounded-full bg-bad
							       px-1 text-center text-[10px] font-bold leading-[1.15rem] text-white"
						>
							{dueCount > 99 ? '99+' : dueCount}
						</span>
						<span class="sr-only">{dueCount} thẻ đến hạn</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>
