import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import axios from "axios";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editedCategory, setEditedCategory] = useState("");
  const [parentCategories, setParentCategories] = useState("");

  const reset = () => {
    setName("");
    setEditedCategory("");
    setParentCategories("");
    setProperties([]);
  };

  const saveCategory = async (ev) => {
    ev.preventDefault();
    const data = {
      name,
      parentCategories,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };

    if (editedCategory) {
      await axios
        .put("/api/categories", { ...data, _id: editedCategory._id })
        .then((response) => {
          reset();
        });
    } else {
      await axios.post("/api/categories", data).then((response) => {
        reset();
      });
    }
    fetchCategory();
  };

  const fetchCategory = () => {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  };

  const editCategory = (category) => {
    setEditedCategory(category);
    setName(category.name);
    setParentCategories(category.parent?._id || "");
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  };

  const deleteCategory = (category) => {
    reset();

    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtontext: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          await fetchCategory();
        }
      })
      .catch((error) => {
        // when promise rejected...
      });
  };

  const addProperty = () => {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  };

  const updatePropertyNameChange = (index, property, newName) => {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  };

  const updatePropertyValuesChange = (index, property, newValues) => {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  };

  const removeProperty = (indexToRemove) => {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  const cancelEdit = () => {
    reset();
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {" "}
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "New category name"}{" "}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Category name"
            value={name}
            required
            onChange={(ev) => setName(ev.target.value)}
          />
          <select
            onChange={(ev) => setParentCategories(ev.target.value)}
            value={parentCategories}
          >
            <option value={""}>No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option value={category._id} key={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block">Properties</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((p, index) => (
              <div key={index} className="flex gap-1">
                <input
                  type="text"
                  placeholder="Property name (example: color)"
                  required
                  value={p.name}
                  onChange={(ev) =>
                    updatePropertyNameChange(index, p, ev.target.value)
                  }
                />
                <input
                  type="text"
                  value={p.values}
                  placeholder="values, comma separated"
                  required
                  onChange={(ev) =>
                    updatePropertyValuesChange(index, p, ev.target.value)
                  }
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-red mb-2"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>

        <div className="flex gap-1">
          {editedCategory && (
            <button
              onClick={cancelEdit}
              type="button"
              className="btn-default py-1"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>

      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Category parent</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-default flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
