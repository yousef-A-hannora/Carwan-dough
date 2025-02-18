import { Router } from "express";
import {addOrderItem,PayOrder,removeOrderItem,ChechOut,UpdateOrderState,addCustomOrder,AddOrderPhone,DeleteOrderItem} from "../DBOperations/OrderManagment.mjs"
import { getuserOrder } from "../DBOperations/Gitters.mjs";
import {productQuantityValidation} from "../utils/validation.mjs"
import {validationResult,matchedData} from "express-validator"
const ordersManager = Router()

ordersManager.patch("/addToCart/:id",productQuantityValidation,async (req,res)=>{
    const errors = validationResult(req)
    const data = matchedData(req)

    if(!errors.isEmpty()) {return res.status(400).send("Can't send a negative data")}
    
    const {quantity}=data
    // console.log(quantity)
    try{
        const {params:{id}} = req
        if(req.isAuthenticated()){
            const session = req.session
            await addOrderItem(id,session,req.user.id,true,quantity);
            return res.status(200).send("item added");
        }
        //id authorized search for order object with user id
        if(!req.isAuthenticated()){
            await addOrderItem(id,req.session,null,false,quantity);
            return res.status(200).send("item added");
        }

    }catch(err){console.error(err);res.status(400).send("couldn't add item to cart")}
})

ordersManager.patch("/removeFromCart/:id", async (req,res)=>{
    try{
        const {params:{id}} = req
        await removeOrderItem(id,req.session);
        return res.status(200).send("item removed");
    }catch(err){console.error(err);res.status(400).send("couldn't remove item from cart")}
})

ordersManager.patch("/deleteItem/:id", async (req,res)=>{
    try{
        const {params:{id}} = req
        await DeleteOrderItem(id,req.session);
        return res.status(200).send("item deleted");
    }catch(err){console.error(err);res.status(400).send("couldn't delete item from cart")}
})

ordersManager.post("/checkout", async (req,res)=>{
    try{
        // console.log(req.body);
        
        let {body:{name,address,date,paymentMethod,phone,notes}} = req
        
        const orderId = req.session.orderId;
        const userId = req.user.id;
        date = new Date(date);
        // console.log(`${orderId} ${date} ${userId} ${name} ${address}`)
        phone.forEach(async (ph) => {
            await AddOrderPhone(orderId,ph);
        });
        await ChechOut(orderId,date,userId,name,address,notes);

        delete(req.session.orderId)
        res.sendStatus(200);
    }catch(err){console.log(err);return res.status(400).send("couldn't checkout")}
})

ordersManager.patch("/orderDone/:ordeId",async (req,res)=>{
    try{
        const done=true
        const {params:{ordeId}} = req
        await UpdateOrderState(ordeId,done)
        res.sendStatus(200)
    }catch(err){console.log(err);res.status(500).send("Error while change the Order status")}
})

ordersManager.patch("/orderCanceled/:ordeId",async (req,res)=>{
    try{
        const done=false
        const {params:{ordeId}} = req
        await UpdateOrderState(ordeId,done)
        res.sendStatus(200)
    }catch(err){console.log(err);res.status(500).send("Error while change the Order status")}
})

ordersManager.patch("/orderPayed/:ordeId",async (req,res)=>{
    try{
        const {params:{ordeId}} = req
        await PayOrder(ordeId)
        res.sendStatus(200)
    }catch(err){console.log(err);res.status(500).send("Error while change the Order status")}
})

ordersManager.post("/customOrder",async (req,res)=>{
    try{   
        const {body:{details,prodId}} = req;
        // console.log(details,prodId);
        if(req.isAuthenticated()){
            const session = req.session
            await addCustomOrder(prodId,details,req.session,req.user.id,true);
            return res.status(200).send("Authorized user item added");
        }
        //id authorized search for order object with user id
        if(!req.isAuthenticated()){
            await addCustomOrder(prodId,details,req.session,null,false);
            return res.status(200).send("Unauthorized user item adding");
        }
    }catch(err){console.log(err);res.status(500).send("Error while adding the Sharebox")}
})


export default ordersManager