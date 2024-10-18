import React, { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { setUser } from "./utils/auth";
import PrivateRoute from "./views/Funds/PrivateRoute";
import Home from "./views/auth/dashboard";
import Login from "./views/auth/login";
import Register from "./views/auth/register";
import Logout from "./views/auth/logout";
import ForgotPassword from "./views/auth/forgotPassword";
import CreatePassword from "./views/auth/createPassword";
import Funds from "./views/Funds/Funds";
import FundDetail from "./views/Funds/FundDetail";
import CreateFund from "./views/Funds/CreateFund";
import Userfunds from "./views/Funds/UserFunds";
import Navbar from "./views/Funds/Navbar";

function App() {
  useEffect(() => {
    console.log("App component mounted, calling setUser");
    setUser();
  }, []);

  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-new-password" element={<CreatePassword />} />
          <Route path="/funds" element={<PrivateRoute><Funds /></PrivateRoute>} />
          <Route path="/funds/new" element={<PrivateRoute><CreateFund /></PrivateRoute>} />
          <Route path="/funds/:id" element={<PrivateRoute><FundDetail /></PrivateRoute>} />
          <Route path="/user/funds" element={<PrivateRoute><Userfunds /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
