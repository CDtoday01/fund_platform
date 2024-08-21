import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxios from '../../utils/useAxios';

const ETFs = () => {
    const [etfs, setETFs] = useState([]);

    const fetchActiveETFs = async () => {
        try {
            const axiosInstance = useAxios();
            const response = await axiosInstance.get(`/etfs/`);
            setETFs(response.data);
        } catch (error) {
            console.error("Error fetching active ETFs:", error);
        }
    };

    useEffect(() => {
        fetchActiveETFs();
    }, []);

    return (
        <div>
            <h1>Active ETFs</h1>
            <ul>
                {etfs.map(etf => (
                    <li key={etf.id}>
                        <Link to={`/etfs/${etf.id}`}>{etf.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ETFs;
