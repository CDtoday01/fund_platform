import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { deleteFund } from "../../services/FundService";
import { useAuthStore } from "../../store/auth";

const FundDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fund, setFund] = useState(null);
    const [investmentAmount, setInvestmentAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        const axiosInstance = useAxios();
        // Fetch Fund details
        axiosInstance.get(`/funds/${id}/`)
            .then(response => {
                setFund(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error fetching Fund details:", error);
            });
    }, [id]);
    
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this Fund?");
        if (confirmed) {
            try {
                await deleteFund(id);
                alert("Fund deleted successfully");
                navigate("/funds"); // Navigate to the Fund list after deletion
            } catch (error) {
                console.error("Error deleting Fund:", error);
                alert("Failed to delete Fund");
            }
        }
    };
    
    const handleJoin = async (fundId, fundName) => {
        if (investmentAmount <= 0) {
            setErrorMessage("Please enter a valid investment amount.");
            return;
        }
        if (window.confirm(`Are you sure you want to invest ${investmentAmount} in ${fundName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`/funds/${fundId}/join/`, { investment_amount: investmentAmount });
                console.log("Joined Fund:", response.data);
                if (response.status === 200) {
                    alert("Joined Fund!");
                    setInvestmentAmount(0); // Reset the investment amount after successful join
                    setErrorMessage(""); // Clear any previous error message
                    // Re-fetch the Fund details to update the state after joining
                    axiosInstance.get(`/funds/${id}/`)
                        .then(response => {
                            setFund(response.data); // Update the Fund details in the state
                            console.log(response.data);
                        })
                        .catch(error => {
                            console.error("Error fetching updated Fund details:", error);
                        });
                } else {
                    console.error("Failed to join Fund:", response.data);
                    setErrorMessage("Failed to join Fund. Please try again.");
                }
            } catch (error) {
                console.error("Error joining Fund:", error);
                setErrorMessage("An error occurred while joining the Fund.");
            }
        }
    };
     
    if (!fund || !currentUser) {
        return <div>Loading...</div>;
    }

    const isCreator = fund.creator === currentUser.user_id;
    const isInvestmentLimitReached = fund.current_investment >= fund.total_amount;

    return (
        <div>
            <h1>{fund.name}</h1>
            <p>分類：{fund.subcategory_name}</p>
            <p>總金額：{fund.total_amount / 10000}萬</p>
            <p>每單最低金額：{fund.lowest_amount / 10000}萬</p>
            <p>目前投資金額：{Math.round((fund.current_investment / 10000 + Number.EPSILON) * 100) / 100}萬</p> {/* 取到小數點後兩位*/}
            <p>公告開始時間：{new Date(fund.announcing_start_date).toLocaleString()}</p>
            <p>公告結束時間：{new Date(fund.announcing_end_date).toLocaleString()}</p>
            <p>公告時長：{fund.announcing_duration} 日</p>
            <p>招募開始時間：{new Date(fund.fundraising_start_date).toLocaleString()}</p>
            <p>招募結束時間：{new Date(fund.fundraising_end_date).toLocaleString()}</p>
            <p>招募時長：{fund.fundraising_duration} 月</p>
            <p>Fund時長：{fund.Fund_duration} 月</p>
            <p>狀態：{fund.state}</p>
            <p>招募進行中：{fund.is_fundraising ? "是" : "否"}</p>
            <p>進行中：{fund.is_progressing ? "是" : "否"}</p>
            <p>產品說明：{fund.description}</p>

            {/* Investment Amount Input */}
            {!isCreator && (
                <>
                    投入金額：
                    <input 
                        type="number" 
                        value={investmentAmount} 
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))} // Ensure it's a number
                        placeholder="Enter investment amount" 
                    />
                    <button 
                        onClick={() => handleJoin(fund.id, fund.name)} 
                        disabled={investmentAmount <= 0 || !fund.is_fundraising || isInvestmentLimitReached}
                    >
                        Join Fund
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {isInvestmentLimitReached && <p className="error-message">The Fund has reached its investment limit.</p>}
                </>
            )}
            {/* Debugging information */}
            <p>========debug欄位========</p>
            <p>Fund ID：{fund.id}</p>
            <p>創建者：{fund.creator}</p>
            <p>用戶：{fund.users && fund.users.join(", ")}</p>
            {fund.can_delete && (
                <button onClick={handleDelete} style={{ backgroundColor: "red", color: "white" }}>
                    Delete Fund
                </button>
            )}
        </div>
    );
};

export default FundDetail;
