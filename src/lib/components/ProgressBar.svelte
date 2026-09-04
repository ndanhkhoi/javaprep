<script lang="ts">
	let {
		value,
		max = 100,
		label,
		height = '0.4375rem',
		/** `accent` lấy màu từ biến `--accent` của chủ đề bao ngoài. */
		tone = 'brand'
	}: {
		value: number;
		max?: number;
		label?: string;
		height?: string;
		tone?: 'brand' | 'accent' | 'ok';
	} = $props();

	const percent = $derived(max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100)));

	const FILL = {
		brand: 'bg-brand',
		accent: 'bg-[var(--accent-solid,var(--color-brand))]',
		ok: 'bg-ok-solid'
	} as const;
</script>

<div
	class="w-full overflow-hidden rounded-full bg-surface-4"
	style="height: {height}"
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin="0"
	aria-valuemax={max}
	aria-label={label}
>
	<div
		class="h-full rounded-full transition-[width] duration-[var(--dur-slow)]
		       ease-[var(--ease-out-quart)] {FILL[tone]}"
		style="width: {percent}%"
	></div>
</div>
