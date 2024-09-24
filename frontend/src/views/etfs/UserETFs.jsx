import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/tab.css";
import { useAuthStore } from "../../store/auth";
import formatDate from "../../utils/formatDate";
import fetchUserETFs from "../../utils/fetchUserETFs";
import useAxios from "../../utils/useAxios";
import fetchTransactions from "../../utils/fetchTransactions";

const UserETFs = () => {
    const [etfs, setETFs] = useState({ results: [], count: 0 });
    const [transactions, setTransactions] = useState({ results: [], count: 0 });
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
    const [activeTab, setActiveTab] = useState("created");
    const [activeState, setActiveState] = useState("fundraising");
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuthStore();
    const currentUserId = user ? user.user_id : null;

    useEffect(() => {
        // Auto-switch to "progressing" when the tab is "joined", and its state is in forbidden categories.
        if (activeTab === "joined" && ["created", "announcing", "fundraising"].includes(activeState)) {
            setActiveState("progressing");
        }
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            if (activeTab === "joined") {
                fetchTransactions(activeState, setTransactions, setPagination, currentPage);
            } else {
                fetchUserETFs(activeTab, activeState, setETFs, setPagination, currentPage);
            }
            
        }
    }, [user, activeTab, activeState, currentPage]);

    const leaveETF = async (etfId, etfName) => {
        if (window.confirm(`Are you sure you want to refund and leave ${etfName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`/etfs/${etfId}/leave/`);
                if (response.status === 200) {
                    fetchUserETFs(activeTab, activeState, setETFs, setPagination, currentPage);
                    alert("Left ETF!");
                    navigate(0);
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
                    {etfs.results && etfs.results.length > 0 ? (
                        etfs.results.map(etf => (
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
                                <td>{etf.current_investment ? Math.round((etf.current_investment / 10000 + Number.EPSILON) * 100)/ 100 : 0} 萬 / {etf.total_amount / 10000} 萬</td>
                            </tr>
                            ))
                        ): (
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
                    {transactions.results.map(transaction => (
                        <tr key={transaction.id}>
                            <td>
                                <button onClick={() => leaveETF(transaction.etf, transaction.etf_name)}>✖</button>
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
                    ))}
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
                        className={activeState === "future" && activeTab !== "joined" ? "active" : ""}
                        onClick={() => handleStateChange("future")}
                        disabled={activeTab === "joined"}
                    >
                        Future ETFs
                    </button>
                    <button
                        className={activeState === "announcing" && activeTab !== "joined" ? "active" : ""}
                        onClick={() => handleStateChange("announcing")}
                        disabled={activeTab === "joined"}
                    >
                        Announcing ETFs
                    </button>
                    <button
                        className={activeState === "fundraising" && activeTab !== "joined" ? "active" : ""}
                        onClick={() => handleStateChange("fundraising")}
                        disabled={activeTab === "joined"}
                    >
                        Fundraising ETFs
                    </button>
                    <button
                        className={activeState === "progressing" ? "active" : ""}
                        onClick={() => handleStateChange("progressing")}
                    >
                        Progressing ETFs
                    </button>
                    <button
                        className={activeState === "past" ? "active" : ""}
                        onClick={() => handleStateChange("past")}
                    >
                        Past ETFs
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
