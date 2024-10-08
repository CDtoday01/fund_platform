import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";

const ETFSearch = ({ onSearch, initialQuery, initialCategory, initialMonths, initialStartDate, initialEndDate, initialShowClosed }) => {
    const [query, setQuery] = useState(initialQuery || "");
    const [category, setCategory] = useState(initialCategory || "");
    const [months, setMonths] = useState(initialMonths || null); // Start with null for "All Months"
    const [startDate, setStartDate] = useState(initialStartDate || "");
    const [endDate, setEndDate] = useState(initialEndDate || "");
    const [categories, setCategories] = useState([]);
    const [showClosed, setShowClosed] = useState(initialShowClosed || false);

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
        onSearch({ query, category, months, startDate, endDate, showClosed });
    };

    // Reset handler
    const handleReset = () => {
        setQuery("");
        setCategory("");
        setMonths(null);
        setStartDate("");
        setEndDate("");
        setShowClosed(false);
        // Call onSearch with default parameters
        onSearch({
            query: "",
            category: "",
            months: null,
            startDate: "",
            endDate: "",
            showClosed: false,
        });
    };

    // Category change handler
    const handleCategoryChange = (e) => {
        setCategory(e.target.value); // Set the selected category/subcategory
    };

    return (
        <form onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Search by name or code"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <select value={category} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {Object.entries(
                    categories.reduce((acc, cat) => {
                        const { category: mainCategory, category_code, subcategory_name, subcategory_code } = cat;

                        // Check if the main category already exists in the accumulator object
                        if (!acc[mainCategory]) {
                            // If not, create an entry for the main category
                            acc[mainCategory] = {
                                category_code,       // Store the category_code of the main category
                                subcategories: []    // Initialize an empty array for subcategories
                            };
                        }

                        // Add the subcategory to the subcategories array, if it exists
                        if (subcategory_name && subcategory_code) {
                            acc[mainCategory].subcategories.push({
                                name: subcategory_name,
                                code: subcategory_code
                            });
                        }

                        return acc;  // Return the updated accumulator
                    }, {})  // Initialize with an empty object to accumulate categories and subcategories
                ).map(([mainCategory, { category_code, subcategories }]) => (
                    <React.Fragment key={category_code}>
                        <option value={category_code}>{mainCategory}</option>  {/* Main category */}
                        {subcategories.map((subcat) => (
                            <option key={subcat.code} value={subcat.code}>
                                {"----"} {subcat.name}  {/* Subcategory with indent */}
                            </option>
                        ))}
                    </React.Fragment>
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
            
            <button type="submit">Search</button>
            <button type="button" onClick={handleReset}>Reset</button> {/* Reset button */}
        </form>
    );
};

export default ETFSearch;

