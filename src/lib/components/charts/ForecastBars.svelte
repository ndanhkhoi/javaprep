<script lang="ts">
	import type { ForecastDay } from '$lib/stats/forecast';

	let { days }: { days: ForecastDay[] } = $props();

	const max = $derived(Math.max(1, ...days.map((d) => d.count)));
	const total = $derived(days.reduce((n, d) => n + d.count, 0));

	function dayLabel(iso: string): string {
		return iso.slice(8);
	}
</script>

{#if total === 0}
	<p class="py-4 text-center text-xs text-ink-muted">Chưa có thẻ nào được lên lịch ôn.</p>
{:else}
	<div class="flex h-24 items-end gap-[3px]" role="img" aria-label="Lịch ôn 14 ngày tới">
		{#each days as day, i (day.date)}
			<div class="flex h-full flex-1 flex-col items-center gap-1">
				<span class="h-3 text-[9px] leading-3 tabular-nums text-ink-muted">{day.count || ''}</span>
				<!-- Track nền giữ cho trục 14 ngày luôn đọc được kể cả khi chưa có thẻ nào. -->
				<div class="flex w-full flex-1 items-end rounded-sm bg-surface-3">
					<div
						class="w-full rounded-sm {i === 0 ? 'bg-warn' : 'bg-brand'}"
						style="height: {day.count === 0 ? 0 : Math.max(8, (day.count / max) * 100)}%"
						title="{day.date}: {day.count} thẻ"
					></div>
				</div>
				<span class="text-[9px] leading-3 tabular-nums text-ink-muted">{dayLabel(day.date)}</span>
			</div>
		{/each}
	</div>

	<!-- Bảng số liệu cho screen reader — biểu đồ SVG thuần không tự mô tả được. -->
	<table class="sr-only">
		<caption>Số thẻ đến hạn theo ngày</caption>
		<thead><tr><th scope="col">Ngày</th><th scope="col">Số thẻ</th></tr></thead>
		<tbody>
			{#each days as day (day.date)}
				<tr><td>{day.date}</td><td>{day.count}</td></tr>
			{/each}
		</tbody>
	</table>
{/if}
