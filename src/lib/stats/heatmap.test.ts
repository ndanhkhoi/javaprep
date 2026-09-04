import { describe, expect, it } from 'vitest';
import { addDays } from '../srs/date';
import { HEATMAP_WEEKS, studyHeatmap } from './heatmap';

describe('studyHeatmap', () => {
	it('luôn trả về đủ số tuần, mỗi tuần 7 ngày', () => {
		const grid = studyHeatmap([], '2026-09-05');
		expect(grid).toHaveLength(HEATMAP_WEEKS);
		expect(grid.every((week) => week.length === 7)).toBe(true);
	});

	it('mỗi cột bắt đầu từ thứ Hai', () => {
		const grid = studyHeatmap([], '2026-09-05');
		for (const week of grid) {
			expect(new Date(`${week[0].date}T00:00:00`).getDay()).toBe(1);
		}
	});

	it('cột cuối chứa hôm nay', () => {
		const today = '2026-09-05';
		const grid = studyHeatmap([], today);
		expect(grid.at(-1)?.some((cell) => cell.date === today)).toBe(true);
	});

	it('ngày trong log được đánh dấu, ngày khác thì không', () => {
		const today = '2026-09-05';
		const studied = addDays(today, -3);
		const cells = studyHeatmap([studied], today).flat();

		expect(cells.find((c) => c.date === studied)?.studied).toBe(true);
		expect(cells.find((c) => c.date === addDays(today, -4))?.studied).toBe(false);
	});

	it('đánh dấu future cho ngày sau hôm nay và không bao giờ cho ngày trước', () => {
		const today = '2026-09-05';
		const cells = studyHeatmap([], today).flat();

		expect(cells.filter((c) => c.future).every((c) => c.date > today)).toBe(true);
		expect(cells.find((c) => c.date === today)?.future).toBe(false);
	});

	it('ngày liền mạch, không trùng và không hụt', () => {
		const cells = studyHeatmap([], '2026-09-05').flat();
		for (let i = 1; i < cells.length; i += 1) {
			expect(cells[i].date).toBe(addDays(cells[i - 1].date, 1));
		}
	});

	it('không phụ thuộc thứ trong tuần của hôm nay', () => {
		// Bảy hôm nay liên tiếp: mọi trường hợp thứ đều phải cho lưới hợp lệ.
		for (let i = 0; i < 7; i += 1) {
			const today = addDays('2026-09-01', i);
			const grid = studyHeatmap([], today);
			expect(grid.at(-1)?.some((cell) => cell.date === today)).toBe(true);
			expect(grid.flat()).toHaveLength(HEATMAP_WEEKS * 7);
		}
	});
});
