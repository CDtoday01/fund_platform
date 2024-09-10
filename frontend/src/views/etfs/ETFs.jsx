import React, { useState, useEffect } from 'react';
import formatDate from '../../utils/formatDate';  // Ensure you have a date formatting utility
import fetchUserETFs from '../../utils/fetchUserETFs';
const ETFs = () => {
    const [announcingETFs, setAnnouncingETFs] = useState([]);
    const [fundraisingETFs, setFundraisingETFs] = useState([]);
    useEffect(() =>{
        fetchUserETFs('all', 'announcing', setAnnouncingETFs);
        fetchUserETFs('all', 'fundraising', setFundraisingETFs);
        
    },[]);
    
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
                            <th>Investor Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcingETFs.map(etf => (
                            <tr key={etf.id} onClick={() => window.location.href = `/etfs/${etf.id}`} style={{ cursor: 'pointer' }}>
                                <td>{etf.name}</td>
                                <td>{etf.code}</td>
                                <td>{formatDate(etf.fundraising_start_date)}</td>
                                <td>{formatDate(etf.fundraising_end_date)}</td>
                                <td>{etf.subcategory_name}</td>
                                <td>{etf.ETF_duration}</td>
                                <td>{etf.users.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h1>Fundraising E.T.F</h1>
                <table className="table-box">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Fundraising Start</th>
                            <th>Fundraising End</th>
                            <th>Category</th>
                            <th>Duration</th>
                            <th>Investor Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundraisingETFs.map(etf => (
                            <tr key={etf.id} onClick={() => window.location.href = `/etfs/${etf.id}`} style={{ cursor: 'pointer' }}>
                                <td>{etf.name}</td>
                                <td>{etf.code}</td>
                                <td>{formatDate(etf.fundraising_start_date)}</td>
                                <td>{formatDate(etf.fundraising_end_date)}</td>
                                <td>{etf.subcategory_name}</td>
                                <td>{etf.ETF_duration}</td>
                                <td>{etf.users.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ETFs;
