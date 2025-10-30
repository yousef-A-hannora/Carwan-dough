import { Router } from "express";
import { unflageUser } from "../DBOperations/userOperations.mjs";

const userOperationsRouter = Router()


userOperationsRouter.patch("/unflage",async (req,res)=>{
    try{
        let {body:{id}} = req;
        id = parseInt(id)
        // console.log(req.body);
        await unflageUser(id);
        res.sendStatus(200);
    }catch(err){console.log(err);res.sendStatus(500);}
})

export default userOperationsRouter