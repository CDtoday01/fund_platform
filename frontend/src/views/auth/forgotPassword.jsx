import React, { useState } from "react";
import apiInstance from "../../utils/axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await apiInstance.post(`user/password-reset/${email}/`);
      console.log(res.data);
      alert("An email has been sent to you!");
      setIsLoading(false);
      navigate("/create-new-password");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <section>
      <main style={{ marginBottom: 100, marginTop: 50 }}>
        <div className="container">
          <section>
            <div className="row d-flex justify-content-center">
              <div className="col-xl-5 col-md-8">
                <div className="card rounded-5">
                  <div className="card-body p-4">
                    <h3 className="text-center">Forgot Password</h3>
                    <br />
                    <div className="tab-content">
                      <div className="tab-pane fade show active" id="pills-login" role="tabpanel">
                        <div>
                          <div className="form-outline mb-4">
                            <label className="form-label" htmlFor="email">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              className="form-control"
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="text-center">
                            <button
                              onClick={handleSubmit}
                              className="btn btn-primary w-100"
                              disabled={isLoading}
                            >
                              {isLoading ? "Processing..." : "Reset Password"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </section>
  );
}

export default ForgotPassword;
