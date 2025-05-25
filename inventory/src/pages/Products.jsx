import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode';
import BarcodeScanner from '../components/BarcodeScanner'; 
import beepSound from '../assets/beep.mp3';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    barcode: '',
    category: '',
    warehouse: '',
    stock: '',
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [lastScanned, setLastScanned] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost/inventory/products.php')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  };

  const handleScan = async (barcode) => {
    if (barcode === lastScanned) return;
    setLastScanned(barcode);

    const audio = new Audio(beepSound); 
    audio.play();

    try {
      const res = await axios.post("http://localhost/inventory/barcode.php", { barcode });
      if (res.data.status === "success" && res.data.products && res.data.products.length > 0) {
        setScannedProduct(res.data.products);
        setShowScanner(false);      
       
      } else {
        setScannedProduct(null);
        alert(res.data.message || "Product(s) not found.");
        setShowScanner(false);
      }
    } catch (err) {
      console.error("Error during scan:", err.response || err.message || err);
      alert("Scan failed. Please check your connection or try again.");
      setScannedProduct(null);
      setShowScanner(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const formData = new FormData();
      formData.append("id", id);
      const res = await axios.post("http://localhost/inventory/delete_product.php", formData);
      if (res.data.status === "success") {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: name === "image" ? files[0] : value });
  };

const handleAddProduct = async (e) => {
  e.preventDefault();
  const postData = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (value) postData.append(key, value);
  });

  try {
    const res = await axios.post("http://localhost/inventory/products.php", postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (res.data.status === "success") {
      setShowModal(false);
      setFormData({
        name: '', price: '', barcode: '', category: '', warehouse: '', stock: '', image: null
      });
      if (res.data.product) {
        setProducts(prev => [res.data.product, ...prev]);
      } else {
        fetchProducts();
      }
    } else {
      alert("Error: " + (res.data.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Failed to add product:", error);
    alert("Error adding product.");
  }
};

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      barcode: product.barcode,
      category: product.category,
      warehouse: product.warehouse,
      stock: product.stock,
      image: null,
    });
    setShowModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct?.id) return;
    const postData = new FormData();
    postData.append("id", editingProduct.id);
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value) {
        postData.append(key, value); 
      } else if (key !== "image") {
        postData.append(key, value ?? "");
      }
    });
    try {
      const res = await axios.post("http://localhost/inventory/update_product.php", postData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.status === "success") {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          price: '',
          barcode: '',
          category: '',
          warehouse: '',
          stock: '',
          image: null,
        });
        fetchProducts();
      } else {
        alert("Update failed: " + (res.data.message || ""));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating product.");
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)))
  );
  const lowStockProducts = products.filter(
    p => Number(p.stock) <= Number(p.low_stock_threshold)
  );

  return (
    <div className="container mx-auto p-6 text-gray-100 bg-gray-900 min-h-screen">
  {lowStockProducts.length > 0 && (
    <div className="mb-6 p-4 rounded-lg bg-red-900/80 border border-red-500 flex items-center gap-4">
      <svg className="w-6 h-6 text-red-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">      
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16h.01M12 8v4m-7 8h14a2 2 0 0 0 1.73-3l-7-12a2 2 0 0 0-3.46 0l-7 12A2 2 0 0 0 5 20z" />
      </svg>
      <div>
        <span className="font-semibold text-red-200">Low Stock Alert:</span>
        <span className="ml-2 text-red-100">
          {lowStockProducts.map(p => p.name).join(', ')} {lowStockProducts.length === 1 ? "is" : "are"} low on stock!
        </span>
      </div>
    </div>
  )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Products</h1>
        <div className="flex space-x-4">
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
          >
            Add Product
          </button>
          <button className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
            onClick={() => setShowScanner(true)}>Scan Product</button>
        </div>
      </div>

      {showScanner && (
        <div>
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}

      {scannedProduct && scannedProduct.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Scanned Product</h2>
          {scannedProduct.map((product, index) => (
            <div key={index} className="mb-4 border-b border-gray-700 pb-4 flex gap-6 items-center">       
              <div>
                <p><strong>Name:</strong> {product.name || "N/A"}</p>
                <p><strong>ID:</strong> {product.id || "N/A"}</p>
                <p><strong>Price: ₱</strong>{product.price || "N/A"}</p>
                <p><strong>Barcode:</strong> {product.barcode || "N/A"}</p>
                <p><strong>Category:</strong> {product.category_id || "N/A"}</p>
                <p><strong>Warehouse:</strong> {product.warehouse_id || "N/A"}</p>
                <p><strong>Stock:</strong> {product.stock || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Search by name or barcode..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="p-3 bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-400"
      />

      <div className="overflow-x-auto bg-gray-800 shadow-lg rounded-lg">
        <table className="min-w-full table-auto text-gray-100">
          <thead>
            <tr className="bg-gray-700 text-sm font-semibold">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Barcode No.</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Warehouse</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Barcode</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="py-2 px-4">
                  <img
                    src={product.image || '/no-image.png'}
                    className="w-20 h-20 object-cover rounded-lg"
                    alt="Product"
                    onError={e => { e.target.src = '/no-image.png'; }}
                  />
                </td>
                <td className="py-2 px-4">{product.name}</td>
                <td className="py-2 px-4">₱{product.price}</td>
                <td className="py-2 px-4">{product.barcode}</td>
                <td className="py-2 px-4">{product.category}</td>
                <td className="py-2 px-4">{product.warehouse}</td>
                <td className={`py-2 px-4 font-medium ${product.stock <= product.low_stock_threshold ? 'text-red-400' : 'text-green-400'}`}>
                  {product.stock}
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-col items-center">
                    <div id={`barcode-${product.id}`}>
                      <Barcode
                        value={product.barcode}
                        format="CODE128"
                        width={1.5}
                        height={60}
                        displayValue={false}
                        background="#ffffff"
                        lineColor="#000000"
                        id={`barcode-svg-${product.id}`}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const svg = document.querySelector(`#barcode-${product.id} svg`);
                        if (!svg) {
                          alert("Barcode not ready.");
                          return;
                        }
                        const svgString = new XMLSerializer().serializeToString(svg);
                        const base64 = btoa(unescape(encodeURIComponent(svgString)));
                        const imageSrc = `data:image/svg+xml;base64,${base64}`;
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          canvas.width = img.width * 2;  
                          canvas.height = img.height * 2;
                          const ctx = canvas.getContext("2d");
                          ctx.fillStyle = "#fff";
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                          const link = document.createElement("a");
                          link.download = `${product.name || "barcode"}.png`;
                          link.href = canvas.toDataURL("image/png");
                          link.click();
                        };
                        img.onerror = () => alert("Failed to load barcode image.");
                        img.src = imageSrc;
                      }}
                      className="mt-1 text-xs text-blue-300 hover:underline">Download</button>
                  </div>
                </td>
                <td className="py-2 px-4 text-center">
                  <button onClick={() => handleEditProduct(product)}
                    className="text-blue-400 hover:underline mr-4">Edit</button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-400 py-4">No products found.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
              {['name', 'price', 'barcode', 'category', 'warehouse', 'stock'].map(field => (
                <input
                  key={field}
                  type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
                />
              ))}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <div className="flex justify-end space-x-4 mt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"> {editingProduct ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}