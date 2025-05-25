import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode'; 

export default function LowStock() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const res = await axios.get('http://localhost/inventory/low_stock.php');
      setLowStockProducts(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch low stock products:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-semibold mb-6">Low Stock Products</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : lowStockProducts.length === 0 ? (
        <p className="text-green-400">All products have sufficient stock.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-700 text-sm font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Barcode No.</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Warehouse</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Minimum</th>
                <th className="px-4 py-3 text-left">Barcode Image</th> 
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map(product => (
                <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="py-2 px-4">{product.barcode}</td>                                   
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2">{product.warehouse}</td>
                  <td className="px-4 py-2 text-red-400 font-semibold">{product.stock}</td>
                  <td className="px-4 py-2 text-yellow-400">{product.low_stock_threshold}</td>
                  <td className="px-4 py-2">
                    <Barcode
                      value={product.barcode}
                      format="CODE128"
                      width={1.5}
                      height={40}
                      displayValue={false}
                      background="#fff"
                      lineColor="#000"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}