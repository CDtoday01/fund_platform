import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import formatDate from "../../utils/formatDate";
import fetchUserETFs from "../../utils/fetchUserETFs";
import useAxios from "../../utils/useAxios";
import fetchTransactions from "../../utils/fetchTransactions";
import "../../css/tab.css";

const UserETFs = () => {
    const [etfs, setETFs] = useState({ results: [], count: 0 });
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
            fetchUserETFs(activeTab, activeState, setETFs, setPagination, currentPage);
        }
    };

    useEffect(() => {
        if (user) {
            sendAPI();
        }
    }, [user, activeState, currentPage]);

    const leaveETF = async (transactionId, etfId, etfName, etfState) => {
        if (etfState === "closed") {
            alert("You cannot leave a closed ETF.");
            return;
        }
    
        if (window.confirm(`Are you sure you want to refund and leave ${etfName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`etfs/transactions/${transactionId}/leave/`);
                if (response.status === 200) {
                    alert("Left ETF!");
                    // Re-fetch data based on the active tab after successfully leaving
                    sendAPI();
                } else {
                    console.error("Failed to leave ETF");
                }
            } catch (error) {
                console.error("Error leaving ETF:", error);
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

    const renderETFsTable = () => {
        // Filter the ETFs to only show open ETFs in the "Other ETFs" tab
        const filteredETFs = activeTab === "other" 
            ? etfs.results.filter(etf => etf.is_open) 
            : etfs.results;
    
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
                        <th>ETF Duration</th>
                        <th>Invested Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredETFs && filteredETFs.length > 0 ? (
                        filteredETFs.map(etf => (
                            <tr key={etf.id}>
                                <td><Link to={`/etfs/${etf.id}`}>{etf.name}</Link></td>
                                <td>{etf.code}</td>
                                <td>{etf.subcategory_name}</td>
                                {activeState === "progressing" ? (
                                    <>
                                        <td>{formatDate(etf.joined_date)}</td>
                                        <td>{formatDate(etf.leave_date)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{formatDate(etf.fundraising_start_date)}</td>
                                        <td>{formatDate(etf.fundraising_end_date)}</td>
                                    </>
                                )}
                                <td>{etf.ETF_duration} 月</td>
                                <td>{etf.current_investment ? Math.round((etf.current_investment / 10000 + Number.EPSILON) * 100) / 100 : 0} 萬 / {etf.total_amount / 10000} 萬</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No ETFs found.</td>
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
                        <th>ETF Name</th>
                        <th>Transaction Number</th>
                        <th>Category</th>
                        <th>Joined Date</th>
                        <th>Leave Date</th>
                        <th>ETF Duration</th>
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
                                        onClick={() => leaveETF(transaction.id, transaction.etf, transaction.etf_name, transaction.state)} 
                                        disabled={transaction.state == "closed"}
                                    >
                                        ✖
                                    </button>
                                </td>
                                <td><Link to={`/etfs/${transaction.etf}`}>{transaction.etf_name}</Link></td>
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
                            <td colSpan="9">No ETFs found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    };

    return (
        <>
            <div>
                <h1>ETFs</h1>
                <Link to="/etfs/new">
                    <button>Add ETF</button>
                </Link>
                <div className="tabs">
                    <button
                        className={activeTab === "created" ? "active" : ""}
                        onClick={() => handleTabChange("created")}
                        style={{ backgroundColor: activeTab === "created" ? "lightgreen" : "initial" }}
                    >
                        Created ETFs
                    </button>
                    <button
                        className={activeTab === "joined" ? "active" : ""}
                        onClick={() => handleTabChange("joined")}
                    >
                        Joined ETFs
                    </button>
                    <button
                        className={activeTab === "other" ? "active" : ""}
                        onClick={() => handleTabChange("other")}
                    >
                        Other ETFs
                    </button>
                </div>
                <div className="state-tabs">
                    <button
                        className={activeState === "future" ? "active" : ""}
                        onClick={() => handleStateChange("future")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Future ETFs
                    </button>
                    <button
                        className={activeState === "announcing" ? "active" : ""}
                        onClick={() => handleStateChange("announcing")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Announcing ETFs
                    </button>
                    <button
                        className={activeState === "fundraising" ? "active" : ""}
                        onClick={() => handleStateChange("fundraising")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Fundraising ETFs
                    </button>
                    <button
                        className={activeState === "closed" ? "active" : ""}
                        onClick={() => handleStateChange("closed")}
                        disabled={activeTab === "joined"} // Disable for "joined" tab
                    >
                        Closed ETFs
                    </button>
                    <button
                        className={activeState === "progressing" ? "active" : ""}
                        onClick={() => handleStateChange("progressing")}
                        disabled={activeTab !== "joined"} // Disable for non-"joined" tabs
                    >
                        Progressing ETFs
                    </button>
                    <button
                        className={activeState === "completed" ? "active" : ""}
                        onClick={() => handleStateChange("completed")}
                        disabled={activeTab !== "joined"} // Disable for non-"joined" tabs
                    >
                        Completed ETFs
                    </button>
                </div>
                <div className="etf-list">
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
            {activeTab !== "joined" && renderETFsTable()}
            {activeTab === "joined" && renderTransactionsTable()}
        </>
    );
};

export default UserETFs;
