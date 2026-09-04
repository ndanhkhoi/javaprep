import type { CardState } from '../types';
import { addDays, type IsoDate } from '../srs/date';

export type ForecastDay = { date: IsoDate; count: number };

export const FORECAST_DAYS = 14;

/**
 * Số thẻ đến hạn trong `days` ngày tới.
 *
 * Thẻ **quá hạn** được dồn hết vào cột hôm nay — đúng với thực tế: quá hạn nghĩa là
 * phải ôn ngay, không phải ôn vào cái ngày đã trôi qua.
 */
export function forecast(
	cards: Record<string, CardState>,
	today: IsoDate,
	days: number = FORECAST_DAYS
): ForecastDay[] {
	const out: ForecastDay[] = Array.from({ length: days }, (_, i) => ({
		date: addDays(today, i),
		count: 0
	}));
	const lastDate = out[out.length - 1]?.date;
	if (!lastDate) return out;

	const indexByDate = new Map(out.map((d, i) => [d.date, i]));

	for (const state of Object.values(cards)) {
		if (state.due === '' || state.due > lastDate) continue;
		// Quá hạn (due < today) rơi vào cột đầu tiên.
		const index = indexByDate.get(state.due) ?? 0;
		out[index].count += 1;
	}
	return out;
}
