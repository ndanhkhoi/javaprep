import type { IconName } from '../ui/icons';

export type NavItem = {
	href: string;
	label: string;
	icon: IconName;
	/** Hiện badge số thẻ đến hạn — chỉ đúng một mục được bật. */
	badge?: boolean;
};

/** Nguồn duy nhất cho cả dock ở mobile và sidebar ở desktop. */
export const NAV_ITEMS: NavItem[] = [
	{ href: '/', label: 'Chủ đề', icon: 'grid' },
	{ href: '/study', label: 'Ôn thẻ', icon: 'cards', badge: true },
	{ href: '/quiz', label: 'Quiz', icon: 'quiz' },
	{ href: '/progress', label: 'Tiến độ', icon: 'chart' }
];

/**
 * `/` chỉ khớp chính xác, các mục khác khớp theo tiền tố để trang con (ví dụ
 * `/study/session`) vẫn làm sáng mục cha.
 */
export function isActive(href: string, pathname: string, base: string): boolean {
	const path = pathname.slice(base.length) || '/';
	return href === '/' ? path === '/' : path.startsWith(href);
}
