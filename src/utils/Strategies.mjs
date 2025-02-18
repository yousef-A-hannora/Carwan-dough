import { Strategy } from "passport-local";
import passport from "passport";
import { PrismaClient } from '@prisma/client';
import { compareHash } from "./Crypto.mjs";

const prisma = new PrismaClient();

export const usersStratigy = passport.use("users",new Strategy({usernameField:"phone"},async (phone,password,done)=>{
    try{
        const user = await prisma.user.findUnique({where:{phone:phone}});
        if (!user) {return done(null, false); }
        if (!compareHash(password,user.password)) { return done(null, false); }
        return done(null, user);
    }catch(err){return done(err);}
}))

export const adminStratigy = passport.use("admin",new Strategy(async (username,password,done)=>{
    try{
        const user = await prisma.user.findFirst({where:{name:username}});
        if (!user) {return done(null, false); }
        if (!compareHash(password,user.password)) { return done(null, false); }
        if (user.role !== "ADMIN") { return done(null, false); }
        return done(null, user);
    }catch(err){return done(err);}
}))