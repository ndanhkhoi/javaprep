<script lang="ts">
	import Icon from '../ui/Icon.svelte';
	import { accentStyle } from '$lib/theme/topic-accent';
	import { topicIcon } from '$lib/theme/topic-icon';
	import type { MasteryBreakdown } from '$lib/stats/mastery';
	import type { Topic } from '$lib/types';

	let { rows }: { rows: { topic: Topic; mastery: MasteryBreakdown }[] } = $props();

	const SEGMENTS = [
		{ key: 'mature' as const, label: 'Đã thuộc', fill: 'var(--color-ok-solid)' },
		{ key: 'learning' as const, label: 'Đang học', fill: 'var(--color-warn-solid)' },
		/* Ô chú giải của đoạn này gần trùng màu nền thẻ nên phải có viền, nếu không thì
		   chú giải chỉ còn lại chữ mà không có mẫu màu. */
		{ key: 'new' as const, label: 'Chưa học', fill: 'var(--color-surface-4)', outlined: true }
	];

	function percent(part: number, total: number): number {
		return total === 0 ? 0 : (part / total) * 100;
	}
</script>

<div>
	<ul class="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-2xs font-medium text-ink-muted">
		{#each SEGMENTS as s (s.key)}
			<li class="flex items-center gap-1.5">
				<span
					class="size-2.5 rounded-sm {s.outlined ? 'border border-border-strong' : ''}"
					style="background: {s.fill}"
					aria-hidden="true"
				></span>
				{s.label}
			</li>
		{/each}
	</ul>

	<ul class="space-y-3">
		{#each rows as row (row.topic.id)}
			<li class="accent" style={accentStyle(row.topic.id)}>
				<div class="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
					<span class="flex min-w-0 items-center gap-1.5 font-semibold">
						<span class="text-[var(--accent)]" aria-hidden="true">
							<Icon name={topicIcon(row.topic.id)} size={13} strokeWidth={2} />
						</span>
						<span class="truncate">{row.topic.name}</span>
					</span>
					<span class="shrink-0 tabular-nums text-ink-muted">
						{row.mastery.mature}/{row.mastery.total}
					</span>
				</div>

				<!-- Một track, ba đoạn xếp cạnh nhau bằng flex: không cần SVG và tự co giãn. -->
				<div
					class="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-3"
					role="img"
					aria-label="{row.topic.name}: {row.mastery.mature} đã thuộc, {row.mastery
						.learning} đang học, {row.mastery.new} chưa học trên tổng {row.mastery.total} câu"
				>
					{#each SEGMENTS as s (s.key)}
						<span
							class="h-full transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-out-quart)]"
							style="width: {percent(row.mastery[s.key], row.mastery.total)}%; background: {s.fill}"
						></span>
					{/each}
				</div>
			</li>
		{/each}
	</ul>
</div>
