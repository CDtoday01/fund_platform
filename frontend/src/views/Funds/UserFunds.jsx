import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import formatDate from "../../utils/formatDate";
import fetchUserFunds from "../../utils/fetchUserFunds";
import useAxios from "../../utils/useAxios";
import fetchTransactions from "../../utils/fetchTransactions";
import "../../css/tab.css";

const Userfunds = () => {
    const [funds, setfunds] = useState({ results: [], count: 0 });
    const [transactions, setTransactions] = useState({ results: [], count: 0 });
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
    const [activeTab, setActiveTab] = useState("created");
    const [activeState, setActiveState] = useState("fundraising");
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuthStore();

    useEffect(() => {
        const updateActiveState = () => {
            // Auto-switch to "fundraising" when the tab is "joined", and its state is in forbidden categories.
            if (activeTab === "joined" && ["future", "announcing", "fundraising", "closed"].includes(activeState)) {
                setActiveState("progressing");
            // Do the same thing likewise, while switching from progressing to fundraising
            } else if (["created", "other"].includes(activeTab) && ["progressing", "completed"].includes(activeState)) {
                setActiveState("fundraising");
            } else {
                sendAPI();
            }
        }
        // Wait for the page to render before changing activeState
        if (user) {
            updateActiveState();
        }
    }, [user, activeTab]);

    const sendAPI = () => {
        if (activeTab === "joined") {
            fetchTransactions(activeState, setTransactions, setPagination, currentPage);
        } else {
            fetchUserFunds(activeTab, activeState, setfunds, setPagination, currentPage);
        }
    };

    useEffect(() => {
        if (user) {
            sendAPI();
        }
    }, [user, activeState, currentPage]);

    const leaveFund = async (transactionId, fundId, fundName, fundstate) => {
        if (fundstate === "closed") {
            alert("You cannot leave a closed Fund.");
            return;
        }
    
        if (window.confirm(`Are you sure you want to refund and leave ${fundName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`funds/transactions/${transactionId}/leave/`);
                if (response.status === 200) {
                    alert("Left Fund!");
                    // Re-fetch data based on the active tab after successfully leaving
                    sendAPI();
                } else {
                    console.error("Failed to leave Fund");
                }
            } catch (error) {
                console.error("Error leaving Fund:", error);
            }
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleStateChange = (state) => {
        setActiveState(state);
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && pagination.next) {
            setCurrentPage(prevPage => prevPage + 1);
        } else if (direction === 'previous' && pagination.previous) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const renderfundsTable = () => {
        // Filter the funds to only show open funds in the "Other funds" tab
        const filteredfunds = activeTab === "other" 
            ? funds.results.filter(fund => fund.is_open) 
            : funds.results;
    
        return (
            <table className="table-box">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Category</th>
                        {activeState === "progressing" ? (
                            <>
                                <th>Joined Date</th>
                                <th>Leave Date</th>
                            </>
                        ) : (
                            <>
                                <th>Fundraising Start</th>
                                <th>Fundraising End</th>
                            </>
                        )}
                        <th>Fund Duration</th>
                        <th>Invested Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredfunds && filteredfunds.length > 0 ? (
                        filteredfunds.map(fund => (
                            <tr key={fund.id}>
                                <td><Link to={`/funds/${fund.id}`}>{fund.name}</Link></td>
                                <td>{fund.code}</td>
                                <td>{fund.subcategory_name}</td>
                                {activeState === "progressing" ? (
                                    <>
                                        <td>{formatDate(fund.joined_date)}</td>
                                        <td>{formatDate(fund.leave_date)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{formatDate(fund.fundraising_start_date)}</td>
                                        <td>{formatDate(fund.fundraising_end_date)}</td>
                                    </>
                                )}
                                <td>{fund.Fund_duration} 月</td>
                                <td>{fund.current_investment ? Math.round((fund.current_investment / 10000 + Number.EPSILON) * 100) / 100 : 0} 萬 / {fund.total_amount / 10000} 萬</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No funds found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    };

    const renderTransactionsTable = () => {
        return (
            <table className="table-box">
                <thead>
                    <tr>
                        <th>Leave</th>
                        <th>Fund Name</th>
                        <th>Transaction Number</th>
                        <th>Category</th>
                        <th>Joined Date</th>
                        <th>Leave Date</th>
                        <th>Fund Duration</th>
                        <th>Raising Funds</th>
                        <th>Invested Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.results && transactions.results.length > 0 ? (
                        transactions.results.map(transaction => (
                            <tr key={transaction.id}>
                                <td>
                                    <button 
                                        onClick={() => leaveFund(transaction.id, transaction.fund, transaction.fund_name, transaction.state)} 
                                        disabled={transaction.state == "closed"}
                                    >
                                        ✖
                                    </button>
                                </td>
                                <td><Link to={`/funds/${transaction.fund}`}>{transaction.fund_name}</Link></td>
                                <td>{transaction.transaction_number}</td>
                                <td>{transaction.category_name}</td>
                                <td>{formatDate(transaction.joined_date)}</td>
                                <td>{formatDate(transaction.leave_date)}</td>
                                <td>{transaction.duration} 月</td>
                                <td>{transaction.is_fundraising ? "Yes" : "No"}</td>
                                <td>
                                    {transaction.investment_amount
                                        ? Math.round((transaction.investment_amount / 10000 + Number.EPSILON) * 100) / 100
                                        : 0} 萬 / {transaction.total_amount / 10000} 萬
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No funds found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    };

    return (
        <>
            <div>
                <h1>funds</h1>
                <Link to="/funds/new">
                    <button>Add Fund</button>
                </Link>
                <div className="tabs">
                    <button
                        className={activeTab === "created" ? "active" : ""}
                        onClick={() => handleTabChange("created")}
                        style={{ backgroundColor: activeTab === "created" ? "lightgreen" : "initial" }}
                    >
                        Created funds
                    </button>
                    <button
                        className={activeTab === "joined" ? "active" : ""}
                        onClick={() => handleTabChange("joined")}
                    >
                        Joined funds
                    </button>
                    <button
                        className={activeTab === "other" ? "active" : ""}
                        onClick={() => handleTabChange("other")}
                    >
                        Other funds
                    </button>
                </div>
                <div className="state-tabs">
                    <button
                        className={activeState === "future" ? "active" : ""}
                        onClick={() => handleStateChange("future")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Future funds
                    </button>
                    <button
                        className={activeState === "announcing" ? "active" : ""}
                        onClick={() => handleStateChange("announcing")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Announcing funds
                    </button>
                    <button
                        className={activeState === "fundraising" ? "active" : ""}
                        onClick={() => handleStateChange("fundraising")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Fundraising funds
                    </button>
                    <button
                        className={activeState === "closed" ? "active" : ""}
                        onClick={() => handleStateChange("closed")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Closed funds
                    </button>
                    <button
                        className={activeState === "progressing" ? "active" : ""}
                        onClick={() => handleStateChange("progressing")}
                        disabled={activeTab !== "joined"} // Disable for non-"joined" tabs
                    >
                        Progressing funds
                    </button>
                    <button
                        className={activeState === "completed" ? "active" : ""}
                        onClick={() => handleStateChange("completed")}
                        disabled={activeTab !== "joined"} // Disable for non-"joined" tabs
                    >
                        Completed funds
                    </button>
                </div>
                <div className="fund-list">
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange('previous')}
                            disabled={!pagination.previous}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange('next')}
                            disabled={!pagination.next}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            {activeTab !== "joined" && renderfundsTable()}
            {activeTab === "joined" && renderTransactionsTable()}
        </>
    );
};

export default Userfunds;
