import {getuserOrder} from "../DBOperations/Gitters.mjs"

//if session has owt dated orderId or dosn't has it will be updated with the current ongoing order id
//will be used in renderCustomer Router
export const UpdateSessionOrder = async (req,res,next)=>{
    if(req.isAuthenticated()){
        const order = await getuserOrder(req.user.id);
        if(order) req.session.orderId = order.id;
        else{ 
            if(req.session.orderId) delete(req.session.orderId);
        }
    }
    next();
}