'use server'
import { db, prisma } from "@/prisma/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser(){
    try {
        const {userId} = await auth();
        const user = await currentUser();
        
        if(!user || !userId) return;

        const existingUser = await prisma.User.create({
            data: {
                clerkId : userId,
                
            }
        })

    } catch (error) {
        
    }
}