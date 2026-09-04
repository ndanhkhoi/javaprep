<script lang="ts" generics="T extends string | number">
	/**
	 * Nhóm lựa chọn loại trừ nhau. Con trỏ trượt được vẽ bằng một phần tử riêng đặt
	 * theo `translate` thay vì đổi nền từng nút — nhờ vậy có chuyển động liên tục và
	 * chỉ một phần tử được vẽ lại.
	 */
	let {
		options,
		value,
		onSelect,
		label
	}: {
		options: { value: T; label: string }[];
		value: T;
		onSelect: (value: T) => void;
		label: string;
	} = $props();

	const index = $derived(Math.max(0, options.findIndex((o) => o.value === value)));
	const count = $derived(Math.max(1, options.length));
</script>

<div
	class="relative flex rounded-xl border border-border bg-surface-2 p-1"
	role="group"
	aria-label={label}
>
	<span
		class="pointer-events-none absolute inset-y-1 left-1 rounded-lg bg-elevated shadow-1
		       transition-transform duration-[var(--dur)] ease-[var(--ease-out-quart)]"
		style="width: calc((100% - 0.5rem) / {count}); transform: translateX({index * 100}%)"
		aria-hidden="true"
	></span>

	{#each options as option (option.value)}
		<button
			type="button"
			class="relative z-10 min-h-10 flex-1 rounded-lg text-center text-xs font-semibold
			       tabular-nums transition-colors duration-[var(--dur-fast)]
			       {option.value === value ? 'text-ink' : 'text-ink-muted hover:text-ink'}"
			aria-pressed={option.value === value}
			onclick={() => onSelect(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>
