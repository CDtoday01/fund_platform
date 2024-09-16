import React from "react"
import { useState } from "react"
import { useSearchParams } from "react-router-dom" //取得ｕｒｌ參數
import { useNavigate } from "react-router-dom"
import apiInstance from "../../utils/axios"

function CreatePassword() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState("false")

    const [searchParam] = useSearchParams()
    const otp = searchParam.get("otp")
    const uidb64 = searchParam.get("uidb64")

    const navigate = useNavigate()

    const handleSubmitPassword = async(e) => {
        setIsLoading(true)
        e.preventDefault()
        if(password !== confirmPassword) {
            setError(true)
            alert("Password does not match")
            setIsLoading(false)
        } else{
            setError(false)
            const formdata = new FormData()
            formdata.append("password", password)
            formdata.append("otp", otp)
            formdata.append("uidb64", uidb64)

            try {
                const res = await apiInstance.post("user/password-change/", formdata)
                console.log(res.data)
                alert("Password  change successfully!") 
                navigate("/login")
                setIsLoading(false)
            } catch (error) {
                console.log(error)
                setIsLoading(false) 
            }
        }
    }

  return (
    // <div>
    //     <h1>CreatePassword</h1>
    //     <form onSubmit={handleSubmitPassword}>
    //         <input 
    //             type="password"
    //             placeholder="enter password"
    //             onChange={(e) => setPassword(e.target.value)}
    //         />
    //         <br />
    //         <input 
    //             type="password"
    //             placeholder="confirm password"
    //             onChange={(e) => setConfirmPassword(e.target.value)}
    //         />
    //         <br />
    //         <button type="submit">Save new password</button>
    //     </form>
    // </div>
<section>
    <main className="" style={{ marginBottom: 100, marginTop: 50 }}>
        <div className="container">
            {/* Section: Login form */}
            <section className="">
                <div className="row d-flex justify-content-center">
                    <div className="col-xl-5 col-md-8">
                        <div className="card rounded-5">
                            <div className="card-body p-4">
                                <h3 className="text-center">Create New Password</h3>
                                <br />

                                <div className="tab-content">
                                    <div
                                        className="tab-pane fade show active"
                                        id="pills-login"
                                        role="tabpanel"
                                        aria-labelledby="tab-login"
                                    >
                                        <form onSubmit={handleSubmitPassword}>
                                            {/* Email input */}
                                            <div className="form-outline mb-4">
                                                <label className="form-label" htmlFor="Full Name">
                                                    Enter New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    required
                                                    name="password"
                                                    className="form-control"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label" htmlFor="Full Name">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="ConfirmPassword"
                                                    required
                                                    name="confirmPassword"
                                                    className="form-control"
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                                {/* {error !== null &&
                                                    <>
                                                        {error === true

                                                            ? <p className="text-danger fw-bold mt-2">Password Does Not Match</p>
                                                            : <p className="text-success fw-bold mt-2">Password Matched</p>
                                                        }
                                                    </>
                                                } */}

                                                {isLoading === true
                                                ? <button disabled type="button" className="btn btn-primary btn-rounded w-100 mb-4">Processing...</button>
                                                : <button type="submit" className="btn btn-primary btn-rounded w-100 mb-4">Save Password <i className="fas fa-check-circle" /></button>
                                                }
                                            </div>


                                            {/* <div className="text-center">
                                                <button type="submit" className="btn btn-primary w-100">Reset Password</button>
                                            </div> */}

                                        </form>
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
  )
}

export default CreatePassword