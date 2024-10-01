import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [months, setMonths] = useState(null); // Start with null
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [categories, setCategories] = useState([]);

    const axiosInstance = useAxios();
    
    useEffect(() => {
        // Fetch categories
        const fetchCategories = async () => {
            const response = await axiosInstance.get("etfs/etf-types/");
            console.log("categories", response.data); // Log the fetched categories
            setCategories(response.data);
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({ query, category, months, startDate, endDate });
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
                    cat.subcategory_code && cat.subcategory_name ? ( // Check for id and name
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
            <button type="submit">Search</button>
        </form>
    );
};

export default SearchBar;
