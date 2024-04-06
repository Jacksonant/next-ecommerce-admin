import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: assignedProperties,
}) {
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [price, setPrice] = useState(existingPrice || 0);
  const [title, setTitle] = useState(existingTitle || "");
  const [goToProducts, setGoToProducts] = useState(false);
  const [images, setImages] = useState(existingImages || []);
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [category, setCategory] = useState(existingCategory || "");
  const [description, setDescription] = useState(existingDescription || "");
  const router = useRouter();

  const saveProduct = async (ev) => {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };

    if (_id) {
      // update
      await axios.put("/api/products", { ...data, _id });
    } else {
      // create
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  };

  const uploadImages = async (ev) => {
    const files = ev.target?.files;

    if (files?.length > 0) {
      setIsUploading(true);

      const data = new FormData();
      const fileList = Array.from(files);

      fileList.forEach((file) => {
        data.append("file", file);
      });
      try {
        // const res = await axios.post("/api/upload", data);
        // setImages((oldImages) => {
        //   return [...oldImages, ...res.data.links];
        // });
      } catch (err) {
        console.error(err, "err");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const updateImagesOrder = (images) => {
    setImages(images);
  };

  const setProductProp = (propName, value) => {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  };

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let selCatInfo = categories?.find(({ _id }) => _id === category);
    propertiesToFill?.push(...selCatInfo?.properties);
    while (selCatInfo?.parent?._id) {
      const parentCat = categories?.find(
        ({ _id }) => _id === selCatInfo?.parent?._id
      );
      propertiesToFill?.push(...parentCat?.properties);
      selCatInfo = parentCat;
    }
  }

  useEffect(() => {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }, []);

  if (goToProducts) router.push("/products");

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="Product name"
        value={title}
        required
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <label>Product category</label>
      <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
        <option value={""}>Uncategorized</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option value={c._id} key={c._id}>
              {c.name}
            </option>
          ))}
      </select>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div className="">
            <label className="capitalize">{p.name}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
              >
                {p.values.map((v, index) => (
                  <option key={index} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

      <label>Product photo</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          className="flex flex-wrap gap-1"
          list={images}
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link) => (
              <div
                className="h-32 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
                key={link}
              >
                <img className="rounded-lg" src={link} alt="" />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-32 flex items-center">
            <Spinner />
          </div>
        )}

        <label className=" cursor-pointer h-32 w-32 flex flex-col text-primary border border-primary rounded-sm bg-white shadow-sm items-center justify-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add image</div>
          <input type="file" className="hidden" onChange={uploadImages}></input>
        </label>
      </div>

      <label>Product Description</label>
      <textarea
        placeholder="Description"
        value={description}
        required
        onChange={(ev) => setDescription(ev.target.value)}
      ></textarea>
      <label>Product price (in RM)</label>
      <input
        type="number"
        placeholder="Product price"
        value={price}
        min={0}
        required
        onChange={(ev) => setPrice(ev.target.value)}
      />
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
