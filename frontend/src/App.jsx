import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { setUser } from './utils/auth'

import Home from './views/auth/dashboard'
import Login from './views/auth/login'
import Register from './views/auth/register'
import Logout from './views/auth/logout'
import ForgotPassword from './views/auth/forgotPassword'
import CreatePassword from './views/auth/createPassword'
import Trade from './views/func/trade';
import Order from './views/func/order';

function App() {
  useEffect(() => {  // 避免reload page 後logout
    console.log("App component mounted, calling setUser");
    setUser()
  }, [])

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
        <Route path ='/' element={<Home />} />
          <Route path ='/login' element={<Login />} />
          <Route path ='/logout' element={<Logout />} />
          <Route path ='/register' element={<Register />} />
          <Route path ='/forgot-password' element={<ForgotPassword />} />
          <Route path ='/create-new-password' element={<CreatePassword />} />

          <Route path="/trade" element={<Trade />} />
          <Route path="/order" element={<Order />} />

        </Routes>
      </BrowserRouter>
    </div>
    
    
  )
}

export default App