import React from 'react';
import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';

function Dashboard() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  return (
    <>
      {isLoggedIn() ? (
        <div>
          <h1>Dashboard</h1>
          <div className="d-flex">
            <Link to={'/logout'}>Logout</Link>
          </div>
        </div>
      ) : (
        <div>
          <h1>Home page</h1>
          <div className="d-flex">
            <Link className="btn btn-primary" to={'/register'}>
              Register
            </Link>
            <Link className="btn btn-success ms-4" to={'/login'}>
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;