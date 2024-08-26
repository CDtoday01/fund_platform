import React, { useState, useEffect } from 'react';
import { createETF } from '../../services/etfService';
import { Link, useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';

const CreateETF = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [total_amount, setTotalAmount] = useState('');
    const [lowest_amount, setLowestAmount] = useState('');
    const [fundraising_start_date, setFundraisingStartDate] = useState('');
    const [fundraising_duration, setFundraisingDuration] = useState('');
    const [announcement_start_date, setAnnouncementStartDate] = useState('');
    const [announcement_duration, setAnnouncementDuration] = useState('');
    const [ETF_duration, setETFDuration] = useState('');
    const [description, setDescription] = useState('');
    
    const [errors, setErrors] = useState({});
    const [nameExistsError, setNameExistsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.get('/etfs/defaults/');
                const defaults = response.data;
                setName(defaults.name || '');
                setType(defaults.etf_type || '');
                setTotalAmount(defaults.total_amount || '');
                setLowestAmount(defaults.lowest_amount || '');
                setFundraisingStartDate(defaults.fundraising_start_date || '');
                setFundraisingDuration(defaults.fundraising_duration || '');
                setAnnouncementStartDate(defaults.announcement_start_date || '');
                setAnnouncementDuration(defaults.announcement_duration || '');
                setETFDuration(defaults.ETF_duration || '');
                setDescription(defaults.description || '');
            } catch (error) {
                console.error('Error fetching default values:', error);
            }
        };
        fetchDefaults();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        // Check if name is already taken
        const nameExists = await checkNameExists(name);
        if (nameExists) {
            setNameExistsError(true);
            setLoading(false);
            return;
        } else {
            setNameExistsError(false);
        }

        const newETF = {
            name,
            type,
            total_amount,
            lowest_amount,
            fundraising_start_date,
            fundraising_duration,
            announcement_start_date,
            announcement_duration,
            ETF_duration,
            description
        };

        try {
            const response = await createETF(newETF);
            alert('ETF added successfully');
            setErrors({});
            navigate(`/etfs/${response.data.id}`);
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                console.error('Error adding ETF:', error.response.data);
                alert('Failed to add ETF. Please fix the errors and try again.');
            } else {
                console.error('Error adding ETF:', error.message);
                alert('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const checkNameExists = async (name) => {
        try {
            const axiosInstance = useAxios();
            const response = await axiosInstance.get(`/etfs/?name=${name}`);
            return response.data.length > 0;
        } catch (error) {
            console.error('Error checking ETF name:', error);
            return false; // Consider different handling here, like disabling submission
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>名稱：</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ borderColor: nameExistsError ? 'red' : '' }}
                        disabled={loading}
                    />
                    {nameExistsError && <span style={{ color: 'red' }}>Name already exists</span>}
                </div>
                <div>
                    <label>類別：</label>
                    <input
                        type="text"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                        style={{ borderColor: errors.etf_type ? 'red' : '' }}
                        disabled={loading}
                    />
                    {errors.etf_type && <span style={{ color: 'red' }}>{errors.etf_type}</span>}
                </div>
                <div>
                    <label>總金額（萬）：</label>
                    <input
                        type="number"
                        value={total_amount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        required
                        style={{ borderColor: errors.total_amount ? 'red': '' }}
                        disabled={loading}
                    />
                    {errors.total_amount && <span style={{ color: 'red'}}>{errors.total_amount}</span>}
                </div>
                <div>
                    <label>每單最低金額（萬）：</label>
                    <input
                        type="number"
                        value={lowest_amount}
                        onChange={(e) => setLowestAmount(e.target.value)}
                        required
                        style={{ borderColor: errors.lowest_amount ? 'red': '' }}
                        disabled={loading}
                    />
                    {errors.lowest_amount && <span style={{ color: 'red'}}>{errors.lowest_amount}</span>}
                </div>
                <div>
                    <label>公告開始時間：</label>
                    <input
                        type="datetime-local"
                        value={announcement_start_date}
                        onChange={(e) => setAnnouncementStartDate(e.target.value)}
                        required
                        style={{ borderColor: errors.announcement_start_date ? 'red' : '' }}
                        disabled={loading}
                    />
                    {errors.announcement_start_date && <span style={{ color: 'red' }}>{errors.announcement_start_date}</span>}
                </div>
                <div>
                    <label>公告時長（天）：</label>
                    <input
                        type="number"
                        value={announcement_duration}
                        onChange={(e) => setAnnouncementDuration(e.target.value)}
                        required
                        style={{ borderColor: errors.announcement_duration ? 'red' : '' }}
                        disabled={loading}
                        placeholder='7~30'
                    />
                    {errors.announcement_duration && <span style={{ color: 'red' }}>{errors.announcement_duration}</span>}
                </div>
                <div>
                    <label>招募開始時間：</label>
                    <input
                        type="datetime-local"
                        value={fundraising_start_date}
                        onChange={(e) => setFundraisingStartDate(e.target.value)}
                        required
                        style={{ borderColor: errors.fundraising_start_date ? 'red' : '' }}
                        disabled={loading}
                    />
                    {errors.fundraising_start_date && <span style={{ color: 'red' }}>{errors.fundraising_start_date}</span>}
                </div>
                <div>
                    <label>招募時長（月）：</label>
                    <input
                        type="number"
                        value={fundraising_duration}
                        onChange={(e) => setFundraisingDuration(e.target.value)}
                        required
                        style={{ borderColor: errors.fundraising_duration ? 'red' : '' }}
                        disabled={loading}
                        placeholder='1~6'
                    />
                    {errors.fundraising_duration && <span style={{ color: 'red' }}>{errors.fundraising_duration}</span>}
                </div>
                <div>
                    <label>存續時長（月）：</label>
                    <input
                        type="number"
                        value={ETF_duration}
                        onChange={(e) => setETFDuration(e.target.value)}
                        required
                        style={{ borderColor: errors.ETF_duration ? 'red' : '' }}
                        disabled={loading}
                        placeholder='3~36'
                    />
                    {errors.ETF_duration && <span style={{ color: 'red' }}>{errors.ETF_duration}</span>}
                </div>
                <div>
                    <label>產品說明：</label>
                    <textarea
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ borderColor: errors.description ? 'red' : '' }}
                        disabled={loading}
                        placeholder='請輸入產品說明。'
                    ></textarea>
                    {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add ETF'}
                </button>
            </form>
            <Link to="/user/etfs">
                <button disabled={loading}>Return to ETFs</button>
            </Link>
        </>
    );
};

export default CreateETF;
