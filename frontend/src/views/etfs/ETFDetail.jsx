import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';
import { deleteETF } from '../../services/etfService';

const ETFDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [etf, setETF] = useState(null);

    useEffect(() => {
        const axiosInstance = useAxios();
        axiosInstance.get(`/etfs/${id}/`)
            .then(response => {
                setETF(response.data);
                console.log(response.data);
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
            <p>類別：{etf.etf_type}</p>
            <p>總金額：{etf.total_amount}萬</p>
            <p>每單最低金額：{etf.lowest_amount}萬</p>
            <p>目前投資金額：{etf.current_investment}萬</p>
            <p>公告開始時間：{new Date(etf.announcement_start_date).toLocaleString()}</p>
            <p>公告結束時間：{new Date(etf.announcement_end_date).toLocaleString()}</p>
            <p>公告時長：{etf.announcement_duration} 日</p>
            <p>招募開始時間：{new Date(etf.fundraising_start_date).toLocaleString()}</p>
            <p>招募結束時間：{new Date(etf.fundraising_end_date).toLocaleString()}</p>
            <p>招募時長：{etf.fundraising_duration} 月</p>
            <p>ETF時長：{etf.ETF_duration} 月</p>
            <p>狀態：{etf.state}</p>
            <p>產品說明：{etf.description}</p>
            {/* debug */}
            <p>========debug欄位========</p>
            <p>ETF ID：{etf.id}</p>
            <p>創建者：{etf.creator}</p>
            <p>用戶：{etf.users && etf.users.join(', ')}</p>
            {etf.can_delete && (
                <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
                    Delete ETF
                </button>
            )}
        </div>
    );
};

export default ETFDetail;
