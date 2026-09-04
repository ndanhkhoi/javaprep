import { addDays, fromIsoDate, type IsoDate } from '../srs/date';

export type HeatCell = {
	date: IsoDate;
	studied: boolean;
	/** Ngày nằm sau hôm nay — vẽ như ô trống để lưới luôn đủ 7 hàng. */
	future: boolean;
};

/** Một cột của lưới = một tuần, luôn đủ 7 ô và bắt đầu từ thứ Hai. */
export type HeatWeek = HeatCell[];

export const HEATMAP_WEEKS = 18;

/**
 * Lưới ngày đã học, xếp theo tuần để vẽ dạng heatmap.
 *
 * Tuần bắt đầu thứ Hai (quy ước Việt Nam) và cột cuối luôn là tuần chứa hôm nay, nên
 * ô "hôm nay" nằm ở vị trí cố định người dùng quen mắt.
 *
 * Hàm thuần: `today` truyền từ ngoài, không đọc đồng hồ — cùng lý do như `review()`
 * trong SM-2.
 */
export function studyHeatmap(
	studyLog: readonly IsoDate[],
	today: IsoDate,
	weeks: number = HEATMAP_WEEKS
): HeatWeek[] {
	const studied = new Set(studyLog);
	// getDay(): 0 = Chủ nhật. Đổi sang chỉ số thứ Hai = 0.
	const mondayOffset = (fromIsoDate(today).getDay() + 6) % 7;
	const start = addDays(today, -mondayOffset - (weeks - 1) * 7);

	return Array.from({ length: weeks }, (_, w) =>
		Array.from({ length: 7 }, (_, d) => {
			const date = addDays(start, w * 7 + d);
			return { date, studied: studied.has(date), future: date > today };
		})
	);
}
