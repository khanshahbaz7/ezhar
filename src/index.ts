import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema'
import { db } from './db/drizzle';



async function main() {

    const userId = "3ad9afc7-1421-4027-ae9f-6e5dbbaa8a3d"
    if (!userId) return;
    const notifications = await db.query.notifications.findMany({
        where: { receivedById: userId }
    })

    console.log(notifications);

}

main();
