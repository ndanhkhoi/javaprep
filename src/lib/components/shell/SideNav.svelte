<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '../ui/Icon.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { NAV_ITEMS, isActive } from './nav-items';

	const dueCount = $derived(progress.dueCount);
</script>

<!-- Chỉ tồn tại từ md trở lên. Ở mobile điều hướng nằm ở dock đáy. -->
<aside
	class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface-2/60
	       px-3 py-4 lg:flex"
	aria-label="Điều hướng chính"
>
	<a
		href="{base}/"
		class="mb-6 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors
		       hover:bg-surface-3"
	>
		<span
			class="aurora-mesh grid size-9 place-items-center rounded-lg border border-brand-line
			       text-brand shadow-1"
		>
			<Icon name="bolt" size={18} strokeWidth={2.1} />
		</span>
		<span class="leading-tight">
			<strong class="block text-sm font-extrabold tracking-tight">JavaPrep</strong>
			<span class="block text-2xs text-ink-muted">Java &amp; Spring Boot</span>
		</span>
	</a>

	<ul class="flex flex-col gap-1">
		{#each NAV_ITEMS as item (item.href)}
			{@const active = isActive(item.href, page.url.pathname, base)}
			<li>
				<a
					href="{base}{item.href}"
					class="group flex min-h-11 items-center gap-3 rounded-lg px-2.5 text-sm font-semibold
					       transition-colors duration-[var(--dur-fast)]
					       {active
						? 'bg-brand-soft text-brand'
						: 'text-ink-muted hover:bg-surface-3 hover:text-ink'}"
					aria-current={active ? 'page' : undefined}
				>
					<Icon name={item.icon} size={19} strokeWidth={active ? 2.1 : 1.75} />
					<span class="flex-1">{item.label}</span>
					{#if item.badge && dueCount > 0}
						<span
							class="min-w-5 rounded-full bg-bad px-1.5 text-center text-2xs font-bold
							       leading-5 text-bad-ink"
						>
							{dueCount > 99 ? '99+' : dueCount}
							<span class="sr-only">thẻ đến hạn</span>
						</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>

	<div class="mt-auto flex flex-col gap-1 border-t border-border pt-3">
		<a
			href="{base}/search"
			class="flex min-h-11 items-center gap-3 rounded-lg px-2.5 text-sm font-medium
			       transition-colors hover:bg-surface-3 hover:text-ink
			       {isActive('/search', page.url.pathname, base)
				? 'bg-brand-soft text-brand'
				: 'text-ink-muted'}"
			aria-current={isActive('/search', page.url.pathname, base) ? 'page' : undefined}
		>
			<Icon name="search" size={18} />
			Tìm kiếm
		</a>
		<a
			href="{base}/settings"
			class="flex min-h-11 items-center gap-3 rounded-lg px-2.5 text-sm font-medium
			       transition-colors hover:bg-surface-3 hover:text-ink
			       {isActive('/settings', page.url.pathname, base)
				? 'bg-brand-soft text-brand'
				: 'text-ink-muted'}"
			aria-current={isActive('/settings', page.url.pathname, base) ? 'page' : undefined}
		>
			<Icon name="settings" size={18} />
			Cài đặt
		</a>
	</div>
</aside>
