import { PrismaClient } from '@prisma/client';
import { getOrderItems, getuserOrder } from './Gitters.mjs';
const prisma = new PrismaClient()


export async function addOrderItem(prodId,session,userId,auth,quantity) {
    prodId = parseInt(prodId)
    quantity = quantity || 1
    try{
        //if user has no order (orderId in session in null)
        if(!session.orderId){

            //check if user authorized or not
            let order
            if(auth){
                const HasOrder = await getuserOrder(userId);
                if(! HasOrder){
                    order = await prisma.order.create({
                        data:{userId:userId}
                    });
                    session.orderId = order.id
                }
                else{
                    session.orderId = HasOrder.id
                }
            }else{
                //create a new order using sessionId
                order = await prisma.order.create({
                    data:{sessionId:session.id}
                });
                session.orderId = order.id;
            }
            //update session with new order id

        }
        //check if item existx already
        const orderItem = await prisma.orderItem.findFirst({
            where:{
                AND:[
                    {orderId:session.orderId},
                    {productId:prodId}
                ]
            }
        })
        //check if user this product in the cart(session products[]) already
        if(orderItem){
            //increment the orderItem by 1
            await prisma.orderItem.update({
                where:{id:orderItem.id},
                data:{
                    quantity:{
                        increment:parseInt(quantity)
                    }
                }
            })
        }else{
        //create OrderItem to User's Order in the DataBase
        const orderItem = await prisma.orderItem.create({
            data: {
                orderId: session.orderId,
                productId: prodId,
                price: (await prisma.product.findUnique({ where: { id: prodId } })).current_price,
                quantity:parseInt(quantity)
            },
        });
    }
    }catch(err){console.log(err)}
}


export async function removeOrderItem(prodId,session) {
    prodId = parseInt(prodId)
    try{
        //if user has no order (orderId in session in null)
        if(session.orderId){
            //find the item
            const orderItem = await prisma.orderItem.findFirst({
                where:{
                    AND:[
                        {orderId:session.orderId},
                        {productId:prodId}
                    ]
                }
            })
            //check if user authorized or not
            let order
            if(orderItem){
                if( orderItem.quantity >1){
                    await prisma.orderItem.update({
                        where:{id:orderItem.id},
                        data:{
                            quantity:{
                                decrement:1
                            }
                        }
                    })
                }else{
                    await prisma.orderItem.delete({
                        where: { id: orderItem.id }
                    })
                }
            }
        }

    }catch(err){console.log(err)}
}

export async function DeleteOrderItem(prodId,session) {
    prodId = parseInt(prodId)
    try{
        //if user has no order (orderId in session in null)
        if(session.orderId){
            //find the item
            const orderItem = await prisma.orderItem.findFirst({
                where:{
                    AND:[
                        {orderId:session.orderId},
                        {productId:prodId}
                    ]
                }
            })
            //check if user authorized or not
            if(orderItem){
                    await prisma.orderItem.delete({
                        where: { id: orderItem.id }
                    })
            }
        }
    }catch(err){console.log(err)}
}


export async function updateOrderOwner(orderId,userId) {
    await prisma.order.update({
        where: { id: orderId },
        data: {
            userId: userId,
            sessionId:null
        }
    })
}

export async function orderTotalCount(id) {
    try{
        const order = await getOrderItems(id)
        let total = 0
        order.orderItems.forEach((item)=>{
            total += item.price * item.quantity
        })
        await prisma.order.update({
            where: { id: id },
            data:{
                totalPrice:total
            }
        })
    }catch(err){console.log(err)}
}

export async function UpdateUserInfo(id,address) {
    try{
        await prisma.user.update({
            where:{id:id},
            data:{
                address:address,
            }
        }); 
    }catch(err){console.log(err)}
}
export async function AddOrderPhone(orderId,phone){
    try{
        await prisma.phone.create({
            data:{
                OrderId:orderId,
                number:phone
            }
        })
    }catch(err){console.log(err)}
}
export async function ChechOut(orderId,date,userId,userName,userAddress,notes) {
    try{
        await prisma.order.update({
            where:{id:orderId},
            data:{
                orderStatus:"PENDING_DELIVERY",
                deliveryDate:date,
                address:userAddress,
                OrderRecevername:userName,
                OrderNotes:notes,
            }
        }); 
        await UpdateUserInfo(userId,userAddress)
    }catch(err){console.log(err); return false}
}


export async function UpdateOrderState(orderId,done){
    orderId = parseInt(orderId)
    try{
        if(done){
            await prisma.order.update({
                where:{id:orderId},
                data:{orderStatus:"COMPLETED"}
            })
        }else{
            await prisma.order.update({
                where:{id:orderId},
                data:{orderStatus:"CANCELED"}
            })
            const order = await prisma.order.findUnique({where:{id:orderId}})

            await prisma.user.update({
                where:{id:order.userId},
                data:{
                    redFlags:{
                        increment:1
                    }
                }
            })
        }
    }catch(err){console.log(err)}
}

export async function PayOrder(orderId){
    orderId = parseInt(orderId)
    try{
        await prisma.order.update({
            where:{id:orderId},
            data:{paymentStatus:"PAID"}
        })
    }catch(err){console.log(err)}
}

export async function addCustomOrder(prodId,details,session,userId,auth){
    prodId = parseInt(prodId)
    try{
        //if user has no order (orderId in session in null)
        if(!session.orderId){

            //check if user authorized or not
            let order
            if(auth){
                const HasOrder = await getuserOrder(userId);
                if(! HasOrder){
                    order = await prisma.order.create({
                        data:{userId:userId}
                    });
                    session.orderId = order.id
                }
                else{
                    session.orderId = HasOrder.id
                }
            }else{
                //create a new order using sessionId
                order = await prisma.order.create({
                    data:{sessionId:session.id}
                });
                session.orderId = order.id;
            }
            //update session with new order id

        }
        //check if user this product in the cart(session products[]) already

        //create OrderItem to User's Order in the DataBase
        const orderItem = await prisma.orderItem.create({
            data: {
                orderId: session.orderId,
                productId: prodId,
                price: (await prisma.product.findUnique({ where: { id: prodId } })).price,
                notes:details
            },
        });
    }catch(err){console.log(err)}
}