import { Router } from "express";
import {
  addOrderItem,
  PayOrder,
  removeOrderItem,
  ChechOut,
  UpdateOrderState,
  addCustomOrder,
  AddOrderPhone,
  DeleteOrderItem,
  cancelUserOrder,
} from "../DBOperations/OrderManagment.mjs";
import {
  getuserOrder,
  getUserOrdersWithDetails,
} from "../DBOperations/Gitters.mjs";
import { productQuantityValidation } from "../utils/validation.mjs";
import { validationResult, matchedData } from "express-validator";
import { authorizedOnly } from "../utils/AccessControle.mjs";
const ordersManager = Router();

ordersManager.patch(
  "/addToCart/:id",
  productQuantityValidation,
  async (req, res) => {
    const errors = validationResult(req);
    const data = matchedData(req);

    if (!errors.isEmpty()) {
      return res.status(400).send("Can't send a negative data");
    }

    const { quantity } = data;
    // console.log(quantity)
    try {
      const {
        params: { id },
      } = req;
      if (req.isAuthenticated()) {
        const session = req.session;
        await addOrderItem(id, session, req.user.id, true, quantity);
        return res.status(200).send("item added");
      }
      //id authorized search for order object with user id
      if (!req.isAuthenticated()) {
        await addOrderItem(id, req.session, null, false, quantity);
        return res.status(200).send("item added");
      }
    } catch (err) {
      console.error(err);
      res.status(400).send("couldn't add item to cart");
    }
  }
);

ordersManager.patch("/removeFromCart/:id", async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    await removeOrderItem(id, req.session);
    return res.status(200).send("item removed");
  } catch (err) {
    console.error(err);
    res.status(400).send("couldn't remove item from cart");
  }
});

ordersManager.patch("/deleteItem/:id", async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    await DeleteOrderItem(id, req.session);
    return res.status(200).send("item deleted");
  } catch (err) {
    console.error(err);
    res.status(400).send("couldn't delete item from cart");
  }
});

ordersManager.post("/checkout", async (req, res) => {
  try {
    // console.log(req.body);

    let {
      body: { name, address, date, paymentMethod, phone, notes },
    } = req;

    const orderId = req.session.orderId;
    const userId = req.user.id;
    date = new Date(date);
    // console.log(`${orderId} ${date} ${userId} ${name} ${address}`)
    phone.forEach(async (ph) => {
      await AddOrderPhone(orderId, ph);
    });
    await ChechOut(orderId, date, userId, name, address, notes);

    delete req.session.orderId;
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.status(400).send("couldn't checkout");
  }
});

ordersManager.patch("/orderDone/:ordeId", async (req, res) => {
  try {
    const done = true;
    const {
      params: { ordeId },
    } = req;
    await UpdateOrderState(ordeId, done);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while change the Order status");
  }
});

ordersManager.patch("/orderCanceled/:ordeId", async (req, res) => {
  try {
    const done = false;
    const {
      params: { ordeId },
    } = req;
    await UpdateOrderState(ordeId, done);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while change the Order status");
  }
});

ordersManager.patch("/orderPayed/:ordeId", async (req, res) => {
  try {
    const {
      params: { ordeId },
    } = req;
    await PayOrder(ordeId);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while change the Order status");
  }
});

// Customer: get all their orders (active + past)
ordersManager.get("/my-orders", authorizedOnly, async (req, res) => {
  try {
    const orders = await getUserOrdersWithDetails(req.user.id);
    const activeOrders = [];
    const pastOrders = [];

    if (orders && Array.isArray(orders)) {
      orders.forEach((order) => {
        if (
          order.orderStatus === "COMPLETED" ||
          order.orderStatus === "CANCELED"
        ) {
          pastOrders.push(order);
        } else {
          activeOrders.push(order);
        }
      });
    }

    res.json({ activeOrders, pastOrders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Couldn't load your orders");
  }
});

// Customer: cancel own order if still cancellable
ordersManager.patch(
  "/cancelMyOrder/:ordeId",
  authorizedOnly,
  async (req, res) => {
    try {
      const {
        params: { ordeId },
      } = req;

      const result = await cancelUserOrder(ordeId, req.user.id);

      if (result === "NOT_FOUND") {
        return res.status(404).send("Order not found");
      }
      if (result === "NOT_OWNER") {
        return res.status(403).send("You can't cancel this order");
      }
      if (result === "NOT_CANCELLABLE") {
        return res.status(400).send("Order is no longer cancellable");
      }
      if (result === "ERROR") {
        return res.status(500).send("Error while cancelling the order");
      }

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error while cancelling the order");
    }
  }
);

ordersManager.post("/customOrder", async (req, res) => {
  try {
    const {
      body: { details, prodId },
    } = req;
    // console.log(details,prodId);
    if (req.isAuthenticated()) {
      const session = req.session;
      await addCustomOrder(prodId, details, req.session, req.user.id, true);
      return res.status(200).send("Authorized user item added");
    }
    //id authorized search for order object with user id
    if (!req.isAuthenticated()) {
      await addCustomOrder(prodId, details, req.session, null, false);
      return res.status(200).send("Unauthorized user item adding");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while adding the Sharebox");
  }
});

export default ordersManager;
