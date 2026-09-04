<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '../ui/Icon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { isActive } from './nav-items';

	const onSearch = $derived(isActive('/search', page.url.pathname, base));
	const onSettings = $derived(isActive('/settings', page.url.pathname, base));
</script>

<header
	class="surface-glass sticky top-0 z-30 border-b"
	style="padding-top: env(safe-area-inset-top)"
>
	<div class="mx-auto flex h-15 w-full max-w-6xl items-center gap-2 px-4 md:px-8">
		<!-- Nhãn thương hiệu chỉ cần ở mobile; desktop đã có nó trên sidebar. -->
		<a href="{base}/" class="flex min-h-11 items-center gap-2 pe-1 lg:hidden">
			<span
				class="aurora-mesh grid size-8 place-items-center rounded-lg border border-brand-line
				       text-brand"
			>
				<Icon name="bolt" size={16} strokeWidth={2.1} />
			</span>
			<strong class="text-sm font-extrabold tracking-tight">JavaPrep</strong>
		</a>

		<a
			href="{base}/search"
			class="ml-auto flex h-11 items-center gap-2 rounded-lg border border-border bg-surface-2
			       px-3 text-sm text-ink-muted transition-colors hover:border-border-strong
			       hover:text-ink lg:ml-0 lg:w-full lg:max-w-sm"
			aria-current={onSearch ? 'page' : undefined}
		>
			<Icon name="search" size={17} />
			<span class="hidden lg:inline">Tìm câu hỏi…</span>
			<span class="sr-only lg:hidden">Tìm câu hỏi</span>
		</a>

		<div class="flex items-center gap-2 lg:ml-auto">
			<!-- Cài đặt chỉ nằm ở đây khi chưa có sidebar. Không có nó thì từ một trang
			     sâu (ví dụ trang câu hỏi) người dùng mobile phải về trang chủ mới vào
			     được Cài đặt. -->
			<a
				href="{base}/settings"
				class="grid size-11 place-items-center rounded-lg border border-border bg-surface-2
				       transition-colors duration-[var(--dur-fast)] hover:border-border-strong
				       hover:text-ink lg:hidden
				       {onSettings ? 'text-brand' : 'text-ink-muted'}"
				aria-label="Cài đặt"
				aria-current={onSettings ? 'page' : undefined}
			>
				<Icon name="settings" size={18} />
			</a>
			<ThemeToggle />
		</div>
	</div>
</header>
