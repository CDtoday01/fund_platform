import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import useFetchETFs from "../../hooks/useFetchETFs"; 
import ETFSearch from "./ETFSearch"; 
import formatDate from "../../utils/formatDate";

const ETFTable = ({ etfs, onRowClick, title }) => (
    <>
        <h1>{title}</h1>
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
                {etfs.length > 0 ? (
                    etfs.map(etf => (
                        <tr key={etf.id} onClick={() => onRowClick(etf.id)} style={{ cursor: "pointer" }}>
                            <td>{etf.name}</td>
                            <td>{etf.code}</td>
                            <td>{formatDate(etf.fundraising_start_date)}</td>
                            <td>{formatDate(etf.fundraising_end_date)}</td>
                            <td>{etf.category}</td>
                            <td>{etf.months} 月</td>
                            <td>{etf.current_investment ? etf.current_investment / 10000 : 0} 萬 / {etf.total_amount / 10000} 萬</td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="7">No ETFs found.</td></tr>
                )}
            </tbody>
        </table>
    </>
);

const PaginationControls = ({ hasNext, onNext, label }) => (
    <div>
        {hasNext && (
            <button onClick={onNext}>{label}</button>
        )}
    </div>
);

const ETFs = () => {
    const [announcingCurrentPage, setAnnouncingCurrentPage] = useState(1);
    const [fundraisingCurrentPage, setFundraisingCurrentPage] = useState(1);

    // State to hold search params for persistence
    const [searchParams, setSearchParams] = useState({});
    const [searchTerm, setSearchTerm] = useState(""); // Search term state
    const [searchCategory, setSearchCategory] = useState("");
    const [searchMonths, setSearchMonths] = useState(null);
    const [searchStartDate, setSearchStartDate] = useState("");
    const [searchEndDate, setSearchEndDate] = useState("");
    const [searchShowClosed, setSearchShowClosed] = useState(false);

    const navigate = useNavigate(); 

    const { loading, announcingETFs, fundraisingETFs, announcingPagination, fundraisingPagination } = useFetchETFs(announcingCurrentPage, fundraisingCurrentPage, searchParams);

    const handleSearch = (params) => {
        // Update search params and individual state for persistence
        setSearchParams(params);
        setSearchTerm(params.query || "");
        setSearchCategory(params.category || "");
        setSearchMonths(params.months || null);
        setSearchStartDate(params.startDate || "");
        setSearchEndDate(params.endDate || "");
        setSearchShowClosed(params.showClosed || false);

        // Reset pagination
        setAnnouncingCurrentPage(1);
        setFundraisingCurrentPage(1);
    };

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* Pass the current search states to ETFSearch */}
                    <ETFSearch 
                        onSearch={handleSearch}
                        initialQuery={searchTerm}
                        initialCategory={searchCategory}
                        initialMonths={searchMonths}
                        initialStartDate={searchStartDate}
                        initialEndDate={searchEndDate}
                        initialShowClosed={searchShowClosed}
                    />
                    
                    <ETFTable 
                        etfs={announcingETFs} 
                        onRowClick={(id) => navigate(`/etfs/${id}`)} 
                        title="Announcing E.T.F (coming soon)" 
                    />
                    
                    <PaginationControls 
                        hasNext={announcingPagination.next} 
                        onNext={() => setAnnouncingCurrentPage(prev => prev + 1)} 
                        label="Next Announcing Page" 
                    />
                    
                    <ETFTable 
                        etfs={fundraisingETFs} 
                        onRowClick={(id) => navigate(`/etfs/${id}`)} 
                        title="Fundraising E.T.F" 
                    />
                    
                    <PaginationControls 
                        hasNext={fundraisingPagination.next} 
                        onNext={() => setFundraisingCurrentPage(prev => prev + 1)} 
                        label="Next Fundraising Page" 
                    />
                </>
            )}
        </div>
    );
};

export default ETFs;
