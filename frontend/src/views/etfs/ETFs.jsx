import React, { useState, useEffect } from "react";
import formatDate from "../../utils/formatDate";
import fetchUserETFs from "../../utils/fetchUserETFs";
import { useNavigate } from "react-router-dom";

const ETFs = () => {
    const [announcingETFs, setAnnouncingETFs] = useState({ results: [], count: 0 });
    const [fundraisingETFs, setFundraisingETFs] = useState({ results: [], count: 0 });
    const [loading, setLoading] = useState(true);

    // Separate pagination states
    const [announcingPagination, setAnnouncingPagination] = useState({ next: null, previous: null, count: 0 });
    const [fundraisingPagination, setFundraisingPagination] = useState({ next: null, previous: null, count: 0 });

    // Separate current pages
    const [announcingCurrentPage, setAnnouncingCurrentPage] = useState(1);
    const [fundraisingCurrentPage, setFundraisingCurrentPage] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchETFs = async () => {
            try {
                // Fetch Announcing ETFs
                await fetchUserETFs("all", "announcing", setAnnouncingETFs, setAnnouncingPagination, announcingCurrentPage);
                
                // Fetch Fundraising ETFs
                await fetchUserETFs("all", "fundraising", setFundraisingETFs, setFundraisingPagination, fundraisingCurrentPage);
            } catch (error) {
                console.error("Error fetching ETFs:", error);
            }
    
            setLoading(false);
        };
    
        fetchETFs();
    }, [announcingCurrentPage, fundraisingCurrentPage]);  // Fetch ETFs when respective pages change

    const handleNextAnnouncingPage = () => {
        if (announcingPagination.next) {
            setAnnouncingCurrentPage((prev) => prev + 1);
        }
    };
    
    const handlePreviousAnnouncingPage = () => {
        if (announcingCurrentPage > 1) {
            setAnnouncingCurrentPage((prev) => prev - 1);
        }
    };

    const handleNextFundraisingPage = () => {
        if (fundraisingPagination.next) {
            setFundraisingCurrentPage((prev) => prev + 1);
        }
    };
    
    const handlePreviousFundraisingPage = () => {
        if (fundraisingCurrentPage > 1) {
            setFundraisingCurrentPage((prev) => prev - 1);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div>
                <h1>Announcing E.T.F (coming soon)</h1>
                <table className="table-box">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Fundraising Start</th>
                            <th>Fundraising End</th>
                            <th>Category</th>
                            <th>Duration</th>
                            <th>Invested Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcingETFs?.results?.length > 0 ? (
                            announcingETFs.results.map(etf => (
                                <tr key={etf.id} onClick={() => navigate(`/etfs/${etf.id}`)} style={{ cursor: "pointer" }}>
                                    <td>{etf.name}</td>
                                    <td>{etf.code}</td>
                                    <td>{formatDate(etf.fundraising_start_date)}</td>
                                    <td>{formatDate(etf.fundraising_end_date)}</td>
                                    <td>{etf.subcategory_name}</td>
                                    <td>{etf.ETF_duration} 月</td>
                                    <td>{etf.current_investment ? etf.current_investment / 10000 : 0} 萬 / {etf.total_amount / 10000} 萬</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7">No ETFs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <button 
                    disabled={!announcingPagination.previous} 
                    onClick={handlePreviousAnnouncingPage}
                >
                    Previous
                </button>
                <span>Page {announcingCurrentPage}</span>
                <button 
                    disabled={!announcingPagination.next} 
                    onClick={handleNextAnnouncingPage}
                >
                    Next
                </button>
            </div>

            <div>
                <h1>Fundraising E.T.F</h1>
                <table className="table-box">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Category</th>
                            <th>Fundraising Start</th>
                            <th>Fundraising End</th>
                            <th>Duration</th>
                            <th>Invested Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundraisingETFs.results.length > 0 ? (
                            fundraisingETFs.results.map(etf => (
                                <tr key={etf.id} onClick={() => navigate(`/etfs/${etf.id}`)} style={{ cursor: "pointer" }}>
                                    <td>{etf.name}</td>
                                    <td>{etf.code}</td>
                                    <td>{etf.subcategory_name}</td>
                                    <td>{formatDate(etf.fundraising_start_date)}</td>
                                    <td>{formatDate(etf.fundraising_end_date)}</td>
                                    <td>{etf.ETF_duration} 月</td>
                                    <td>{etf.current_investment ? etf.current_investment / 10000 : 0} 萬 / {etf.total_amount / 10000} 萬</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7">No ETFs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button 
                    disabled={!fundraisingPagination.previous} 
                    onClick={handlePreviousFundraisingPage}
                >
                    Previous
                </button>
                <span>Page {fundraisingCurrentPage}</span>
                <button 
                    disabled={!fundraisingPagination.next} 
                    onClick={handleNextFundraisingPage}
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default ETFs;
