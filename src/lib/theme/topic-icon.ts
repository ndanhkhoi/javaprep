import type { IconName } from '$lib/components/ui/icons';

/**
 * Icon nhận diện của từng chủ đề. Nằm ở tầng `theme/` cùng {@link topicHue} vì đây
 * là quyết định trình bày, không phải dữ liệu nội dung: `topics.json` chỉ khai báo
 * chủ đề là gì, còn nó trông ra sao thì thuộc về giao diện.
 *
 * Thêm chủ đề mới: thêm một dòng ở đây và một hue ở `topic-accent.ts`.
 */
const ICON_BY_TOPIC: Record<string, IconName> = {
	'java-core': 'coffee',
	collections: 'archive',
	concurrency: 'branch',
	'jvm-memory': 'chip',
	exceptions: 'alert',
	'java8-plus': 'rocket',
	'spring-core': 'sprout',
	'spring-boot': 'power',
	'spring-web': 'globe',
	'spring-data': 'database',
	'spring-security': 'lock'
};

/** Chủ đề lạ vẫn hiển thị được, chỉ mất tính riêng biệt — giống cách hue mặc định. */
export const DEFAULT_TOPIC_ICON: IconName = 'book';

export function topicIcon(topicId: string | undefined | null): IconName {
	return (topicId ? ICON_BY_TOPIC[topicId] : undefined) ?? DEFAULT_TOPIC_ICON;
}
