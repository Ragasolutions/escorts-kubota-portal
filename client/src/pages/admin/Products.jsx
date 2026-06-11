import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Package, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const categories = [
  "Cap",
  "Jacket",
  "Shirt",
  "Shirt - Dealer VIP",
  "Shirt - Employees",
  "Shoes",
  "T-Shirt",
  "Trousers",
  "Wind Jacket",
  "Workshop Uniform",
];

const brands = [
  "Construction Equipment",
  "Farmtrac",
  "GENSET",
  "HO",
  "Kubota",
  "Powertrac",
];

// ─── Sortable Image Component ────────────────────────────────
const SortableImage = ({ img, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: img._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group shrink-0"
    >
      {index === 0 && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold z-10 whitespace-nowrap">
          Main
        </span>
      )}

      <div
        {...attributes}
        {...listeners}
        className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 cursor-grab active:cursor-grabbing"
      >
        <img
          src={img.url}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(img._id);
        }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition z-10 hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editProduct, setEditProduct] =
    useState(null);

  const [images, setImages] = useState([]);

  const [uploading, setUploading] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    hsnCode: "",
    price: "",
    originalPrice: "",
    stock: "",
    badge: "",
    sizes: "",
      sizeGuideType: "",

  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(
        "/products?limit=100"
      );

      setProducts(res.data.products);
    } catch (err ) {
      toast.error(
        "Failed to load products" , err
      );
    }

    setLoading(false);
  };

  const handleImageUpload = async (
    productId,
    files
  ) => {
    if (!files || files.length === 0)
      return;

    setUploading(true);

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) =>
        formData.append("images", file)
      );

      await api.post(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success("Images uploaded!");
      fetchProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Image upload failed"
      );
    }

    setUploading(false);
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.category ||
      !form.price
    ) {
      return toast.error(
        "Name, category and price are required"
      );
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice:
          Number(form.originalPrice) ||
          undefined,
        stock: Number(form.stock) || 0,
        sizes: form.sizes
          ? form.sizes
              .split(",")
              .map((s) => s.trim())
          : [],
      };

      let productId;

      if (editProduct) {
        await api.put(
          `/products/${editProduct._id}`,
          payload
        );

        toast.success(
          "Product updated!"
        );

        productId = editProduct._id;
      } else {
        const res = await api.post(
          "/products",
          payload
        );

        toast.success(
          "Product created!"
        );

        productId =
          res.data.product._id;
      }

      if (images.length > 0) {
        await handleImageUpload(
          productId,
          images
        );
      }

      resetForm();

      fetchProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to save product"
      );
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);

    setForm({
      name: product.name,
      description:
        product.description || "",
      category: product.category,
      brand: product.brand || "",
      hsnCode: product.hsnCode || "",
      price: product.price,
      originalPrice:
        product.originalPrice || "",
      stock: product.stock,
      badge: product.badge || "",
      sizes:
        product.sizes?.join(", ") || "",
          sizeGuideType: product.sizeGuideType || "",

    });

    setImages([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this product?"
      )
    )
      return;

    try {
      await api.delete(
        `/products/${id}`
      );

      toast.success(
        "Product deleted!"
      );

      fetchProducts();
    } catch (err) {
      toast.error(
        "Failed to delete product" , err
      );
    }
  };

  const handleToggle = async (
    id,
    isActive
  ) => {
    try {
      await api.put(
        `/products/${id}`,
        {
          isActive: !isActive,
        }
      );

      toast.success(
        `Product ${
          isActive
            ? "deactivated"
            : "activated"
        }`
      );

      fetchProducts();
    } catch (err) {
      toast.error(
        "Failed to update status" , err
      );
    }
  };

  const handleRemoveImage = async (
    imgId
  ) => {
    try {
      await api.delete(
        `/products/${editProduct._id}/images/${imgId}`
      );

      toast.success("Image removed!");

      const updated =
        editProduct.images.filter(
          (img) => img._id !== imgId
        );

      setEditProduct((prev) => ({
        ...prev,
        images: updated,
      }));
    } catch (err) {
      toast.error(
        "Failed to remove image" , err
      );
    }
  };

  const handleDragEnd = async (
    event
  ) => {
    const { active, over } = event;

    if (
      !active ||
      !over ||
      active.id === over.id
    )
      return;

    const oldIndex =
      editProduct.images.findIndex(
        (img) => img._id === active.id
      );

    const newIndex =
      editProduct.images.findIndex(
        (img) => img._id === over.id
      );

    const reordered = arrayMove(
      editProduct.images,
      oldIndex,
      newIndex
    );

    setEditProduct((prev) => ({
      ...prev,
      images: reordered,
    }));

    try {
      await api.put(
        `/products/${editProduct._id}`,
        {
          images: reordered,
        }
      );
    } catch (err) {
      toast.error(
        "Failed to save image order" , err
      );
    }
  };

  const resetForm = () => {
    setShowForm(false);

    setEditProduct(null);

    setImages([]);

    setForm({
      name: "",
      description: "",
      category: "",
      brand: "",
      hsnCode: "",
      price: "",
      originalPrice: "",
      stock: "",
      badge: "",
      sizes: "",
      sizeGuideType: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-800">
              Manage Products
            </h2>

            <p className="text-gray-400 text-sm">
              {products.length} products total
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-amber-100 w-full sm:w-auto"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-3 sm:p-4">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">

                <h3 className="font-black text-gray-800">
                  {editProduct
                    ? "Edit Product"
                    : "New Product"}
                </h3>

                <button
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                >
                  <X
                    size={16}
                    className="text-gray-500"
                  />
                </button>
              </div>

              {/* Form */}
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">

                <input
                  placeholder="Product Name *"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 sm:col-span-2"
                />

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="">
                    Select Category *
                  </option>

                  {categories.map((c) => (
                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={form.brand}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      brand:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="">
                    Select Brand
                  </option>

                  {brands.map((b) => (
                    <option
                      key={b}
                      value={b}
                    >
                      {b}
                    </option>
                  ))}
                </select>

                <input
  placeholder="HSN Code"
  value={form.hsnCode}
  onChange={(e) =>
    setForm({
      ...form,
      hsnCode: e.target.value,
    })
  }
  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
/>



<select
  value={form.sizeGuideType}
  onChange={(e) =>
    setForm({
      ...form,
      sizeGuideType: e.target.value,
    })
  }
  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white sm:col-span-2"
>
  <option value="">
    Select Size Guide
  </option>

  <option value="male-full-sleeve-shirt">
    Male Full Sleeve Shirt
  </option>

  <option value="male-half-sleeve-shirt">
    Male Half Sleeve Shirt
  </option>

  <option value="female-3-4-sleeve-shirt">
    Female 3/4 Sleeve Shirt
  </option>

  <option value="trouser-male">
    Trouser Male
  </option>

  <option value="trouser-female">
    Trouser Female
  </option>

  <option value="workshop-supervisor-jacket">
    Workshop Supervisor Jacket
  </option>

  <option value="workshop-mechanics-top-lower">
    Workshop Mechanics Top & Lower
  </option>
</select>


                <input
                  placeholder="Price *"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <input
                  placeholder="Original Price"
                  type="number"
                  value={
                    form.originalPrice
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      originalPrice:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <input
                  placeholder="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <input
                  placeholder="Badge"
                  value={form.badge}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      badge:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <input
                  placeholder="Sizes (S, M, L)"
                  value={form.sizes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sizes:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 sm:col-span-2"
                />

                <input
                  placeholder="Description"
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 sm:col-span-2"
                />

                {/* Image Upload */}
                <div className="sm:col-span-2">

                  <label className="text-xs text-gray-500 font-medium block mb-1">
                    Product Images
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setImages(
                        e.target.files
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  {images.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {
                        images.length
                      }{" "}
                      image(s) selected
                    </p>
                  )}
                </div>

                {/* Existing Images */}
                {editProduct?.images
                  ?.length > 0 && (
                  <div className="sm:col-span-2">

                    <p className="text-xs text-gray-500 font-medium mb-2">
                      Current Images
                    </p>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={
                        closestCenter
                      }
                      onDragEnd={
                        handleDragEnd
                      }
                    >
                      <SortableContext
                        items={editProduct.images.map(
                          (img) =>
                            img._id
                        )}
                        strategy={
                          horizontalListSortingStrategy
                        }
                      >
                        <div className="flex gap-4 overflow-x-auto pb-2 pt-3">

                          {editProduct.images.map(
                            (
                              img,
                              i
                            ) => (
                              <SortableImage
                                key={
                                  img._id
                                }
                                img={img}
                                index={i}
                                onRemove={
                                  handleRemoveImage
                                }
                              />
                            )
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 pb-4 sm:pb-6">

                <button
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    uploading
                  }
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-black py-3 sm:py-2.5 rounded-xl text-sm font-bold transition"
                >
                  {uploading
                    ? "Uploading..."
                    : editProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>

                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition py-3 sm:py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-6 space-y-3">

            {[...Array(5)].map(
              (_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                />
              )
            )}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">

            <Package
              size={40}
              className="text-gray-200 mx-auto mb-3"
            />

            <p className="text-gray-500 font-bold">
              No products yet
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Click Add Product to get
              started
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">

            <table className="w-full text-sm min-w-[900px]">

              <thead className="bg-gray-50">

                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">

                  <th className="px-5 py-3 w-96">
                    Product
                  </th>

                  <th className="px-5 py-3">
                    Category
                  </th>

                  <th className="px-5 py-3">
                    Brand
                  </th>

                  <th className="px-5 py-3">
  HSN
</th>

                  <th className="px-5 py-3">
                    Price
                  </th>

                  <th className="px-5 py-3">
                    Stock
                  </th>

                  <th className="px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {products.map(
                  (product) => (
                    <tr
                      key={
                        product._id
                      }
                      className="border-t border-gray-50 hover:bg-gray-50 transition"
                    >

                      <td className="px-5 py-3">

                        <div className="flex items-center gap-3 min-w-[250px]">

                          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">

                            {product.images?.[0] ? (

                              <img
                                src={
                                  product
                                    .images[0]
                                    .url
                                }
                                alt={
                                  product.name
                                }
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <Package
                                size={
                                  16
                                }
                                className="text-gray-400"
                              />
                            )}
                          </div>

                          <div>

                            <p className="font-bold text-gray-800">
                              {
                                product.name
                              }
                            </p>

                            {!product.isActive && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Inactive
                              </span>
                            )}

                            {product
                              .sizes
                              ?.length >
                              0 && (
                              <p className="text-xs text-gray-400">
                                {product.sizes.join(
                                  ", "
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-gray-500">
                        {
                          product.category
                        }
                      </td>

                      <td className="px-5 py-3 text-gray-500">
                        {product.brand ||
                          "-"}
                      </td>

                      <td className="px-5 py-3 text-gray-500">
  {product.hsnCode || "-"}
</td>

                      <td className="px-5 py-3">

                        <p className="font-bold text-gray-800">
                          ₹
                          {
                            product.price
                          }
                        </p>

                        {product.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹
                            {
                              product.originalPrice
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3">

                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            product.stock >
                            10
                              ? "bg-green-100 text-green-700"
                              : product.stock >
                                0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {
                            product.stock
                          }{" "}
                          units
                        </span>
                      </td>

                      <td className="px-5 py-3">

                        <div className="flex items-center gap-2 flex-wrap">

                          <button
                            onClick={() =>
                              handleEdit(
                                product
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            <Pencil
                              size={14}
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                product._id
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                          >
                            <Trash2
                              size={14}
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleToggle(
                                product._id,
                                product.isActive
                              )
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                              product.isActive
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {product.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;