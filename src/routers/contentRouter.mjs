import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import upload from "../utils/manage-uploads.mjs";
import fs from "node:fs";
import path from "node:path";
import { getCategoryById } from "../DBOperations/Gitters.mjs";

const prisma = new PrismaClient();

const contentRouter = Router();

contentRouter.post("/add-product", upload.any(), async (req, res) => {
  const {
    body: {
      Category,
      product_name,
      product_description,
      product_price,
      boxitems_number,
      box_type,
    },
  } = req;
  let ShareBoxData = null;
  const cat = await getCategoryById(Category);
  if (cat.name === "share boxs") {
    ShareBoxData = { items: boxitems_number, itemsCat: box_type };
  }
  // console.log(Category,product_name,product_description,product_price,boxitems_number,box_type)
  const productImage = req.files[0].filename;
  let productVideo = null;
  if (req.files[1]) {
    productVideo = req.files[1].filename;
  }
  try {
    const newProducts = await prisma.product.create({
      data: {
        name: product_name,
        description: product_description,
        price: parseFloat(product_price),
        current_price: parseFloat(product_price),
        categoryId: parseInt(Category),
        photo: productImage,
        video: productVideo,
        customeInfo: ShareBoxData,
      },
    });
    // console.log(newCategory);
    res.status(200).send("Product added successfully");
  } catch (err) {
    console.error("Error adding Product:", err);
    res.status(400).send("Failed to add Product");
  }
});

contentRouter.post("/add-category", upload.any(), async (req, res) => {
  const {
    body: { category_name },
  } = req;
  const categoryImage = req.files[0].filename;
  try {
    const newCategory = await prisma.category.create({
      data: {
        name: category_name,
        image: categoryImage,
      },
    });
    // console.log(newCategory);
    res.status(200).send("Category added successfully");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(400).send("Failed to add category");
  }
});

contentRouter.put("/edit-workdays", async (req, res) => {
  const { day } = req.body; // Destructure `day` directly
  const strDay = String(day);
  try {
    if (!day) {
      return res
        .status(400)
        .json({ error: "Invalid input. 'day' is required." });
    }

    // Check if a record exists
    const existingWorkdays = await prisma.workDays.findFirst();
    // console.log(existingWorkdays)
    if (existingWorkdays) {
      // Update the existing record
      await prisma.workDays.update({
        where: { id: existingWorkdays.id },
        data: { workingDays: strDay },
      });
    } else {
      // Create a new record
      await prisma.workDays.create({
        data: { workingDays: strDay },
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating workdays." });
  }
});

contentRouter.post("/edit-cetegory/", async (req, res) => {
  // console.log(req.body)
});

contentRouter.put(
  "/edit-product/",
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // console.log(req.body)
      //deleting the old image and video
      const {
        body: {
          Category,
          product_id,
          product_name,
          product_description,
          product_price,
        },
      } = req;
      const product = await prisma.product.findUnique({
        where: { id: parseInt(product_id) },
      });
      let productImage = product.photo;
      let productVideo = product.video;

      if (req.files.product_image) {
        if (
          fs.existsSync(
            path.join(
              process.cwd(),
              "/frontPages/public/products/images",
              productImage
            )
          )
        ) {
          fs.unlinkSync(
            path.join(
              process.cwd(),
              "/frontPages/public/products/images",
              productImage
            )
          );
        }
        productImage = req.files.product_image[0].filename;
      }
      if (req.files.product_video) {
        if (productVideo) {
          if (
            fs.existsSync(
              path.join(
                process.cwd(),
                "/frontPages/public/products/videos",
                productVideo
              )
            )
          )
            fs.unlinkSync(
              path.join(
                process.cwd(),
                "/frontPages/public/products/videos",
                productVideo
              )
            );
        }
        productVideo = req.files.product_video[0].filename;
      }
      //update the product
      await prisma.product.update({
        where: { id: parseInt(product_id) },
        data: {
          name: product_name,
          description: product_description,
          price: parseFloat(product_price),
          photo: productImage,
          video: productVideo,
          categoryId: parseInt(Category),
        },
      });
      res.status(200).send("product edited");
    } catch (err) {
      console.log(err);
      res.status(400);
    }
  }
);

contentRouter.put(
  "/edit-category",
  upload.fields([{ name: "category_image", maxCount: 1 }]),
  async (req, res) => {
    try {
      let {
        body: { category_id, category_name },
      } = req;
      category_id = parseInt(category_id);
      const oldCategory = await prisma.category.findUnique({
        where: { id: category_id },
      });

      if (!oldCategory) {
        return res.status(404).send("Category not found");
      }

      let CategoryImage = oldCategory.image;
      if (
        req.files &&
        req.files.category_image &&
        req.files.category_image.length > 0
      ) {
        const oldImagePath = path.join(
          process.cwd(),
          "/frontPages/public/products/images",
          CategoryImage
        );

        // Check if the old image file exists and delete it
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

        // Update the image name with the new uploaded file
        CategoryImage = req.files.category_image[0].filename;
      }

      await prisma.category.update({
        where: { id: category_id },
        data: {
          name: category_name,
          image: CategoryImage,
        },
      });
      res.status(200).send("category edited");
    } catch (err) {
      console.log(err);
      res.status(400).send("Name used in another category");
    }
  }
);

contentRouter.delete("/deleteProduct/:prodId", async (req, res) => {
  //deleting the old image and video
  const { prodId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(prodId) },
    });
    let productImage = product.photo;
    let productVideo = product.video;

    if (
      fs.existsSync(
        path.join(
          process.cwd(),
          "/frontPages/public/products/images",
          productImage
        )
      )
    )
      fs.unlinkSync(
        path.join(
          process.cwd(),
          "/frontPages/public/products/images",
          productImage
        )
      );
    if (productVideo) {
      if (
        fs.existsSync(
          path.join(
            process.cwd(),
            "/frontPages/public/products/videos",
            productVideo
          )
        )
      )
        fs.unlinkSync(
          path.join(
            process.cwd(),
            "/frontPages/public/products/videos",
            productVideo
          )
        );
    }
    //delete from database

    // await prisma.product.delete({
    //     where:{id:parseInt(prodId)}
    // })
    await prisma.product.update({
      where: { id: parseInt(prodId) },
      data: {
        deleted: true,
      },
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(400).send("can't delete the product");
  }
});

contentRouter.patch("/changeProductState/:prodId", async (req, res) => {
  try {
    let {
      params: { prodId },
      body: { active },
    } = req;
    active = parseInt(active);
    await prisma.product.update({
      where: { id: parseInt(prodId) },
      data: {
        isActive: Boolean(active),
      },
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(400).send("can't update product's state");
  }
});

contentRouter.patch("/changeCategoryState/:catId", async (req, res) => {
  try {
    let {
      params: { catId },
      body: { active },
    } = req;
    active = parseInt(active);
    await prisma.category.update({
      where: { id: parseInt(catId) },
      data: {
        isActive: Boolean(active),
      },
    });
    // console.log(`category is changed to ${Boolean(active)}`);
    res
      .status(200)
      .send(`category with id:${catId} is changed to ${Boolean(active)}`);
  } catch (err) {
    console.log(err);
    res.status(400).send("can't update category's state");
  }
});
export default contentRouter;
