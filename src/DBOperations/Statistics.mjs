import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

export async function getAllUsers() {
    try{
        const users = await prisma.user.findMany({
            select:{
                id:true,
                name:true,
                phone:true,
                address:true,
                redFlags:true,
                orders:{
                    select:{
                        totalPrice:true,
                        orderStatus:true,
                    }
                }
            },
        })
        return users
    }catch(err){console.log(err)}
}

export async function getUsersByDate(from,to) {
    let users
    try{
        if(from )from = new Date(from)
        if(to) to = new Date(to)
        // console.log(from)
        // console.log(to)
        if(!from && !to){
            users = await getAllUsers()
        }else if(from && to){
            users = await prisma.user.findMany({
                where:{
                    creatingDate:{
                        gte:from,
                        lte:to
                    },
                },
                select:{
                    id:true,
                    name:true,
                    phone:true,
                    address:true,
                    redFlags:true,
                    orders:{
                        select:{
                            totalPrice:true,
                            orderStatus:true,
                        }
                    }
                },
            });
        }
        else if(from){
            users = await prisma.user.findMany({
                where:{
                    creatingDate:{
                        gte:from,
                    },
                },
                select:{
                    id:true,
                    name:true,
                    phone:true,
                    address:true,
                    redFlags:true,
                    orders:{
                        select:{
                            totalPrice:true,
                            orderStatus:true,
                        }
                    }
                },
            });
        }
        else{
            users = await prisma.user.findMany({
                where:{
                    creatingDate:{
                        lte:to
                    },
                },
                select:{
                    id:true,
                    name:true,
                    phone:true,
                    address:true,
                    redFlags:true,
                    orders:{
                        select:{
                            totalPrice:true,
                            orderStatus:true,
                        }
                    }
                },
            });
        }
        // console.log(users)
        return users;
    }catch(err){console.log(err)}
}

export async function getOrdersByDate(from,to) {
    let orders
    try{
        if(from )from = new Date(from)
        if(to) to = new Date(to)
        // console.log(from)
        // console.log(to)
        if(!from && !to){
            orders = await prisma.order.findMany({
                where:{
                    deliveryDate:{
                        gte:from,
                        lte:to
                    },
                },
                select:{
                    totalPrice:true,
                    orderStatus:true,
                    orderItems:{
                        include:{product:true}
                    },                
                }
            });
        }else if(from && to){
            orders = await prisma.order.findMany({
                where:{
                    deliveryDate:{
                        gte:from,
                        lte:to
                    },
                },
                select:{
                    totalPrice:true,
                    orderStatus:true,
                    orderItems:{
                        include:{product:true}
                    },                
                }
            });
        }
        else if(from){
            orders = await prisma.order.findMany({
                where:{
                    deliveryDate:{
                        gte:from,
                        lte:to
                    },
                },
                select:{
                    totalPrice:true,
                    orderStatus:true,
                    orderItems:{
                        include:{product:true}
                    },                
                }
            });
        }
        else{
            orders = await prisma.order.findMany({
                where:{
                    deliveryDate:{
                        gte:from,
                        lte:to
                    },
                },
                select:{
                    totalPrice:true,
                    orderStatus:true,
                    orderItems:{
                        include:{product:true}
                    },
                }
            });
        }
        return orders;
    }catch(err){console.log(err)}
}

export async function usersAnalysis(from,to){
    try{
    const users = await getUsersByDate(from,to);
    for (const user of users) {
        let doneOrders = 0;
        let canceledOrders = 0;
        let total = 0;
        user.orders.forEach(order=>{
            if(order.orderStatus==="COMPLETED"){
                total+=order.totalPrice;
                doneOrders++;
            }
            if(order.orderStatus==="CANCELED"){
                canceledOrders++;
            }
        })
        user.done = doneOrders;
        user.canceled = canceledOrders;
        user.total = total;
    }
    return users;
}catch(err){console.error(err)}
}

export async function ordersAnalysis(from,to) {
    try{
        const orders = await getOrdersByDate(from,to)

        let totalDone = 0
        let totalCanceled = 0
        let totalEarning = 0
        const productsCounts = {}
        // console.log(JSON.stringify(orders))
        for (const order of orders) {
            if(order.orderStatus === "CANCELED") totalCanceled++;
            else if(order.orderStatus === "COMPLETED"){
                totalDone++;
                totalEarning += order.totalPrice;
                order.orderItems.forEach((item)=>{
                    if(!productsCounts[item.product.name]) productsCounts[item.product.name]=0;
                    // if(item.product.name == "Box16 donuts") console.log()
                    productsCounts[item.product.name] += parseInt(item.quantity); 
                })
            }
        }
        return [totalDone,totalCanceled,totalEarning,productsCounts];
    }catch(err){console.error(err)}
}