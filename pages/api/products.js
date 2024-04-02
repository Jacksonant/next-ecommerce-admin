import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === "POST") {
    const { title, description, price, images, category, properties } =
      req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category: category || null,
      properties: properties || null,
    });

    res.json(true);
  }

  if (method === "PUT") {
    const { title, description, price, images, category, _id, properties } =
      req.body;
    await Product.updateOne(
      { _id },
      {
        title,
        description,
        price,
        images,
        category: category || null,
        properties: properties || null,
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    const id = req.query.id;
    if (id) {
      await Product.deleteOne({ _id: id });
      res.json(true);
    }
  }
}
