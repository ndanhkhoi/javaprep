<script lang="ts">
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterChip from '$lib/components/ui/FilterChip.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import RingProgress from '$lib/components/ui/RingProgress.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { questions, topics } from '$lib/data';
	import { buildSession, countDue } from '$lib/srs/queue';
	import { progress } from '$lib/stores/progress.svelte';

	let topic = $state<string | null>(null);

	const dueTotal = $derived(progress.dueCount);
	const session = $derived(
		buildSession({
			questions,
			cards: progress.cards,
			today: progress.today,
			dailyNewLimit: progress.settings.dailyNewLimit,
			topicFilter: topic
		})
	);
	const dueInScope = $derived(
		topic
			? countDue(
					progress.cards,
					questions.filter((q) => q.topic === topic),
					progress.today
				)
			: dueTotal
	);
	const newInScope = $derived(session.length - dueInScope);
	const href = $derived(topic ? `${base}/study/session?topic=${topic}` : `${base}/study/session`);
	const scopeLabel = $derived(topics.find((t) => t.id === topic)?.name ?? 'Tất cả chủ đề');
</script>

<svelte:head><title>Ôn thẻ — JavaPrep</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<PageHeader
		eyebrow="Spaced repetition"
		title="Ôn thẻ"
		description="Lật thẻ, tự chấm mức độ nhớ. Lịch ôn tự điều chỉnh theo thuật toán SM-2 — chấm thật thì lịch mới đúng."
	/>

	<section class="mb-5">
		<SectionHeading title="Phạm vi" hint={scopeLabel} />
		<div class="flex flex-wrap gap-2">
			<FilterChip active={topic === null} onToggle={() => (topic = null)}>Tất cả</FilterChip>
			{#each topics as t (t.id)}
				<FilterChip
					active={topic === t.id}
					onToggle={() => (topic = topic === t.id ? null : t.id)}
				>
					<span aria-hidden="true">{t.icon}</span>
					{t.name}
				</FilterChip>
			{/each}
		</div>
	</section>

	<section
		class="surface-panel mb-4 overflow-hidden rounded-2xl p-5 sm:p-6"
		role="status"
		aria-live="polite"
	>
		{#if session.length === 0}
			<div class="flex items-center gap-4">
				<span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-ok-soft text-ok">
					<Icon name="check" size={26} strokeWidth={2.4} />
				</span>
				<div class="min-w-0">
					<p class="text-heading font-bold">Hết thẻ trong phạm vi này</p>
					<p class="mt-1 text-sm leading-relaxed text-ink-muted">
						Muốn học thêm thì tăng giới hạn thẻ mới mỗi ngày trong
						<a href="{base}/settings" class="font-semibold text-brand underline">Cài đặt</a>, hoặc
						đổi phạm vi sang chủ đề khác.
					</p>
				</div>
			</div>
		{:else}
			<div class="flex flex-wrap items-center gap-6">
				<RingProgress
					value={dueInScope}
					max={session.length}
					size={104}
					thickness={10}
					boxClass="size-20 shrink-0 sm:size-26"
					stroke="var(--color-warn-solid)"
					label="Tỷ lệ thẻ đến hạn trong phiên"
				>
					<span class="flex flex-col items-center">
						<span class="text-2xl font-extrabold tabular-nums">{session.length}</span>
						<span class="text-2xs font-medium text-ink-muted">thẻ</span>
					</span>
				</RingProgress>

				<dl class="min-w-0 flex-1 space-y-2.5">
					<div class="flex items-center gap-2.5">
						<span class="size-2.5 shrink-0 rounded-full bg-warn-solid" aria-hidden="true"></span>
						<dt class="flex-1 text-sm text-ink-muted">Đến hạn</dt>
						<dd class="text-sm font-bold tabular-nums">{dueInScope}</dd>
					</div>
					<div class="flex items-center gap-2.5">
						<span
							class="size-2.5 shrink-0 rounded-full bg-surface-4 ring-1 ring-border"
							aria-hidden="true"
						></span>
						<dt class="flex-1 text-sm text-ink-muted">Thẻ mới</dt>
						<dd class="text-sm font-bold tabular-nums">{newInScope}</dd>
					</div>
					<div class="flex items-center gap-2.5 border-t border-border pt-2.5">
						<dt class="flex-1 text-sm font-semibold">Tổng phiên</dt>
						<dd class="text-sm font-bold tabular-nums">{session.length}</dd>
					</div>
				</dl>
			</div>
		{/if}
	</section>

	{#if session.length > 0}
		<Button {href} size="lg" full>
			<Icon name="cards" size={18} strokeWidth={2} />
			Bắt đầu ôn {session.length} thẻ
		</Button>
	{:else}
		<Button href="{base}/quiz" variant="secondary" size="lg" full>
			<Icon name="quiz" size={18} />
			Làm quiz thay thế
		</Button>
	{/if}
</div>
