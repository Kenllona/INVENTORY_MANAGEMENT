import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import LowStock from './pages/LowStock';
import Login from './pages/Login';
import Logout from './pages/Logout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isLoggedIn') === 'false');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
          <nav className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-400">Kennydy</h1>
            <div className="space-x-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-gray-700'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-gray-700'
                  }`
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-gray-700'
                  }`
                }
              >
                Categories
              </NavLink>
              <NavLink
                to="/low-stock"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-gray-700'
                  }`
                }
              >
                Low Stock
              </NavLink>
              <NavLink
                to="/logout"
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-500 hover:bg-gray-700 transition shadow-sm"
              >
                Logout
              </NavLink>
            </div>
          </nav>
          <main className="flex-1 p-6 bg-gray-900">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/low-stock" element={<LowStock />} />
              <Route
                path="/logout"
                element={<Logout setIsAuthenticated={setIsAuthenticated} />}
              />
            </Routes>
          </main>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;