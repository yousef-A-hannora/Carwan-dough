import { Router } from "express";
import {userSignUpValidation} from "../utils/validation.mjs"
import { validationResult,matchedData } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { passHashing } from "../utils/Crypto.mjs";
import {getuserOrder,getOrderWithItemsAndProductInfo} from "../DBOperations/Gitters.mjs"
import {updateOrderOwner} from "../DBOperations/OrderManagment.mjs"
import passport from "passport";
import { adminOnly } from "../utils/AccessControle.mjs";
import sendWA from "../utils/WhatsappSender.mjs"
import {CommunicationCenter} from "../services/messaging.mjs"
import crypto from "crypto"

const prisma = new PrismaClient();
const CC = new CommunicationCenter();
const authRouter = Router()

authRouter.post("/register",userSignUpValidation,async (req,res)=>{
    try{
    const errors = validationResult(req)
    const data = matchedData(req)

    if(!errors.isEmpty()) {return res.status(400).send({msg:"Username must be more than 3 letters, only contain letters and numbers. and use valid phone number"})}
    
    //check if user existed
    const userCheck = await prisma.user.findUnique({where:{
        phone:data.phone,
    }})
    if(userCheck) return res.status(400).send({msg:"phone number is already taken"})

    req.session.data = data
    console.log(req.session.data)
    const sendOTP = async ()=>{
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        req.session.otp = otp;
        // await sendWA(data.phone,otp);
        CC.sendEmail(data.email,otp,`your OTP is ${otp}`)
        req.session.lastOTP = Date.now()
        return res.sendStatus(200);
    }
    if(!req.session.lastOTP){
        await sendOTP()
    }else{
        let lastOTP = req.session.lastOTP
        let now = Date.now()
        let expectedTime = new Date(lastOTP).getTime() + 3 * 60 * 1000;
        if(now >= expectedTime){
            await sendOTP()
        }else{
            return res.status(400).send({msg:"You should wait 3 minutes before requesting a new code"})
        }
    }

    }catch(err){console.log(err);res.status(400).send("something went wronge")}
})

authRouter.post('/login', (req, res, next) => {
    passport.authenticate('users', async (err, user) => {
        if (err) {
            console.log("Authentication error:", err);
            return res.status(500).send("Internal server error");
        }
        if (!user) {
            return res.status(403).send("Invalid username or password");
        }
        req.logIn(user, async (err) => {
            if (err) {
                console.log("Login error:", err);
                return res.status(500).send("Internal server error");
            }
            try {
                const order = await getuserOrder(user.id);
                if (order) {
                    req.session.orderId = order.id;
                }
                res.sendStatus(200);
            } catch (err) {
                console.log("Order error:", err);
                res.status(400).send("General error");
            }
        });
    })(req, res, next);
});

authRouter.post('/adminLogin', (req, res, next) => {
    passport.authenticate('admin', async (err, user) => {
        if (err) {
            console.log("Authentication error:", err);
            return res.status(500).send("Internal server error");
        }
        if (!user) {
            return res.status(403).send("Invalid username or password");
        }
        req.logIn(user, async (err) => {
            if (err) {
                console.log("Login error:", err);
                return res.status(500).send("Internal server error");
            }
            try {
                const order = await getuserOrder(user.id);
                if (order) {
                    req.session.orderId = order.id;
                }
                res.sendStatus(200);

            } catch (err) {
                console.log("Order error:", err);
                res.status(400).send("General error");
            }
        });
    })(req, res, next);
});

authRouter.get("/checkAuth",async (req,res)=>{
    if(req.isAuthenticated()){
        const order = await getOrderWithItemsAndProductInfo(req.session.orderId)
        return res.status(200).send({"msg":"User is authenticated","OrderInfo":order})
    }
    return res.status(401).send("User is not authenticated")
})


authRouter.get("/logout",(req,res)=>{
    let isAdmin
    if(req.isAuthenticated() && req.user.role === "ADMIN") isAdmin = true;
    req.logout((err)=>{
        if(err) return next(err)
        if(isAdmin) return res.status(200).redirect("/APGDXKgwqbyJ3hj6Lxctda9Rspv72SNWrQmVf5Hu4Y8EeTBFCk/adminLogin")
        return res.status(200).redirect("/login")
    })
})


authRouter.patch("/adminUpdate",adminOnly,async (req,res)=>{
    try{
        const {body:{password}} = req
        const hashedPass = passHashing(password);
        await prisma.user.update({
            where:{id:req.user.id},
            data:{password:hashedPass}
        })
        res.sendStatus(200)
    }catch(err){return res.status(500).send("Error happened")}
})

authRouter.post("/OTP", async (req, res) => {
    try{
        const { body: { OTP } } = req;
        const data = req.session.data;
        console.log(req.session)
        // Hash the password
        const hashedPass = passHashing(data.password);

        if (OTP === req.session.otp) {
            // Add user to the DB
            const newUser = await prisma.user.create({
                data: {
                    name: data.username,
                    phone: data.phone,
                    password: hashedPass,
                    email:data.email
                }
            });

            // Log in the user
            req.login(newUser, async (err) => {
                if (err) {
                    console.error("Login error:", err);
                    return res.status(500).send("Internal server error");
                }

                // Update order owner if session has an orderId
                if (req.session.orderId) {
                    await updateOrderOwner(req.session.orderId, newUser.id);
                }

                return res.sendStatus(200);
            });
        } else {
            return res.sendStatus(400); // Invalid OTP
        }
    }catch(err){return res.status(500).send("Error happened")}
});

authRouter.post('/forgetPass', async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Username is required' });
    }
  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sendOTP = async ()=>{
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // await sendWA(phone,otp);
        CC.sendEmail(email,otp,`your OTP is ${otp}`)

        req.session.otp = otp;
        req.session.email = email;
        req.session.lastOTP = Date.now()
        return res.sendStatus(200);
    }
    
    if(!req.session.lastOTP){
        await sendOTP()
    }else{
        let lastOTP = req.session.lastOTP
        let now = Date.now()
        let expectedTime = new Date(lastOTP).getTime() + 3 * 60 * 1000;
        if(now >= expectedTime){
            await sendOTP()
        }else{
            return res.status(400).send({msg:"You should wait 3 minutes before requesting a new code"})
        }
    }

  });

authRouter.post('/passwordReset', async (req, res) => {
    const {body:{code,password},session:{email,otp}} = req
    if (code === otp) {
        const hashedPass = passHashing(password);
        await prisma.user.update(
            {
                where:{email},
                data:{password:hashedPass}
            });
        res.sendStatus(200);
    }else{
        res.status(400).json({message:"Invalid code"})
    }
})

export default authRouter