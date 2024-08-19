import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { deleteETF } from '../../services/etfService';
const ETFDetail = () => {
    
    const { id } = useParams();
    const navigate = useNavigate();
    const [etf, setETF] = useState(null);

    useEffect(() => {
        axiosInstance.get(`/etfs/${id}/`)
            .then(response => {
                setETF(response.data);
            })
            .catch(error => {
                console.error('Error fetching ETF details:', error);
            });
    }, [id]);
    
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this ETF?");
        if (confirmed) {
            try {
                await deleteETF(id);
                alert('ETF deleted successfully');
                navigate('/etfs');
            } catch (error) {
                console.error('Error deleting ETF:', error);
                alert('Failed to delete ETF');
            }
        }
    };

    if (!etf) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{etf.name}</h1>
            <p>Type: {etf.etf_type}</p>
            <p>Fundraising Start: {etf.fundraising_start}</p>
            <p>Fundraising End: {etf.fundraising_end}</p>
            <p>Exist Start: {etf.exist_start}</p>
            <p>Exist End: {etf.exist_end}</p>
            <p>Currency: {etf.currency}</p>
            <p>ROI: {etf.roi}%</p>
            <p>Users: {etf.users}</p>
            {etf.can_delete && (
                <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
                    Delete ETF
                </button>
            )}
        </div>
    );
};

export default ETFDetail;
