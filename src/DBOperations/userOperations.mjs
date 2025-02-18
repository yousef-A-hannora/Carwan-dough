import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function unflageUser(userId) {
    try{
        await prisma.user.update({
            where: { id: userId },
            data:{redFlags:0}
        })
    }catch(err){console.error(err)}
}