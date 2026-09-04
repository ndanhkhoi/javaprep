<script lang="ts">
	import { studyHeatmap } from '$lib/stats/heatmap';
	import type { IsoDate } from '$lib/srs/date';

	let {
		studyLog,
		today
	}: { studyLog: readonly IsoDate[]; today: IsoDate } = $props();

	const weeks = $derived(studyHeatmap(studyLog, today));
	const totalDays = $derived(weeks.flat().filter((cell) => cell.studied).length);

	const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

	/** Nhãn tháng chỉ hiện ở cột đầu tiên của mỗi tháng — nhiều hơn thế là trục bị chật. */
	const monthLabels = $derived(
		weeks.map((week, i) => {
			const month = week[0].date.slice(5, 7);
			const previous = i === 0 ? '' : weeks[i - 1][0].date.slice(5, 7);
			return month === previous ? '' : `T${Number(month)}`;
		})
	);
</script>

<div>
	<div class="flex gap-1.5">
		<!-- Nhãn thứ: chỉ 3 hàng để không rối, đúng cách các lưới đóng góp vẫn làm. -->
		<ul class="flex shrink-0 flex-col gap-[3px] pt-[1.125rem]" aria-hidden="true">
			{#each DOW as day, i (day)}
				<li class="h-3 text-[0.5rem] leading-3 text-ink-subtle">
					{i % 2 === 0 ? day : ''}
				</li>
			{/each}
		</ul>

		<div class="min-w-0 flex-1 overflow-x-auto">
			<div class="flex gap-[3px]">
				{#each weeks as week, w (week[0].date)}
					<div class="flex flex-col gap-[3px]">
						<span class="h-4 text-[0.5rem] leading-4 text-ink-subtle" aria-hidden="true">
							{monthLabels[w]}
						</span>
						{#each week as cell (cell.date)}
							<span
								class="size-3 rounded-[3px] {cell.future
									? 'bg-transparent'
									: cell.studied
										? 'bg-ok-solid'
										: 'bg-surface-3'}
								       {cell.date === today ? 'ring-1 ring-brand ring-offset-1 ring-offset-elevated' : ''}"
								title={cell.future
									? cell.date
									: `${cell.date}: ${cell.studied ? 'đã ôn' : 'không ôn'}`}
								aria-hidden="true"
							></span>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="mt-3 flex items-center justify-between gap-3 text-2xs text-ink-subtle">
		<p class="tabular-nums">{totalDays} ngày đã ôn trong {weeks.length} tuần gần đây</p>
		<p class="flex items-center gap-1.5">
			Không
			<span class="size-2.5 rounded-[3px] bg-surface-3" aria-hidden="true"></span>
			<span class="size-2.5 rounded-[3px] bg-ok-solid" aria-hidden="true"></span>
			Có ôn
		</p>
	</div>

	<!-- Lưới trên là hình ảnh thuần; số liệu cho screen reader nằm ở đây. -->
	<p class="sr-only">
		Trong {weeks.length} tuần gần đây bạn đã ôn {totalDays} ngày.
	</p>
</div>
