import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { deleteETF } from "../../services/etfService";
import { useAuthStore } from "../../store/auth";

const ETFDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [etf, setETF] = useState(null);
    const [investmentAmount, setInvestmentAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        const axiosInstance = useAxios();
        // Fetch ETF details
        axiosInstance.get(`/etfs/${id}/`)
            .then(response => {
                setETF(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error fetching ETF details:", error);
            });
    }, [id]);
    
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this ETF?");
        if (confirmed) {
            try {
                await deleteETF(id);
                alert("ETF deleted successfully");
                navigate("/etfs"); // Navigate to the ETF list after deletion
            } catch (error) {
                console.error("Error deleting ETF:", error);
                alert("Failed to delete ETF");
            }
        }
    };
    
    const handleJoin = async (etfId, etfName) => {
        if (investmentAmount <= 0) {
            setErrorMessage("Please enter a valid investment amount.");
            return;
        }
        if (window.confirm(`Are you sure you want to invest ${investmentAmount} in ${etfName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`/etfs/${etfId}/join/`, { investment_amount: investmentAmount });
                console.log("Joined ETF:", response.data);
                if (response.status === 200) {
                    alert("Joined ETF!");
                    setInvestmentAmount(0); // Reset the investment amount after successful join
                    setErrorMessage(""); // Clear any previous error message
                    // Re-fetch the ETF details to update the state after joining
                    axiosInstance.get(`/etfs/${id}/`)
                        .then(response => {
                            setETF(response.data); // Update the ETF details in the state
                            console.log(response.data);
                        })
                        .catch(error => {
                            console.error("Error fetching updated ETF details:", error);
                        });
                } else {
                    console.error("Failed to join ETF:", response.data);
                    setErrorMessage("Failed to join ETF. Please try again.");
                }
            } catch (error) {
                console.error("Error joining ETF:", error);
                setErrorMessage("An error occurred while joining the ETF.");
            }
        }
    };
     
    if (!etf || !currentUser) {
        return <div>Loading...</div>;
    }

    const isCreator = etf.creator === currentUser.user_id;
    
    return (
        <div>
            <h1>{etf.name}</h1>
            <p>類別：{etf.etf_type}</p>
            <p>分類：{etf.subcategory_name}</p>
            <p>總金額：{etf.total_amount / 10000}萬</p>
            <p>每單最低金額：{etf.lowest_amount / 10000}萬</p>
            <p>目前投資金額：{Math.round((etf.current_investment / 10000 + Number.EPSILON) * 100) / 100}萬</p> {/* 取到小數點後兩位*/}
            <p>公告開始時間：{new Date(etf.announcement_start_date).toLocaleString()}</p>
            <p>公告結束時間：{new Date(etf.announcement_end_date).toLocaleString()}</p>
            <p>公告時長：{etf.announcement_duration} 日</p>
            <p>招募開始時間：{new Date(etf.fundraising_start_date).toLocaleString()}</p>
            <p>招募結束時間：{new Date(etf.fundraising_end_date).toLocaleString()}</p>
            <p>招募時長：{etf.fundraising_duration} 月</p>
            <p>E.T.F時長：{etf.ETF_duration} 月</p>
            <p>狀態：{etf.state}</p>
            <p>招募進行中：{etf.is_fundraising ? "是" : "否"}</p>
            <p>進行中：{etf.is_progressing ? "是" : "否"}</p>
            <p>產品說明：{etf.description}</p>

            {/* Investment Amount Input */}
            {!isCreator && (
                <>
                    <input 
                        type="number" 
                        value={investmentAmount} 
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))} // Ensure it's a number
                        placeholder="Enter investment amount" 
                    />
                    <button onClick={() => handleJoin(etf.id, etf.name)} disabled={investmentAmount <= 0 || !etf.is_fundraising}>
                    {/* <button onClick={() => handleJoin(etf.id)} disabled={investmentAmount <= 0}> */}
                        Join ETF
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </>
            )}
            {/* Debugging information */}
            <p>========debug欄位========</p>
            <p>E.T.F ID：{etf.id}</p>
            <p>創建者：{etf.creator}</p>
            <p>用戶：{etf.users && etf.users.join(", ")}</p>
            {etf.can_delete && (
                <button onClick={handleDelete} style={{ backgroundColor: "red", color: "white" }}>
                    Delete ETF
                </button>
            )}
        </div>
    );
};

export default ETFDetail;
