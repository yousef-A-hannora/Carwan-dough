import { PrismaClient } from '@prisma/client';
import { getActiveSales } from './Gitters.mjs';
import { startOfDay, isWithinInterval, isBefore } from 'date-fns'

const prisma = new PrismaClient()

export async function addSaleToProduct(saleId,products) {
try{
    await prisma.product.updateMany({
        where:{
            id:{
                in:products,
            },
        },
        data:{
            saleId:saleId,
        }
    })
}catch(err){console.error(err)}
}

export async function createSale(value,startDate,endDate,products) {
try{
    const sale = await prisma.sales.create({
        data:{
            salesPrecentage:value,
            startDate:startDate,
            endDate:endDate,
        }
    })
    await addSaleToProduct(sale.id,products)
}catch(err){console.error(err)}
}

export async function removeSales(saleId) {
    try{
        await prisma.sales.delete({
            where:{id:saleId}
        });
    }catch(err){console.error(err)}
}

export async function applySale(sale) {
    try{
        const saleValue = sale.salesPrecentage
        sale.products.forEach(async product => {
            await prisma.product.update({
                where:{id:product.id},
                data:{
                    current_price:Math.ceil((product.price-(product.price*saleValue)/100))
                }
            })
        }); 
    }catch(err){console.error(err)}
}

export async function deactivateSale(saleId) {
    try{
        await prisma.sales.update({
            where:{id:saleId},
            data:{isActive:false}
        })
    }catch(err){console.error(err)}
}

export async function updateCurrentPriceForAllProducts() {
    try {
        const result = await prisma.$executeRaw`
        UPDATE Product
        SET current_price = price;
        `;
        } catch (error) {
        console.error('Error updating products:', error);
        } 
    }


export async function SlaesWorker() {
    
    updateCurrentPriceForAllProducts()
    console.log("cron-job run...");

    const sales = await getActiveSales();
    const currentDate = startOfDay(new Date());
    
    for (const sale of sales) {
        try {
        const startDate = startOfDay(new Date(sale.startDate));
        const endDate = startOfDay(new Date(sale.endDate));
    
        if (isWithinInterval(currentDate, { start: startDate, end: endDate })) {
            await applySale(sale);
        } else if (isBefore(endDate, currentDate)) {
            await deactivateSale(sale.id);
        }
        } catch (error) {
        console.error(`Error processing sale ID ${sale.id}:`, error);
        }
    }
}
