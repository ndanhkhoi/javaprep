import type { AuthoredQuestion, QuestionBank, Topic } from '../types';
import topicsJson from './topics.json';
import javaCore from './topics/java-core.json';
import collections from './topics/collections.json';
import concurrency from './topics/concurrency.json';
import jvmMemory from './topics/jvm-memory.json';
import exceptions from './topics/exceptions.json';
import java8Plus from './topics/java8-plus.json';
import springCore from './topics/spring-core.json';
import springBoot from './topics/spring-boot.json';
import springWeb from './topics/spring-web.json';
import springData from './topics/spring-data.json';
import springSecurity from './topics/spring-security.json';

/**
 * Bộ câu hỏi **đầy đủ**, đúng như được biên soạn. Chỉ dùng bởi validator và script
 * sinh dữ liệu — ứng dụng không import file này, nếu không toàn bộ `answerLong`
 * sẽ chui vào bundle khởi động.
 */
export const authoredBank: QuestionBank = {
	schemaVersion: 1,
	topics: topicsJson as Topic[],
	questions: [
		...javaCore,
		...collections,
		...concurrency,
		...jvmMemory,
		...exceptions,
		...java8Plus,
		...springCore,
		...springBoot,
		...springWeb,
		...springData,
		...springSecurity
	] as AuthoredQuestion[]
};
