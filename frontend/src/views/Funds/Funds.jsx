import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import useFetchFunds from "../../hooks/useFetchFunds"; 
import FundSearch from "./FundSearch"; 
import formatDate from "../../utils/formatDate";

const FundTable = ({ funds, onRowClick, title }) => (
    <>
        <h1>{title}</h1>
        <table className="table-box">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Fundraising Start</th>
                    <th>Fundraising End</th>
                    <th>Subcategory</th>
                    <th>Duration</th>
                    <th>Invested Amount</th>
                </tr>
            </thead>
            <tbody>
                {funds.length > 0 ? (
                    funds.map(fund => (
                        <tr key={fund.id} onClick={() => onRowClick(fund.id)} style={{ cursor: "pointer" }}>
                            <td>{fund.name}</td>
                            <td>{fund.code}</td>
                            <td>{formatDate(fund.fundraising_start_date)}</td>
                            <td>{formatDate(fund.fundraising_end_date)}</td>
                            <td>{fund.subcategory_name}</td>
                            <td>{fund.months} 月</td>
                            <td>{fund.current_investment ? fund.current_investment / 10000 : 0} 萬 / {fund.total_amount / 10000} 萬</td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="7">No funds found.</td></tr>
                )}
            </tbody>
        </table>
    </>
);

const PaginationControls = ({ hasNext, hasPrevious, onNext, onPrevious, labelNext, labelPrevious }) => (
    <div>
        {hasPrevious && (
            <button onClick={onPrevious} style={{ marginRight: "10px" }}>
                {labelPrevious}
            </button>
        )}
        {hasNext && (
            <button onClick={onNext}>
                {labelNext}
            </button>
        )}
    </div>
);

const funds = () => {
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

    const { loading, announcingfunds, fundraisingfunds, announcingPagination, fundraisingPagination } = useFetchFunds(announcingCurrentPage, fundraisingCurrentPage, searchParams);

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
                    {/* Pass the current search states to FundSearch */}
                    <FundSearch 
                        onSearch={handleSearch}
                        initialQuery={searchTerm}
                        initialCategory={searchCategory}
                        initialMonths={searchMonths}
                        initialStartDate={searchStartDate}
                        initialEndDate={searchEndDate}
                        initialShowClosed={searchShowClosed}
                    />
                    
                    <FundTable 
                        funds={announcingfunds} 
                        onRowClick={(id) => navigate(`/funds/${id}`)} 
                        title="Announcing Fund (coming soon)" 
                    />
                    
                    <PaginationControls 
                        hasNext={announcingPagination.next} 
                        hasPrevious={announcingPagination.previous}
                        onNext={() => setAnnouncingCurrentPage(prev => prev + 1)} 
                        onPrevious={() => setAnnouncingCurrentPage(prev => prev - 1)} 
                        labelNext="Next Announcing Page"
                        labelPrevious="Previous Announcing Page" 
                    />
                    
                    <FundTable 
                        funds={fundraisingfunds} 
                        onRowClick={(id) => navigate(`/funds/${id}`)} 
                        title="Fundraising Fund" 
                    />
                    
                    <PaginationControls 
                        hasNext={fundraisingPagination.next} 
                        hasPrevious={fundraisingPagination.previous}
                        onNext={() => setFundraisingCurrentPage(prev => prev + 1)} 
                        onPrevious={() => setFundraisingCurrentPage(prev => prev - 1)} 
                        labelNext="Next Fundraising Page"
                        labelPrevious="Previous Fundraising Page"
                    />
                </>
            )}
        </div>
    );
};

export default funds;
