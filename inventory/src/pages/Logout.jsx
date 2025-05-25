import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove authentication flag from localStorage
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    // Redirect to login page
    navigate('/login');
  }, [setIsAuthenticated, navigate]);
};

export default Logout;