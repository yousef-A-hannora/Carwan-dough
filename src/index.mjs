import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import {usersStratigy,adminStratigy} from "./utils/Strategies.mjs"
import cron from "node-cron"
import {adminOnly} from "./utils/AccessControle.mjs"
import {SlaesWorker} from "./DBOperations/SalesAndCopons.mjs"
import helmet from "helmet";
import xss from "xss-clean";

  //|-------------------------------------------------------------------|
  //|_________________________ Routers import __________________________|
  //|-------------------------------------------------------------------|

import authRouter from "./routers/auth.mjs";
import customerRenderRouter from "./routers/renderCustomer.mjs";
import AdminRenderRouter from "./routers/renderAdmin.mjs";
import contentRouter from "./routers/contentRouter.mjs";
import ordersManager from "./routers/ordersManager.mjs";
import userOperationsRouter from "./routers/userManager.mjs"
import SalesRouter from "./routers/salesAndCopons.mjs";

  //|-------------------------------------------------------------------|
  //|________________________    Constants   ___________________________|
  //|-------------------------------------------------------------------|
dotenv.config();

const client = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url); // Get the current file name
const __dirname = path.dirname(__filename); // Get the current directory name



  //|-------------------------------------------------------------------|
  //|__________________________  Middlewares  __________________________|
  //|-------------------------------------------------------------------|

app.use(cors())
app.use(express.json());
// app.use(helmet());
// app.use(xss());
app.use(
  session({
    cookie: {
     maxAge: 7000 * 24 * 60 * 60 * 1000, // valed for 7000 days
    //  secure: process.env.NODE_ENV === "production", // Only send over HTTPS
    //  httpOnly: true, // Prevent client-side access
    //  sameSite: "strict", // Protect against CSRF attacks
    },
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      client,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user,done)=>{
  done(null,user.id);
})

passport.deserializeUser(async (id,done)=>{
  const user = await client.user.findUnique({where:{id:id}});
  done(null,user);
})

  //|-------------------------------------------------------------------|
  //|________________________  EJS Static files   ______________________|
  //|-------------------------------------------------------------------|

app.use(express.static(path.join(__dirname, '../frontPages/public')));
app.use('/css', express.static(path.join(__dirname, '../frontPages/public/css')));
app.use('/fonts', express.static(path.join(__dirname, '../frontPages/public/fonts')));
app.use('/imgs', express.static(path.join(__dirname, '../frontPages/public/imgs')));
app.use('/JS', express.static(path.join(__dirname, '../frontPages/public/JS')));
app.use('/videos', express.static(path.join(__dirname, '../frontPages/public/videos')));
// Rendering Engine and Views

app.set('views', path.join(__dirname, '../frontPages/views'));
app.set('view engine', 'ejs');

  //|-------------------------------------------------------------------|
  //|______________________ Endpoints Routers use ______________________|
  //|-------------------------------------------------------------------|

app.use("/api/auth", authRouter);
app.use("/api/admin/content",adminOnly,contentRouter)
app.use("/api/user/order",ordersManager)
app.use("/api/user/operations",userOperationsRouter)
app.use("/api/admin/sales",SalesRouter)
  //|-------------------------------------------------------------------|
  //|_____________________  rendering Routers   ________________________|
  //|-------------------------------------------------------------------|

app.use(customerRenderRouter)
app.use(AdminRenderRouter)
// app.use(adminOnly,AdminRenderRouter)


  //|-------------------------------------------------------------------|
  //|_______________________    cron-Jops    ________________________|
  //|-------------------------------------------------------------------|
  
  cron.schedule("0 * * * *", async ()=>{ await SlaesWorker();} );
  

  //|-------------------------------------------------------------------|
  //|_______________________    Start Server    ________________________|
  //|-------------------------------------------------------------------|

app.post("/testWA", async (req,res)=>{
  const {body:{phone,message}} = req
  try{
  
  res.send(WA)
  }catch(err){
    res.status(400).send(err)
  }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});