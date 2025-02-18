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

const AdminRenderRouter = Router();

//---------------------Admin pages--------------------
// AdminRenderRouter.use(adminOnly)
AdminRenderRouter.get("/content", async (req, res) => {
  const categories = await getAllCategories();
  const CategoryAndProducts = await getCategoryWithProducts();
  const workingDays = await getWorkingDays();
  const data = {
    cats: categories,
    catsWithProds: CategoryAndProducts,
    workdays: workingDays,
  };
  res.render("content", data);
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
  const categories = await getAllCategories();
  const product = await getProductbyId(parseInt(req.params["id"]));
  res.render("edit-product", { product: product, cats: categories });
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
