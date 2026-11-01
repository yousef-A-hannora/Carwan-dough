import { Router } from "express";
import {getCategoryWithProducts,getUniqueCategoryWithProducts,getProductbyId,getOrderItems,getUserInfo,getOrderWithItemsAndProductInfo,getWorkingDays} from "../DBOperations/Gitters.mjs"
import {orderTotalCount} from "../DBOperations/OrderManagment.mjs"
import { authorizedOnly } from "../utils/AccessControle.mjs";
import {UpdateSessionOrder} from "../utils/middleWares.mjs"

const customerRenderRouter = Router()
customerRenderRouter.use(UpdateSessionOrder)
//---------------------User pages--------------------
customerRenderRouter.get(["/","/home"],async (req, res) => {
    try{
        let username
        let auth=false;
        if(req.isAuthenticated()){ 
            auth=true
            username=req.user.name
        }
        const CatWProds = await getCategoryWithProducts()
        res.render('home',{CWP:CatWProds,isAuth:auth,username:username});
    }catch(err){return res.status(400).send("Error happened try again")}
});


customerRenderRouter.get("/cart",authorizedOnly, async (req, res) => {
    try{
        let orederWitems=null
        if(req.session.orderId){
            await orderTotalCount(req.session.orderId)
            orederWitems = await getOrderWithItemsAndProductInfo(req.session.orderId)
        }
        const user = await getUserInfo(req.user.id)
        const workingDays = await getWorkingDays()
        res.render('cart',{user:user,OWI:orederWitems,workingDays:JSON.stringify(workingDays),isAuth:true,username:req.user.name});
        
    }catch(err){console.log(err);res.status(400).send("err while loading you cart, trw again")}
    
});

customerRenderRouter.get("/product-info/:prodId",async (req, res) => {
    try{
        let username
        let auth=false;
        if(req.isAuthenticated()){ 
            auth=true
            username=req.user.name
        }
        const {params:{prodId}} = req
        const product = await getProductbyId(parseInt(prodId))
        let CatWProds
        if(product.customeInfo){
            const {items,itemsCat} = product.customeInfo

            CatWProds = await getUniqueCategoryWithProducts(itemsCat)
            // console.log(items,itemsCat,CatWProds)
        }
        res.render('product-info',{product:product,isAuth:auth,CWP:CatWProds,username:username});
    }catch(err){return res.status(400).send("Error happened try again")}
});

customerRenderRouter.get("/CategoryProducts/:catId", async (req, res) => {
    try{
        let username
        let auth=false;
        if(req.isAuthenticated()){ 
            auth=true
            username=req.user.name
        }
        const {params:{catId}} = req
        let OrderWitems = null
        if(req.session.orderId){
            OrderWitems = await getOrderItems(req.session.orderId)
            
            OrderWitems = Buffer.from(JSON.stringify(OrderWitems)).toString('base64');
        }

        const catWprods = await getUniqueCategoryWithProducts(catId)
    
        res.render('CategoryProducts',{CWP:catWprods,OWI:OrderWitems,isAuth:auth,username:username});
    }catch(err){return res.status(400).send("Error happened try again")}
});

customerRenderRouter.get("/signup", (req, res) => {
    res.render('signup');
});

customerRenderRouter.get("/login", (req, res) => {
    res.render('login');
});

customerRenderRouter.get("/OTP",(req,res)=>{
    res.render('OTP');
})

customerRenderRouter.get("/forgetPass",(req,res)=>{
    res.render('forgetPass');
})

customerRenderRouter.get("/OTP-pass",(req,res)=>{
    res.render('OTP-passReset');
})

customerRenderRouter.get("/APGDXKgwqbyJ3hj6Lxctda9Rspv72SNWrQmVf5Hu4Y8EeTBFCk/adminLogin",(req,res)=>{
    if(req.isAuthenticated() && req.user.role === "ADMIN"){
        res.redirect("/content")
    }
    res.render('adminLogin')
})

export default customerRenderRouter;