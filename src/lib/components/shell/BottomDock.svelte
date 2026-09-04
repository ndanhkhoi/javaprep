<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '../ui/Icon.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { NAV_ITEMS, isActive } from './nav-items';

	const dueCount = $derived(progress.dueCount);
	const activeIndex = $derived(
		NAV_ITEMS.findIndex((item) => isActive(item.href, page.url.pathname, base))
	);
</script>

<!-- Dock nổi thay vì thanh dán đáy: nội dung nhìn thấy được ở cả hai bên nên thanh
     đọc ra như một lớp riêng phía trên trang, không phải phần bị cắt của trang. -->
<!-- Safe area xử lý bằng padding của `nav`, không phải margin của `ul`: đặt
     `margin-inline` lên `ul` sẽ ghi đè `mx-auto`, và ở khoảng 768–1023px (dock rộng
     448px trên màn 834px) dock bị dán sang lề trái thay vì nằm giữa. -->
<nav
	class="fixed inset-x-0 bottom-0 z-40 lg:hidden"
	style="padding-bottom: max(0.6rem, env(safe-area-inset-bottom));
	       padding-left: max(0.75rem, env(safe-area-inset-left));
	       padding-right: max(0.75rem, env(safe-area-inset-right))"
	aria-label="Điều hướng chính"
>
	<ul
		class="surface-glass relative mx-auto flex max-w-md items-stretch gap-1 rounded-2xl border
		       p-1.5 shadow-3"
	>
		{#if activeIndex >= 0}
			<!-- Con trỏ trượt giữa các mục: một phần tử di chuyển, không phải 4 phần tử đổi nền. -->
			<li
				class="pointer-events-none absolute inset-y-1.5 left-1.5 rounded-xl bg-brand-soft
				       transition-transform duration-[var(--dur)] ease-[var(--ease-out-quart)]"
				style="width: calc((100% - 0.75rem - {(NAV_ITEMS.length - 1) *
					0.25}rem) / {NAV_ITEMS.length}); transform: translateX(calc({activeIndex} * (100% + 0.25rem)))"
				aria-hidden="true"
			></li>
		{/if}

		{#each NAV_ITEMS as item (item.href)}
			{@const active = isActive(item.href, page.url.pathname, base)}
			<li class="relative flex-1">
				<a
					href="{base}{item.href}"
					class="relative flex min-h-13 flex-col items-center justify-center gap-1 rounded-xl
					       text-2xs font-semibold transition-colors duration-[var(--dur-fast)]
					       {active ? 'text-brand' : 'text-ink-muted'}"
					aria-current={active ? 'page' : undefined}
				>
					<span class="relative">
						<Icon name={item.icon} size={22} strokeWidth={active ? 2.1 : 1.75} />
						{#if item.badge && dueCount > 0}
							<span
								class="absolute -right-2.5 -top-1.5 min-w-4.5 rounded-full bg-bad px-1
								       text-center text-2xs font-bold leading-[1.05rem] text-bad-ink"
							>
								{dueCount > 99 ? '99+' : dueCount}
							</span>
						{/if}
					</span>
					<span>{item.label}</span>
					{#if item.badge && dueCount > 0}
						<span class="sr-only">{dueCount} thẻ đến hạn</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>
