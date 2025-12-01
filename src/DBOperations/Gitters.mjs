import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export async function getAllProducts() {
    try{
        const products = await prisma.product.findMany()
        return products
    }catch(err){console.log(err)}
}

export async function getProductbyId(prodID) {
    try{
        const theProduct = await prisma.product.findUnique({
            where:{id:prodID},
            include:{category:true}
        })

        return theProduct
    }catch(err){console.log(err)}
}

export async function getAllCategories() {
    try{
        const categories = await prisma.category.findMany()
        return categories
    }catch(err){console.log(err)}
}

export async function getCategoryById(catId) {
    try{
        const categoryInfo = await prisma.category.findUnique({
            where:{id:parseInt(catId)}
        })
        return categoryInfo
    }catch(err){
        console.log(err)
    }
}

export async function getWorkingDays() {
    try{
        const days = await prisma.workDays.findFirst()
        if(days){
        const daysList = days.workingDays.split(",")
        return daysList
        }
        else return null
    }catch(err){
        console.log(err)
    }
}

export async function getcategoryInfo(catId) {
    try{
        const category = await prisma.category.findUnique({
            where:{id:catId}
        })
        // console.log(category)
        return category
    }catch(err){console.log(err)}
}

export async function getProductInfo(prodId) {
    try{
        const product = await prisma.product.findUnique({
            where:{id:prodId}
        })
        // console.log(product)
        return product
    }catch(err){console.log(err)}
}

export async function getCategoryWithProducts() {
    try{
        const catWithProds = await prisma.category.findMany({
            include:{products:true}
        })
        // console.log(catWithProds)
        return catWithProds
    }catch(err){console.log(err)}
}

export async function getUniqueCategoryWithProducts(catId) {
    try{
    const catWithProds = await prisma.category.findUnique({
        where:{id:parseInt(catId)},
        include:{products:true}
    })
    // console.log(catWithProds)
    return catWithProds
}catch(err){
    console.log(err)
}
}

export async function getOrderItems(orderId) {
    try{
        const OrderItems = await prisma.order.findFirst({
            where:{id:orderId,orderStatus:"PENDING"},
            include:{orderItems:true}
        })
        return OrderItems
    }catch(err){console.log(err)}
}

export async function getOrderWithItemsAndProductInfo(orderId) {
    try{
        const OrderItemsProducts = await prisma.order.findUnique({
            where:{id:orderId,orderStatus:"PENDING"},
            include:{
                orderItems:{
                    include:{
                        product:true,
                    },
                },
            },
        });
        return OrderItemsProducts
    }catch(err){console.log(err)}
}


export async function getuserOrder(id) {
    try{
        const order = await prisma.order.findFirst({
            where:{
                userId:id,
                orderStatus:"PENDING"
            }
        })
        if(order) return order
        else return null
    }catch(err){console.log(err)}
}

export async function getUserInfo(id) {
    try{
        const user = await prisma.user.findUnique({where:{id:id}})
        return user
    }catch(err){console.log(err)}
}


export async function getPendingDeliveryOrders() {
    try{
        const orders = await prisma.order.findMany({
            where: {
                orderStatus:"PENDING_DELIVERY",
            },
            include:{
                user:true,
                orderItems:{include:{product:{include:{category:true}}}},
                orderPhones:true
            }
        });
        return orders;
    }catch(err){console.log(err);}
}

export async function getOrderHistory() {
    try{
    const orders = await prisma.order.findMany({
        where:{
            orderStatus:{
                in:["COMPLETED","CANCELED"],
            },
        },
        include:{
            user:{
                select:{
                    name:true,
                    phone:true,
                    address:true,
                    redFlags:true
                }
            },
            orderItems:{
                include:{
                    product:true
                }
            },
            orderPhones:true
        }
    });
    return orders;
    }catch(err){console.log(err);}
}

export async function getActiveSales() {
    try{
        const sales = await prisma.sales.findMany({
            where:{isActive:true},
            include:{products:true}
        })
        return sales
    }catch(err){console.log(err)}
}

// Get all orders for a specific user with items, products, and phones
export async function getUserOrdersWithDetails(userId) {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: userId,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                orderPhones: true,
            },
            orderBy: {
                id: "desc",
            },
        });
        return orders;
    } catch (err) {
        console.log(err);
    }
}
