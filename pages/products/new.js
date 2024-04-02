import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NewProducts() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [goToProducts, setGoToProducts] = useState(false);
  const router = useRouter();

  const createProduct = async (ev) => {
    ev.preventDefault();
    const data = { title, description, price };
    await axios.post("/api/products", data);
    setGoToProducts(true);
  };

  if (goToProducts) router.push("/products");

  return (
    <Layout>
      <h1>New Product</h1>
      <ProductForm />
    </Layout>
  );
}
