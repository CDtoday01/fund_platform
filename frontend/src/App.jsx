import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { setUser } from './utils/auth';
import PrivateRoute from './views/etfs/PrivateRoute';
import Home from './views/auth/dashboard';
import Login from './views/auth/login';
import Register from './views/auth/register';
import Logout from './views/auth/logout';
import ForgotPassword from './views/auth/forgotPassword';
import CreatePassword from './views/auth/createPassword';
import ETFs from './views/etfs/ETFs';
import ETFDetail from './views/etfs/ETFDetail';
import CreateETF from './views/etfs/CreateETF';
import UserETFs from './views/etfs/UserETFs';
import Navbar from './views/etfs/Navbar';

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
          <Route path="/etfs" element={<PrivateRoute><ETFs /></PrivateRoute>} />
          <Route path="/etfs/new" element={<PrivateRoute><CreateETF /></PrivateRoute>} />
          <Route path="/etfs/:id" element={<PrivateRoute><ETFDetail /></PrivateRoute>} />
          <Route path="/user/etfs" element={<PrivateRoute><UserETFs /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
