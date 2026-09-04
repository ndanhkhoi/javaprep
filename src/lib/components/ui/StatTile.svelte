<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	let {
		label,
		value,
		hint,
		icon,
		tone = 'default'
	}: {
		label: string;
		value: string | number;
		hint?: string;
		icon?: IconName;
		tone?: 'default' | 'brand' | 'ok' | 'warn' | 'bad';
	} = $props();

	const TONES = {
		default: { text: 'text-ink', chip: 'bg-surface-3 text-ink-muted' },
		brand: { text: 'text-brand', chip: 'bg-brand-soft text-brand' },
		ok: { text: 'text-ok', chip: 'bg-ok-soft text-ok' },
		warn: { text: 'text-warn', chip: 'bg-warn-soft text-warn' },
		bad: { text: 'text-bad', chip: 'bg-bad-soft text-bad' }
	} as const;
</script>

<div class="surface-card flex flex-col gap-2 rounded-xl p-3.5">
	<div class="flex items-center justify-between gap-2">
		<!-- Nhãn ở dạng câu, không in hoa: ba ô xếp cạnh nhau trên màn 375px không đủ
		     chỗ cho chữ in hoa có tracking, và đây là nhãn dữ liệu chứ không phải
		     tiêu đề khối. Icon chỉ xuất hiện từ `sm` — ở màn hẹp hơn nó lấy mất đúng
		     phần chỗ mà nhãn cần để không phải xuống dòng. -->
		<p class="min-w-0 text-2xs font-semibold text-ink-muted">{label}</p>
		{#if icon}
			<span
				class="hidden size-6 shrink-0 place-items-center rounded-md sm:grid {TONES[tone].chip}"
				aria-hidden="true"
			>
				<Icon name={icon} size={14} strokeWidth={2} />
			</span>
		{/if}
	</div>
	<p class="text-2xl font-extrabold leading-none tabular-nums sm:text-[1.6rem] {TONES[tone].text}">
		{value}
	</p>
	{#if hint}
		<p class="text-2xs text-ink-subtle">{hint}</p>
	{/if}
</div>
