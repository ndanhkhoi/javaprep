<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Vòng tiến độ SVG. Dùng `stroke-dasharray` trên một circle duy nhất — không cần
	 * thư viện chart nào và chạy được cả khi JS đã dừng (giá trị nằm trong attribute).
	 */
	let {
		value,
		max = 100,
		size = 112,
		thickness = 10,
		track = 'var(--color-surface-3)',
		stroke = 'var(--color-brand)',
		label,
		boxClass,
		children
	}: {
		value: number;
		max?: number;
		size?: number;
		thickness?: number;
		track?: string;
		stroke?: string;
		label: string;
		/**
		 * Class quyết định kích thước hiển thị. `size` chỉ còn là hình học của viewBox,
		 * nên truyền `boxClass="size-22 sm:size-31"` là có vòng responsive mà không cần
		 * đo màn hình bằng JS.
		 */
		boxClass?: string;
		children?: Snippet;
	} = $props();

	const radius = $derived((size - thickness) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const ratio = $derived(max <= 0 ? 0 : Math.min(1, Math.max(0, value / max)));
	const percent = $derived(Math.round(ratio * 100));
</script>

<div
	class="relative grid place-items-center {boxClass ?? ''}"
	style={boxClass ? undefined : `width: ${size}px; height: ${size}px`}
>
	<svg
		viewBox="0 0 {size} {size}"
		class="h-full w-full -rotate-90"
		role="img"
		aria-label="{label}: {percent}%"
	>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={track}
			stroke-width={thickness}
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			{stroke}
			stroke-width={thickness}
			stroke-linecap="round"
			stroke-dasharray="{circumference} {circumference}"
			stroke-dashoffset={circumference * (1 - ratio)}
			class="transition-[stroke-dashoffset] duration-[var(--dur-slow)] ease-[var(--ease-out-quart)]"
		/>
	</svg>

	<div class="absolute inset-0 grid place-items-center text-center leading-none">
		{#if children}
			{@render children()}
		{:else}
			<span class="text-xl font-bold tabular-nums">{percent}%</span>
		{/if}
	</div>
</div>
