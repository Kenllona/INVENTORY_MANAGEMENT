import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (!users.find(u => u.username === 'kenadmin')) {
      users.push({ username: 'kenadmin', password: 'admin123' });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setError('');
      onLogin();
      navigate('/'); 
    } else {
      setError('Wrong username or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-3xl font-bold text-indigo-400 text-center mb-6">
          Inventory Management System
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;