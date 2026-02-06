"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import router

export default function Dashboard() {
  const router = useRouter(); // Initialize router

  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: "", stock: "", price: "" });
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // New states for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStock, setFilterStock] = useState("all");

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => setStats(data));

    fetch("/api/low-stock")
      .then(res => res.json())
      .then(data => setLowStockProducts(data));
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal for Add or Edit
  const openModal = (product = null) => {
    setEditingProduct(product);
    setForm(product ? { ...product } : { name: "", stock: "", price: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm({ name: "", stock: "", price: "" });
  };

  // Handle Add / Edit form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingProduct.id }),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      await fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Error adding/updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch("/api/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        await fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    // Clear local storage or session if used
    localStorage.removeItem("user"); // example, if you stored user info
    router.push("/login"); // redirect to login page
  };

  // Summary
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  // Filtered products based on search and stock filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStock = true;
    if (filterStock === "low") matchesStock = product.stock < 5;
    else if (filterStock === "inStock") matchesStock = product.stock >= 5;

    return matchesSearch && matchesStock;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Inventory Dashboard</h1>
        <div className="flex gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => openModal()}
          >
            + Add Product
          </button>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>



      {/* Search & Filter - Placed below header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 rounded-lg bg-zinc-700 text-white w-full md:w-1/3"
        />

        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="p-2 rounded-lg bg-zinc-700 text-white w-full md:w-1/4"
        >
          <option value="all">All Products</option>
          <option value="low">Low Stock (&lt; 5)</option>
          <option value="inStock">In Stock (&ge; 5)</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 shadow rounded-lg p-5">
          <p className="text-gray-400 font-medium">Total Products</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-gray-800 shadow rounded-lg p-5">
          <p className="text-gray-400 font-medium">Total Stock</p>
          <p className="text-2xl font-bold text-white">{totalStock}</p>
        </div>
        <div className="bg-gray-800 shadow rounded-lg p-5">
          <p className="text-gray-400 font-medium">Total Inventory Value</p>
          <p className="text-2xl font-bold text-white">₱{totalValue}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-zinc-800 p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ⚠ Low Stock Alert
        </h2>

        {lowStockProducts.length === 0 ? (
          <p className="text-gray-400">All products have sufficient stock.</p>
        ) : (
          <table className="w-full text-left text-white mb-4">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2">Product Name</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Price</th>
              </tr>
            </thead>

            <tbody>
              {lowStockProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-700">
                  <td className="py-2">{product.name}</td>
                  <td className="py-2 text-red-400 font-bold">{product.stock}</td>
                  <td className="py-2">₱ {product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Price</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-700">
                <td className="px-6 py-4">{product.id}</td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">₱{product.price}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    onClick={() => openModal(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg text-gray-100">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Stock</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {editingProduct ? "Update" : loading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
