import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryManager() {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost/inventory/categories.php');
      if (response.data.status === 'success') {
        setCategories(response.data.categories);
      } else {
        alert('Failed to fetch categories.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('An error occurred while fetching categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      alert('Category name is required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      if (categoryImage) formData.append('image', categoryImage);
      if (editId) formData.append('id', editId);
      formData.append('action', editId ? 'update' : 'create');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post('http://localhost/inventory/categories.php', formData, config);

      if (response.data.status === 'success') {
        alert(editId ? 'Category updated!' : 'Category added!');
        setCategoryName('');
        setCategoryImage(null);
        setEditId(null);
        fetchCategories();
      } else {
        alert('Action failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting category:', error);
      alert('An error occurred while submitting the category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await axios.delete('http://localhost/inventory/categories.php', {
        data: { id },
      });

      if (response.data.status === 'success') {
        alert('Category deleted!');
        fetchCategories();
      } else {
        alert('Delete failed. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('An error occurred while deleting the category.');
    }
  };

  const handleEdit = (category) => {
    setEditId(category.id);
    setCategoryName(category.name);
    setCategoryImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            {editId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
            />
            {categoryImage && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(categoryImage)}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                />
              </div>
            )}
            {editId && !categoryImage && (
              <div className="mt-2">
                <img
                  src={`http://localhost/inventory/uploads/${categories.find(cat => cat.id === editId)?.image_url}`}
                  alt="Current Category Image"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition"
              >
                {editId ? 'Update' : 'Add'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setCategoryName('');
                    setCategoryImage(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">All Categories</h2>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full table-auto text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-300 text-sm">
                  <th></th>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <tr key={cat.id} className="bg-gray-700 hover:bg-gray-600 transition rounded-lg">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">
                        {cat.image_url ? (
                          <img
                            src={`http://localhost/inventory/uploads/${cat.image_url}`}
                            alt={cat.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="p-2 font-medium text-white">{cat.name}</td>
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-400 py-6">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
