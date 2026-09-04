<script lang="ts">
	import { base } from '$app/paths';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { backupFileName, parseBackup, serialiseBackup } from '$lib/backup';
	import { progress } from '$lib/stores/progress.svelte';
	import type { PersistedState, ThemePreference } from '$lib/types';

	type Feedback = { tone: 'ok' | 'bad'; text: string; undo?: PersistedState };

	let feedback = $state<Feedback | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let confirmReset = $state(false);
	let confirmImport = $state(false);
	/** Dữ liệu đã đọc từ file, chờ người dùng xác nhận ghi đè. */
	let pendingImport = $state<PersistedState | null>(null);

	const THEMES: { value: ThemePreference; label: string }[] = [
		{ value: 'system', label: 'Hệ thống' },
		{ value: 'light', label: 'Sáng' },
		{ value: 'dark', label: 'Tối' }
	];
	const LIMITS = [5, 10, 20, 30].map((n) => ({ value: n, label: String(n) }));

	const cardCount = $derived(Object.keys(progress.cards).length);
	const incomingCount = $derived(
		pendingImport ? Object.keys(pendingImport.cards).length : 0
	);

	function exportBackup(): void {
		const blob = new Blob([serialiseBackup(progress.snapshot())], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = backupFileName(progress.today);
		link.click();
		URL.revokeObjectURL(url);
		feedback = { tone: 'ok', text: 'Đã tải file sao lưu.' };
	}

	async function readBackupFile(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		input.value = '';

		const result = parseBackup(await file.text());
		if (!result.ok) {
			feedback = { tone: 'bad', text: result.error };
			return;
		}

		pendingImport = result.state;
		confirmImport = true;
	}

	/**
	 * Ghi đè và xoá đều giữ lại ảnh chụp trạng thái cũ để hoàn tác được.
	 *
	 * Hộp xác nhận chỉ chặn được cú bấm nhầm; nó không giúp gì cho người bấm đúng rồi
	 * mới nhận ra mình chọn sai file. Ảnh chụp nằm trong bộ nhớ nên hoàn tác chỉ sống
	 * tới khi rời trang — vẫn đúng khoảng thời gian mà người dùng còn nhớ mình vừa làm gì.
	 */
	function applyImport(): void {
		if (!pendingImport) return;
		const previous = progress.snapshot();
		const count = Object.keys(pendingImport.cards).length;
		progress.replaceAll(pendingImport);
		pendingImport = null;
		feedback = { tone: 'ok', text: `Đã khôi phục ${count} thẻ.`, undo: previous };
	}

	function applyReset(): void {
		const previous = progress.snapshot();
		progress.reset();
		feedback = { tone: 'ok', text: 'Đã xoá toàn bộ tiến độ học.', undo: previous };
	}

	// Huỷ hộp xác nhận thì dữ liệu đã đọc từ file cũng phải bỏ đi, nếu không lần bấm
	// "Nhập từ file" sau sẽ mang theo số thẻ của file cũ trong lời cảnh báo.
	$effect(() => {
		if (!confirmImport) pendingImport = null;
	});

	function undo(state: PersistedState): void {
		progress.replaceAll(state);
		feedback = { tone: 'ok', text: 'Đã hoàn tác, tiến độ trở lại như trước.' };
	}
</script>

<svelte:head><title>Cài đặt — JavaPrep</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<PageHeader title="Cài đặt" backHref="{base}/" backLabel="Chủ đề" />

	{#if feedback}
		<div class="mb-5">
			<Alert
				tone={feedback.tone}
				text={feedback.text}
				action={feedback.undo ? 'Hoàn tác' : undefined}
				onAction={() => {
					const previous = feedback?.undo;
					if (previous) undo(previous);
				}}
				onDismiss={() => (feedback = null)}
			/>
		</div>
	{/if}

	<div class="space-y-4">
		<section class="surface-card rounded-2xl p-5" aria-labelledby="theme-heading">
			<div class="mb-3 flex items-start gap-3">
				<span
					class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"
					aria-hidden="true"
				>
					<Icon name="sun" size={17} />
				</span>
				<div class="min-w-0">
					<h2 id="theme-heading" class="text-sm font-bold">Giao diện</h2>
					<p class="mt-0.5 text-2xs text-ink-muted">
						"Hệ thống" đi theo cài đặt sáng/tối của thiết bị.
					</p>
				</div>
			</div>
			<SegmentedControl
				label="Chế độ giao diện"
				options={THEMES}
				value={progress.settings.theme}
				onSelect={(next) => progress.setTheme(next)}
			/>
		</section>

		<section class="surface-card rounded-2xl p-5" aria-labelledby="limit-heading">
			<div class="mb-3 flex items-start gap-3">
				<span
					class="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-soft text-warn"
					aria-hidden="true"
				>
					<Icon name="layers" size={17} />
				</span>
				<div class="min-w-0">
					<h2 id="limit-heading" class="text-sm font-bold">Thẻ mới mỗi ngày</h2>
					<p class="mt-0.5 text-2xs leading-relaxed text-ink-muted">
						Số thẻ chưa học được đưa vào mỗi phiên ôn. Đặt cao quá thì vài ngày sau lượng thẻ đến
						hạn sẽ dồn lại.
					</p>
				</div>
			</div>
			<SegmentedControl
				label="Giới hạn thẻ mới mỗi ngày"
				options={LIMITS}
				value={progress.settings.dailyNewLimit}
				onSelect={(next) => progress.setDailyNewLimit(next)}
			/>
		</section>

		<section class="surface-card rounded-2xl p-5" aria-labelledby="data-heading">
			<div class="mb-4 flex items-start gap-3">
				<span
					class="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-ink-muted"
					aria-hidden="true"
				>
					<Icon name="download" size={17} />
				</span>
				<div class="min-w-0">
					<h2 id="data-heading" class="text-sm font-bold">Dữ liệu</h2>
					<p class="mt-0.5 text-2xs leading-relaxed text-ink-muted">
						Tiến độ chỉ nằm trên thiết bị này. Xoá dữ liệu trình duyệt là mất hết — nên xuất file
						sao lưu định kỳ.
					</p>
				</div>
			</div>

			<div class="grid gap-2.5 sm:grid-cols-2">
				<Button variant="secondary" size="lg" onclick={exportBackup}>
					<Icon name="download" size={17} />
					Xuất sao lưu ({cardCount} thẻ)
				</Button>
				<Button variant="secondary" size="lg" onclick={() => fileInput?.click()}>
					<Icon name="upload" size={17} />
					Nhập từ file
				</Button>
			</div>
			<input
				bind:this={fileInput}
				type="file"
				accept="application/json,.json"
				class="sr-only"
				onchange={readBackupFile}
			/>

			<hr class="my-4 border-border" />

			<Button variant="danger" size="lg" full onclick={() => (confirmReset = true)}>
				<Icon name="trash" size={17} />
				Xoá toàn bộ tiến độ
			</Button>
		</section>

		<section
			class="rounded-2xl border border-border bg-surface-2 p-5"
			aria-labelledby="about-heading"
		>
			<h2 id="about-heading" class="eyebrow mb-2 text-ink-muted">Về JavaPrep</h2>
			<div class="space-y-2 text-xs leading-relaxed text-ink-muted">
				<p>
					100 câu hỏi phỏng vấn Java &amp; Spring Boot, bám Java 21 LTS và Spring Boot 3.x. Lịch ôn
					dùng thuật toán SM-2. App hoạt động hoàn toàn offline sau lần mở đầu tiên.
				</p>
				<p>
					Không có thông báo đẩy khi đóng app — số thẻ đến hạn được hiển thị ngay khi bạn mở
					JavaPrep.
				</p>
			</div>
		</section>
	</div>
</div>

<ConfirmDialog
	bind:open={confirmReset}
	icon="trash"
	title="Xoá toàn bộ tiến độ?"
	body="Toàn bộ lịch ôn và thống kê của {cardCount} thẻ sẽ bị xoá. Tuỳ chọn giao diện được giữ lại. Bạn vẫn có thể hoàn tác ngay sau đó."
	confirmLabel="Xoá tiến độ"
	onConfirm={applyReset}
/>

<ConfirmDialog
	bind:open={confirmImport}
	icon="upload"
	title="Ghi đè tiến độ hiện tại?"
	body="{incomingCount} thẻ trong file sẽ thay thế {cardCount} thẻ đang có trên máy này. Bạn vẫn có thể hoàn tác ngay sau đó."
	confirmLabel="Ghi đè"
	onConfirm={applyImport}
/>
