import { Router } from "express";
import {createSale,removeSales} from "../DBOperations/SalesAndCopons.mjs"

const SalesRouter = Router()

SalesRouter.post("/addSale",async (req,res)=>{
    try{
        let {body:{endDate,products,salePercentage,startDate}}=req
        endDate = new Date(endDate);
        startDate = new Date(startDate);
        salePercentage = parseInt(salePercentage)
        products = products.map((product)=>{
            return Number(product)
        })
        await createSale(salePercentage,startDate,endDate,products);
        // console.log({endDate,products,salePercentage,startDate});
        res.sendStatus(200);
    }catch(err){console.error(err)}
})

SalesRouter.post("/deleteSale/:id",async (req,res)=>{
    try{
        let {params:{id}}=req;
        id = parseInt(id);
        await removeSales(id)
        res.sendStatus(200);
    }catch(err){console.error(err)}
})
export default SalesRouter;