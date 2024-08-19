import React, { useState } from 'react';

const Filters = ({ onFilterChange }) => {
    const [filterTab, setFilterTab] = useState('all');
    const [filterState, setFilterState] = useState('all');

    const handleTabChange = (e) => {
        const selectedTab = e.target.value;
        setFilterTab(selectedTab);
        onFilterChange(selectedTab, filterState);
    };

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
        setFilterState(selectedState);
        onFilterChange(filterTab, selectedState);
    };

    return (
        <div>
            <label>
                Tab:
                <select value={filterTab} onChange={handleTabChange}>
                    <option value="all">All</option>
                    <option value="joined">Joined</option>
                    <option value="other">Other</option>
                </select>
            </label>
            <label>
                State:
                <select value={filterState} onChange={handleStateChange}>
                    <option value="all">All</option>
                    <option value="past">Past</option>
                    <option value="active">Active</option>
                    <option value="future">Future</option>
                </select>
            </label>
        </div>
    );
};

export default Filters;
