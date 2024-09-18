import React from "react";
import { useAuthStore } from "../../store/auth";
import { Link } from "react-router-dom";
import ETFs from "../etfs/ETFs";

function Dashboard() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  
  return (
    <>
      {isLoggedIn() ? (
        <div>
          <h1>Dashboard</h1>
          <div className="d-flex">
            <Link to={"/logout"}>Logout</Link>
          </div>
          <ETFs />
        </div>
      ) : (
        <div>
          <h1>Home page</h1>
          <div className="d-flex">
            <div>
              <Link className="btn btn-success ms-4" to={"/login"}>
                Login
              </Link>
            </div>
            <div>
              Do not have an account? 
              <Link className="btn btn-primary" to={"/register"}>
                Register
              </Link>
            </div>
          </div>
          <ETFs />
        </div>
      )}
    </>
  );
}

export default Dashboard;