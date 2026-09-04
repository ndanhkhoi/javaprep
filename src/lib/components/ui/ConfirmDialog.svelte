<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	/**
	 * Hộp xác nhận cho hành động không hoàn tác được.
	 *
	 * Dùng `<dialog>` của nền tảng thay vì tự dựng overlay: bẫy focus, đóng bằng `Esc`,
	 * `::backdrop` và trạng thái inert của phần còn lại đều là hành vi có sẵn — tự viết
	 * lại chỉ để trông giống hệt là công không cần bỏ ra.
	 *
	 * Thay cho `confirm()` vì hộp thoại của trình duyệt không nói được **hậu quả cụ thể**
	 * bằng đúng ngôn ngữ của app, và hai `confirm()` nối nhau thì người dùng chỉ học
	 * cách bấm OK hai lần chứ không đọc.
	 */
	let {
		open = $bindable(false),
		title,
		body,
		confirmLabel,
		cancelLabel = 'Huỷ',
		icon = 'alert',
		tone = 'danger',
		onConfirm
	}: {
		open?: boolean;
		title: string;
		body: string;
		confirmLabel: string;
		cancelLabel?: string;
		icon?: IconName;
		tone?: 'danger' | 'primary';
		onConfirm: () => void;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	/** Một trang có thể chứa nhiều hộp thoại — id phải khác nhau để aria trỏ đúng chỗ. */
	const uid = $props.id();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	function confirm(): void {
		open = false;
		onConfirm();
	}
</script>

<dialog
	bind:this={dialog}
	class="surface-panel m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-2xl p-5 text-ink
	       backdrop:bg-black/50 backdrop:backdrop-blur-sm"
	aria-labelledby="{uid}-title"
	aria-describedby="{uid}-body"
	onclose={() => (open = false)}
	oncancel={() => (open = false)}
>
	<div class="flex items-start gap-3">
		<span
			class="grid size-10 shrink-0 place-items-center rounded-xl
			       {tone === 'danger' ? 'bg-bad-soft text-bad' : 'bg-brand-soft text-brand'}"
			aria-hidden="true"
		>
			<Icon name={icon} size={20} strokeWidth={2} />
		</span>
		<div class="min-w-0">
			<h2 id="{uid}-title" class="text-heading font-bold">{title}</h2>
			<p id="{uid}-body" class="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
		</div>
	</div>

	<div class="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
		<Button variant="secondary" size="md" onclick={() => (open = false)}>{cancelLabel}</Button>
		<Button variant={tone === 'danger' ? 'danger' : 'primary'} size="md" onclick={confirm}>
			{confirmLabel}
		</Button>
	</div>
</dialog>

<style>
	dialog[open] {
		animation: dialog-in 200ms var(--ease-out-quart) both;
	}

	dialog[open]::backdrop {
		animation: backdrop-in 200ms var(--ease-soft) both;
	}

	@keyframes dialog-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.97);
		}
	}

	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
	}
</style>
