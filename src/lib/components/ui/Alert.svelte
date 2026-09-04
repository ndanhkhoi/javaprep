<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	/**
	 * Thông báo kết quả của một hành động, kèm lối hoàn tác khi có.
	 *
	 * Tự ẩn sau `duration` ms vì đây là phản hồi nhất thời, không phải nội dung: để
	 * nguyên trên màn hình thì lần sau người dùng không biết dòng đó nói về thao tác
	 * cũ hay thao tác mới. Thông báo có nút hoàn tác thì sống lâu hơn — người dùng cần
	 * thời gian để nhận ra mình vừa làm sai.
	 */
	let {
		tone,
		text,
		action,
		onAction,
		onDismiss,
		duration = action ? 9000 : 5000
	}: {
		tone: 'ok' | 'bad';
		text: string;
		action?: string;
		onAction?: () => void;
		onDismiss: () => void;
		duration?: number;
	} = $props();

	const TONES: Record<'ok' | 'bad', { classes: string; icon: IconName }> = {
		ok: { classes: 'border-ok/40 bg-ok-soft text-ok', icon: 'check' },
		bad: { classes: 'border-bad/40 bg-bad-soft text-bad', icon: 'alert' }
	};

	// Đếm lại từ đầu mỗi khi nội dung đổi: hai thao tác liên tiếp không được rút ngắn
	// thời gian đọc của thao tác sau.
	$effect(() => {
		void text;
		const timer = setTimeout(onDismiss, duration);
		return () => clearTimeout(timer);
	});
</script>

<div
	class="animate-rise flex items-center gap-2.5 rounded-xl border p-3 text-sm font-medium
	       {TONES[tone].classes}"
	role="status"
	aria-live="polite"
>
	<Icon name={TONES[tone].icon} size={17} strokeWidth={2.2} class="shrink-0" />
	<p class="min-w-0 flex-1 leading-snug">{text}</p>

	{#if action && onAction}
		<button
			type="button"
			class="min-h-10 shrink-0 rounded-lg border border-current px-3 text-xs font-bold
			       transition-opacity hover:opacity-75"
			onclick={onAction}
		>
			{action}
		</button>
	{/if}

	<button
		type="button"
		class="grid size-10 shrink-0 place-items-center rounded-lg transition-opacity hover:opacity-70"
		aria-label="Đóng thông báo"
		onclick={onDismiss}
	>
		<Icon name="x" size={15} strokeWidth={2.4} />
	</button>
</div>
