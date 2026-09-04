<script lang="ts">
	import { base } from '$app/paths';
	import Icon from '../ui/Icon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header
	class="surface-glass sticky top-0 z-30 border-b"
	style="padding-top: env(safe-area-inset-top)"
>
	<div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 md:px-8">
		<!-- Nhãn thương hiệu chỉ cần ở mobile; desktop đã có nó trên sidebar. -->
		<a href="{base}/" class="flex items-center gap-2 lg:hidden">
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
			class="ml-auto flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-2
			       px-3 text-sm text-ink-muted transition-colors hover:border-border-strong
			       hover:text-ink lg:ml-0 lg:w-full lg:max-w-sm"
		>
			<Icon name="search" size={17} />
			<span class="hidden lg:inline">Tìm câu hỏi…</span>
			<span class="sr-only lg:hidden">Tìm câu hỏi</span>
		</a>

		<div class="lg:ml-auto">
			<ThemeToggle />
		</div>
	</div>
</header>
