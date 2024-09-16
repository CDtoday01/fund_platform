import React, { useState, useEffect } from "react";
import useAxios from "../../utils/useAxios";

const ETFFilter = ({ onCategoryChange, onSubcategoryChange, category_error, subcategory_error}) => {
    const [allSubcategories, setAllSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    
    const axiosInstance = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subcategories
                const response = await axiosInstance.get("/etfs/etf-types/");
                const data = response.data;

                // Set all subcategories
                setAllSubcategories(data);

                // Extract distinct categories
                const distinctCategories = [...new Set(data.map(subcat => subcat.category))];
                setCategories(distinctCategories);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            // Filter subcategories based on selected category
            const filtered = allSubcategories.filter(subcat => subcat.category === selectedCategory);
            setFilteredSubcategories(filtered);
        } else {
            setFilteredSubcategories([]);
        }
    }, [selectedCategory, allSubcategories]);

    const handleCategoryChange = (event) => {
        const newCategory = event.target.value;
        setSelectedCategory(newCategory);
        setSelectedSubcategory(""); // Reset subcategory when category changes
        onCategoryChange(newCategory); // Notify parent of category change
    };

    const handleSubcategoryChange = (event) => {
        const newSubcategory = event.target.value;
        setSelectedSubcategory(newSubcategory);
        onSubcategoryChange(newSubcategory); // Notify parent of subcategory change
    };

    return (
        <>
            <div>
                <label htmlFor="category-code">分類：</label>
                <select 
                    id="category-code"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="">選擇分類</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                {category_error && <span style={{ color: "red" }}>{category_error}</span>}
            </div>
            <div>
                <label htmlFor="subcategory-name">次類別：</label>
                <select
                    id="subcategory-name"
                    value={selectedSubcategory}
                    onChange={handleSubcategoryChange}
                    disabled={!selectedCategory}
                >
                    <option value="">選擇次類別</option>
                    {filteredSubcategories.map(subcat => (
                        <option key={subcat.subcategory_name} value={subcat.subcategory_name}>{subcat.subcategory_name}</option>
                    ))}
                </select>
                {subcategory_error && <span style={{ color: "red" }}>{subcategory_error}</span>}
            </div>
        </>
    );
};

export default ETFFilter;
