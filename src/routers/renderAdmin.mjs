import { Router } from "express";
import {
  getAllCategories,
  getCategoryWithProducts,
  getWorkingDays,
  getProductbyId,
  getCategoryById,
  getPendingDeliveryOrders,
  getOrderHistory,
  getAllProducts,
  getActiveSales,
} from "../DBOperations/Gitters.mjs";

import { usersAnalysis,ordersAnalysis } from "../DBOperations/Statistics.mjs";
import { PrismaClient } from "@prisma/client";

const AdminRenderRouter = Router();
const prisma = new PrismaClient();
//---------------------Admin pages--------------------
// AdminRenderRouter.use(adminOnly)
AdminRenderRouter.get("/content", async (req, res) => {
  try {
    const categories = await getAllCategories();
    const CategoryAndProducts = await getCategoryWithProducts();
    const workingDays = await getWorkingDays();

    // ✅ Fetch all products for bundle modal
    const products = await prisma.product.findMany({
      where: { deleted: false }
    });

    const data = {
      cats: categories,
      catsWithProds: CategoryAndProducts,
      workdays: workingDays,
      products, // ✅ send to EJS
    };

    res.render("content", data);
  } catch (err) {
    console.error("Error rendering /content:", err);
    res.status(500).send("Server Error");
  }
});


AdminRenderRouter.get("/analytics",async (req, res) => {
  try{
    let {query:{from,to}} = req;
    
    if(from && from.length == 0) from = undefined
    if(to && to.length == 0) to = undefined

    // console.log(`from: ${from}, to: ${to}`);
    const usersData = await usersAnalysis(from,to);
    let [totalDone,totalCanceled,totalEarning,productsCounts] = await ordersAnalysis(from,to);

    res.render("analytics",{users:usersData,done:totalDone,canceled:totalCanceled,earning:totalEarning,products:Buffer.from(JSON.stringify(productsCounts)).toString('base64')}); 
    
    
}catch(err){console.log(err)}
});

AdminRenderRouter.get("/edit-category/:id", async (req, res) => {
  const category = await getCategoryById(req.params["id"]);
  res.render("edit-category", { cat: category });
});

AdminRenderRouter.get("/edit-product/:id", async (req, res) => {
  const productId = parseInt(req.params.id);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true
    }
  });

  const categories = await getAllCategories();

  // Load all active products to list bundle choices
  const allProducts = await prisma.product.findMany({
    where: { isActive: true, deleted: false },
    select: { id: true, name: true }
  });

  res.render("edit-product", {
    product: product,
    cats: categories,
    allProducts: allProducts
  });
});

AdminRenderRouter.get("/orders", async (req, res) => {
  try {
    const orders = await getPendingDeliveryOrders();
    // console.log(JSON.stringify(orders))
    let orderForSummary = JSON.stringify(orders);
    orderForSummary = JSON.parse(orderForSummary);
    orderForSummary.forEach((order) => {
      delete order.user;
    });

    const ItemsForSammary = Buffer.from(JSON.stringify(orderForSummary)).toString('base64');
    
    res.render("orders", { orders: orders, summaryItems: ItemsForSammary });
    // return res.sendStatus(200)
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error happened while rendering");
  }
});

AdminRenderRouter.get("/order-history", async (req, res) => {
  try {
    const orders = await getOrderHistory();
     
    const ordersForFilter = Buffer.from(JSON.stringify(orders)).toString('base64');
    res.render("order-history",{orders:orders,ordersForFilter:ordersForFilter});    
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error happened while rendering");
  }
});


AdminRenderRouter.get("/sales", async (req, res) => {
  try {
    const products = await getAllProducts();
    const sales = await getActiveSales();
    res.render("sales",{products:products,sales:sales});    
  } catch (err) {
    console.error(err);
    return res.status(400).send("Error happened while rendering");
  }
});
export default AdminRenderRouter;
