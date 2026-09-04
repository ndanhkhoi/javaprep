<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
	type Size = 'sm' | 'md' | 'lg';

	/**
	 * Có `href` thì render `<a>`, không thì `<button>` — cùng một hình dạng thị giác,
	 * đúng phần tử ngữ nghĩa. Props được liệt kê tường minh thay vì `...rest`: giao
	 * của `HTMLAnchorAttributes` và `HTMLButtonAttributes` xung đột ở `type` và làm
	 * spread mất kiểu.
	 */
	let {
		variant = 'primary',
		size = 'md',
		full = false,
		href,
		type = 'button',
		disabled = false,
		onclick,
		title,
		ariaLabel,
		class: extra = '',
		children
	}: {
		variant?: Variant;
		size?: Size;
		full?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		title?: string;
		ariaLabel?: string;
		class?: string;
		children: Snippet;
	} = $props();

	const SIZES: Record<Size, string> = {
		sm: 'min-h-9 gap-1.5 rounded-md px-3 text-xs',
		md: 'min-h-11 gap-2 rounded-lg px-4 text-sm',
		lg: 'min-h-13 gap-2 rounded-xl px-5 text-[0.9375rem]'
	};

	const VARIANTS: Record<Variant, string> = {
		primary:
			'border border-transparent bg-brand text-brand-ink shadow-glow hover:bg-brand-hover active:shadow-none',
		secondary: 'surface-card text-ink hover:border-border-strong hover:bg-surface-2 active:bg-surface-3',
		ghost: 'border border-transparent text-ink-muted hover:bg-surface-2 hover:text-ink',
		danger: 'border border-bad/45 bg-bad-soft text-bad hover:border-bad',
		accent: 'border border-transparent bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110'
	};

	const shape = $derived(
		`inline-flex select-none items-center justify-center text-center font-semibold
		 transition-[background-color,border-color,box-shadow,transform,filter]
		 duration-[var(--dur-fast)] active:scale-[0.985]
		 ${SIZES[size]} ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${extra}`
	);
</script>

{#if href}
	<a {href} {title} aria-label={ariaLabel} class={shape} {onclick}>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		{title}
		aria-label={ariaLabel}
		class="{shape} disabled:pointer-events-none disabled:opacity-45"
		{onclick}
	>
		{@render children()}
	</button>
{/if}
