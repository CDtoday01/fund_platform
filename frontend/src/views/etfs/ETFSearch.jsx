import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";

const ETFSearch = ({ onSearch, type }) => {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [months, setMonths] = useState(null); // Start with null for "All Months"
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [categories, setCategories] = useState([]);
    const [showClosed, setShowClosed] = useState(false);

    const axiosInstance = useAxios();

    useEffect(() => {
        // Fetch categories on mount
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get("etfs/etf-types/");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();

        // Validate the start and end dates
        if (startDate && endDate && startDate > endDate) {
            alert("Start date cannot be later than end date.");
            return;
        }

        onSearch({ query, category, months, startDate, endDate, type, showClosed });
    };

    return (
        <form onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Search by name or code"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                    cat.subcategory_code && cat.subcategory_name ? ( // Check for valid category fields
                        <option key={cat.subcategory_code} value={cat.subcategory_code}>
                            {cat.subcategory_name}
                        </option>
                    ) : null
                ))}
            </select>
            
            <select 
                value={months === null ? "" : months} 
                onChange={(e) => setMonths(e.target.value ? parseInt(e.target.value) : null)}
            >
                <option value="">All Months</option>
                {[...Array(34)].map((_, i) => (
                    <option key={`month-${i + 3}`} value={i + 3}>
                        {i + 3}
                    </option>
                ))}
            </select>
            
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />

            <label>
                <input 
                    type="checkbox" 
                    checked={showClosed} 
                    onChange={() => setShowClosed(!showClosed)} 
                />
                Show Closed ETFs
            </label>
            
            <button type="submit">Search {type}</button>
        </form>
    );
};

export default ETFSearch;
