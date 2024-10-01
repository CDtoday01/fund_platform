import React, { useState } from "react";
import useFetchETFs from "../../hooks/useFetchETFs"; // Adjust the import path as necessary
import SearchBar from "./SearchBar"; // Adjust the import path as necessary

const ETFs = () => {
    const [announcingCurrentPage, setAnnouncingCurrentPage] = useState(1);
    const [fundraisingCurrentPage, setFundraisingCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useState({});

    // Fetch ETFs using the custom hook
    const { loading, announcingETFs, fundraisingETFs, announcingPagination, fundraisingPagination } = useFetchETFs(announcingCurrentPage, fundraisingCurrentPage);

    // Handle search
    const handleSearch = (params) => {
        setSearchParams(params);
        // Optionally, you might want to reset the pagination or trigger a fetch based on search params
        setAnnouncingCurrentPage(1); // Reset to first page on new search
        setFundraisingCurrentPage(1); // Reset to first page on new search
    };

    return (
        <div>
            <h1>ETFs</h1>
            <SearchBar onSearch={handleSearch} />
            
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>Announcing ETFs</h2>
                    {announcingETFs.length > 0 ? (
                        announcingETFs.map((etf) => (
                            <div key={etf.id}>
                                <h3>{etf.name}</h3>
                                {/* Include other ETF details here */}
                            </div>
                        ))
                    ) : (
                        <p>No announcing ETFs found.</p>
                    )}

                    <h2>Fundraising ETFs</h2>
                    {fundraisingETFs.length > 0 ? (
                        fundraisingETFs.map((etf) => (
                            <div key={etf.id}>
                                <h3>{etf.name}</h3>
                                {/* Include other ETF details here */}
                            </div>
                        ))
                    ) : (
                        <p>No fundraising ETFs found.</p>
                    )}

                    {/* Add pagination controls for announcing ETFs */}
                    <div>
                        {announcingPagination.hasNext && (
                            <button onClick={() => setAnnouncingCurrentPage(prev => prev + 1)}>Next Announcing Page</button>
                        )}
                    </div>

                    {/* Add pagination controls for fundraising ETFs */}
                    <div>
                        {fundraisingPagination.hasNext && (
                            <button onClick={() => setFundraisingCurrentPage(prev => prev + 1)}>Next Fundraising Page</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ETFs;
