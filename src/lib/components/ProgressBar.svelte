<script lang="ts">
	let {
		value,
		max = 100,
		label,
		height = '0.375rem'
	}: { value: number; max?: number; label?: string; height?: string } = $props();

	const percent = $derived(max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100)));
</script>

<div
	class="w-full overflow-hidden rounded-full bg-surface-3"
	style="height: {height}"
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin="0"
	aria-valuemax={max}
	aria-label={label}
>
	<div class="h-full rounded-full bg-brand transition-[width] duration-300" style="width: {percent}%"></div>
</div>
