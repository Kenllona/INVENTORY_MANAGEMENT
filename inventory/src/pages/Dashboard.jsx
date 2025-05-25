import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Warehouse, Box, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost/inventory/products.php').then(res => setProducts(res.data));
    axios.get('http://localhost/inventory/low_stock.php').then(res => setLowStock(res.data));
    axios.get('http://localhost/inventory/warehouses.php').then(res => setWarehouses(res.data));
  }, []);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: <Box className="w-4 h-4 text-blue-400" />,
      bg: 'bg-gray-1000',
    },
    {
      title: 'Low Stock Items',
      value: lowStock.length,
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      bg: 'bg-gray-1000',
    },
    {
      title: 'Total Warehouses',
      value: warehouses.length,
      icon: <Warehouse className="w-4 h-4 text-green-400" />,
      bg: 'bg-gray-1000',
    },
  ];

  const detailedWarehouseSummary = products.reduce((acc, product) => {
    const warehouse = product.warehouse || "Unknown";
    const category = product.category || "Uncategorized";
    const stock = Number(product.stock || 0);

    if (!acc[warehouse]) {
      acc[warehouse] = { total: 0, categories: {} };
    }

    acc[warehouse].total += stock;
    acc[warehouse].categories[category] = (acc[warehouse].categories[category] || 0) + stock;

    return acc;
  }, {});

  return (
    <>
      <div className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
        <h1 className="text-4xl font-extrabold mb-10 text-white">Inventory Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} rounded-2xl p-6 shadow-lg border border-gray-700 flex items-center gap-4 transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-gray-800`}
            >
              <div className="p-3 rounded-xl bg-gray-700">{stat.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{stat.title}</p>
                <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-white">Low Stock Overview</h3>
            {lowStock.length === 0 ? (
              <p className="text-green-400 font-medium">All inventory levels are sufficient.</p>
            ) : (
              <ul className="divide-y divide-gray-700">
                {lowStock.map(product => (
                  <li key={product.id} className="py-3 flex justify-between items-center">
                    <span className="text-gray-200 font-medium">{product.name}</span>
                    <span className="text-red-400 font-semibold">{product.stock} units</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-indigo-400">Warehouse Summary</h2>
            {Object.entries(detailedWarehouseSummary).map(([warehouseName, data]) => {
              const warehouseInfo = warehouses.find(w => w.name === warehouseName);
              const location = warehouseInfo ? warehouseInfo.location : "N/A";

              return (
                <div key={warehouseName} className="mb-4 border-b border-gray-700 pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-300 font-medium">{warehouseName}</div>
                      <div className="text-gray-400 text-xs">Location: {location}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-blue-400 font-semibold">{data.total} units</div>
                    </div>
                  </div>
                  <ul className="mt-2 ml-4 list-disc list-inside text-sm text-gray-300 space-y-1">
                    {Object.entries(data.categories).map(([category, stock]) => (
                      <li key={category}>
                        {category}: <span className="text-blue-300 font-medium">{stock} units</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}