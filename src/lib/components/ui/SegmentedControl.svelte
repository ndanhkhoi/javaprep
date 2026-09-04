<script lang="ts" generics="T extends string | number">
	/**
	 * Nhóm lựa chọn loại trừ nhau. Con trỏ trượt được vẽ bằng một phần tử riêng đặt
	 * theo `translate` thay vì đổi nền từng nút — nhờ vậy có chuyển động liên tục và
	 * chỉ một phần tử được vẽ lại.
	 *
	 * Ngữ nghĩa là radio group, không phải nhóm nút bấm: chỉ một lựa chọn đúng tại một
	 * thời điểm. Vì thế cả nhóm chỉ chiếm **một** điểm dừng Tab và di chuyển giữa các
	 * lựa chọn bằng phím mũi tên — đúng pattern WAI-ARIA và đỡ cho người dùng bàn phím
	 * không phải Tab qua từng lựa chọn.
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

	const selectedIndex = $derived(options.findIndex((o) => o.value === value));
	/** Không lựa chọn nào khớp thì con trỏ nằm ở ô đầu và ô đầu giữ điểm dừng Tab. */
	const index = $derived(Math.max(0, selectedIndex));
	const count = $derived(Math.max(1, options.length));

	let buttons: HTMLButtonElement[] = $state([]);

	function move(from: number, delta: number): void {
		const next = (from + delta + options.length) % options.length;
		onSelect(options[next].value);
		buttons[next]?.focus();
	}

	function onKeydown(event: KeyboardEvent, i: number): void {
		const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
		if (step) {
			event.preventDefault();
			move(i, step);
			return;
		}
		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			const target = event.key === 'Home' ? 0 : options.length - 1;
			onSelect(options[target].value);
			buttons[target]?.focus();
		}
	}
</script>

<div class="relative flex rounded-xl border border-border bg-surface-2 p-1" role="radiogroup" aria-label={label}>
	<span
		class="pointer-events-none absolute inset-y-1 left-1 rounded-lg bg-elevated shadow-1
		       transition-transform duration-[var(--dur)] ease-[var(--ease-out-quart)]"
		style="width: calc((100% - 0.5rem) / {count}); transform: translateX({index * 100}%)"
		aria-hidden="true"
	></span>

	{#each options as option, i (option.value)}
		{@const selected = option.value === value}
		<button
			bind:this={buttons[i]}
			type="button"
			role="radio"
			class="relative z-10 min-h-11 flex-1 rounded-lg px-1 text-center text-xs font-semibold
			       tabular-nums transition-colors duration-[var(--dur-fast)]
			       {selected ? 'text-ink' : 'text-ink-muted hover:text-ink'}"
			aria-checked={selected}
			tabindex={i === index ? 0 : -1}
			onclick={() => onSelect(option.value)}
			onkeydown={(event) => onKeydown(event, i)}
		>
			{option.label}
		</button>
	{/each}
</div>
