import 'dotenv/config';
import { db } from '../lib/db';
import { users, pteQuestions } from '../lib/db/schema';

async function main() {
    try {
        const [user] = await db.select().from(users).limit(1);
        const [question] = await db.select().from(pteQuestions).limit(1);

        console.log(JSON.stringify({
            userId: user?.id,
            questionId: question?.id,
            questionType: question?.questionType
        }, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

main();
