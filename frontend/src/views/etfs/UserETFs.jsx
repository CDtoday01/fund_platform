import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/tab.css";
import { useAuthStore } from "../../store/auth";
import formatDate from "../../utils/formatDate";
import fetchUserETFs from "../../utils/fetchUserETFs";
import useAxios from "../../utils/useAxios";

const UserETFs = () => {
    const [etfs, setETFs] = useState({ results: [], count: 0 });
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
    const [activeTab, setActiveTab] = useState("created");
    const [activeState, setActiveState] = useState("future");
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuthStore();
    const currentUserId = user ? user.user_id : null;

    useEffect(() => {
        // Auto-switch to "progressing" when the tab is "joined"
        if (activeTab === "joined") {
            setActiveState("progressing");
        }
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            fetchUserETFs(activeTab, activeState, setETFs, setPagination, currentPage);
        }
    }, [user, activeTab, activeState, currentPage]);

    const joinETF = async (etfId, etfName) => {
        if (window.confirm(`Are you sure you want to invest in ${etfName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`/etfs/${etfId}/join/`, {});
                if (response.status === 200) {
                    fetchUserETFs(activeTab, activeState, setETFs, setPagination, currentPage);
                    alert("Joined ETF!");
                } else {
                    console.error("Failed to join ETF:", response.data);
                }
            } catch (error) {
                console.error("Error joining ETF:", error);
            }
        }
    };

    const leaveETF = async (etfId, etfName) => {
        if (window.confirm(`Are you sure you want to refund and leave ${etfName}?`)) {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.post(`/etfs/${etfId}/leave/`, {});
                if (response.status === 200) {
                    fetchUserETFs(activeTab, activeState, setETFs, setPagination, currentPage);
                    alert("Left ETF!");
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

    const renderButton = (etf, tab) => {
        const isUserJoined = etf.users.includes(currentUserId);
        const isUserCreator = etf.creator === currentUserId;
        const isAnnouncing = etf.state === "announcing";
        const isDisabled = isUserCreator || isAnnouncing;

        if (tab === "other") {
            return (
                <button
                    className="join-button"
                    onClick={() => joinETF(etf.id, etf.name)}
                    disabled={isUserCreator || isAnnouncing}
                    title={isUserCreator ? "You can't join your own ETF" : isAnnouncing ? "Announcing ETFs can't be joined" : ""}
                >
                    Join
                </button>
            );
        } else if (tab === "joined") {
            if (isUserJoined) {
                return (
                    <button className="leave-button" onClick={() => leaveETF(etf.id, etf.name)}>Leave</button>
                );
            } else {
                return null;
            }
        } else {
            return <button className="join-button" disabled={isDisabled}>{isDisabled ? "Disabled" : "Join"}</button>;
        }
    };

    return (
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
                <table className="table-box">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
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
                            <th>Category</th>
                            <th>ETF Duration</th>
                            <th>Investor Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {etfs.results.map(etf => (
                            <tr key={etf.id} onClick={() => window.location.href = `/etfs/${etf.id}`} style={{ cursor: "pointer" }}>
                                <td>{etf.name}</td>
                                <td>{etf.code}</td>
                                {activeState === "progressing" ? (
                                    <>
                                        <td>{formatDate(etf.joined_date)}</td>
                                        <td>{etf.leave_date ? formatDate(etf.leave_date) : "Still joined"}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{formatDate(etf.fundraising_start_date)}</td>
                                        <td>{formatDate(etf.fundraising_end_date)}</td>
                                    </>
                                )}
                                <td>{etf.subcategory_name}</td>
                                <td>{etf.ETF_duration} months</td>
                                <td>{etf.users.length}</td>
                                <td onClick={(e) => { e.stopPropagation(); }}>
                                    {renderButton(etf, activeTab)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
    );
};

export default UserETFs;
