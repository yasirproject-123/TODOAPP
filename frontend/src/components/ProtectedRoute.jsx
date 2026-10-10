import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const API = "https://todoapp-backend-4yfx.onrender.com";
// const API = "http://localhost:3000"

const ProtectedRoute = () => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, {
        withCredentials: true,
      })
      .then((response) => {
        setAuthenticated(response.data.authenticated);
        localStorage.setItem("user", JSON.stringify(response.data))
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, []);

  if (authenticated === null) {
    return <p>Checking authentication...</p>;
  }

  if (!authenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;