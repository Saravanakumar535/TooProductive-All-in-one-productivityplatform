
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'msaravana535@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User NOT found with email:', email);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
