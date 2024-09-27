import React, { useState } from 'react';

const ETFsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async (event) => {
        event.preventDefault();
        const response = await fetch(`/search/?q=${searchTerm}`);
        const data = await response.json();
        setResults(data.hits.hits);  // Adjust based on your Elasticsearch response structure
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ETFs"
                />
                <button type="submit">Search</button>
            </form>
            <div>
                {results.map(result => (
                    <div key={result._id}>{result._source.name}</div>  // Adjust to display desired fields
                ))}
            </div>
        </div>
    );
};

export default ETFsPage;
