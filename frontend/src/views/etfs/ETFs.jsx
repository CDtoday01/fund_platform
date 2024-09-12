import React, { useState, useEffect } from 'react';
import formatDate from '../../utils/formatDate';  // Ensure you have a date formatting utility
import fetchUserETFs from '../../utils/fetchUserETFs';
import { useNavigate } from 'react-router-dom';

const ETFs = () => {
    const [announcingETFs, setAnnouncingETFs] = useState([]);
    const [fundraisingETFs, setFundraisingETFs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchETFs = async () => {
            try {
                // Fetching ETFs based on their state
                await Promise.all([
                    fetchUserETFs('all', 'announcing', setAnnouncingETFs),
                    fetchUserETFs('all', 'fundraising', setFundraisingETFs),
                ]);
            } catch (error) {
                console.error('Error fetching ETFs:', error);
            }

            setLoading(false);
        };

        fetchETFs();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

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
                        {announcingETFs.length > 0 ? (
                            announcingETFs.map(etf => (
                                <tr key={etf.id} onClick={() => navigate(`/etfs/${etf.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>{etf.name}</td>
                                    <td>{etf.code}</td>
                                    <td>{formatDate(etf.fundraising_start_date)}</td>
                                    <td>{formatDate(etf.fundraising_end_date)}</td>
                                    <td>{etf.subcategory_name}</td>
                                    <td>{etf.ETF_duration}</td>
                                    <td>{etf.users.length}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7">No ETFs found.</td></tr>
                        )}
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
                        {fundraisingETFs.length > 0 ? (
                            fundraisingETFs.map(etf => (
                                <tr key={etf.id} onClick={() => navigate(`/etfs/${etf.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>{etf.name}</td>
                                    <td>{etf.code}</td>
                                    <td>{formatDate(etf.fundraising_start_date)}</td>
                                    <td>{formatDate(etf.fundraising_end_date)}</td>
                                    <td>{etf.subcategory_name}</td>
                                    <td>{etf.ETF_duration}</td>
                                    <td>{etf.users.length}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7">No ETFs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ETFs;
