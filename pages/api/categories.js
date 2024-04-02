import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import { Category } from "@/models/Category";

export default async function handler(req, res) {
  const { method } = req;

  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Category.findOne({ _id: req.query.id }));
    } else {
      res.json(await Category.find().populate("parent"));
    }
  }

  if (method === "POST") {
    const { name, parentCategories, properties } = req.body;
    const categoryDoc = await Category.create({
      name,
      parent: parentCategories || null,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === "PUT") {
    const { _id, name, parentCategories, properties } = req.body;
    await Category.updateOne(
      { _id },
      {
        name,
        parent: parentCategories || null,
        properties,
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    if (_id) {
      await Category.deleteOne({ _id });
      res.json(true);
    }
  }
}
