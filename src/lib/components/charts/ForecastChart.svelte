<script lang="ts">
	import type { ForecastDay } from '$lib/stats/forecast';

	let { days }: { days: ForecastDay[] } = $props();

	const max = $derived(Math.max(1, ...days.map((d) => d.count)));
	const total = $derived(days.reduce((n, d) => n + d.count, 0));

	/** Nhãn trục: chỉ ngày trong tháng, đủ để định vị mà không làm chật trục. */
	function dayNumber(iso: string): string {
		return String(Number(iso.slice(8)));
	}
</script>

{#if total === 0}
	<p class="py-8 text-center text-xs text-ink-muted">Chưa có thẻ nào được lên lịch ôn.</p>
{:else}
	<div class="relative">
		<!-- Đường dẫn ngang cho mắt bám mức giá trị, nằm dưới cột nên không che cột. -->
		<div class="pointer-events-none absolute inset-x-0 top-5 h-24" aria-hidden="true">
			{#each [0, 0.5] as fraction (fraction)}
				<span
					class="absolute inset-x-0 border-t border-dashed border-border"
					style="top: {fraction * 100}%"
				></span>
			{/each}
		</div>

		<div class="relative flex items-end gap-1" role="img" aria-label="Lịch ôn 14 ngày tới">
			{#each days as day, i (day.date)}
				<div class="flex min-w-0 flex-1 flex-col items-center gap-1">
					<span class="h-4 text-2xs font-semibold leading-4 tabular-nums text-ink-muted">
						{day.count || ''}
					</span>
					<!-- Cột chỉ bo góc trên và đứng trên một đường trục: cột thấp vẫn đọc ra là
					     cột, không thành viên thuốc như khi bo cả bốn góc. -->
					<div
						class="flex h-24 w-full items-end rounded-t-sm border-b border-border
						       bg-surface-3/60"
					>
						<div
							class="w-full rounded-t-[3px] transition-[height] duration-[var(--dur-slow)]
							       ease-[var(--ease-out-quart)]
							       {i === 0 ? 'bg-warn-solid' : 'bg-brand'}"
							style="height: {day.count === 0 ? 0 : Math.max(4, (day.count / max) * 100)}%"
							title="{day.date}: {day.count} thẻ"
						></div>
					</div>
					<span
						class="mt-1 text-2xs leading-4 tabular-nums
						       {i === 0 ? 'font-bold text-warn' : 'text-ink-subtle'}"
					>
						{i === 0 ? 'Nay' : dayNumber(day.date)}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Bảng số liệu cho screen reader — biểu đồ thuần hình không tự mô tả được. -->
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
