import React, { useState, useEffect } from 'react';
import { createETF, checkNameExists } from '../../services/etfService'; // Add a service function for name check
import { Link, useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';

const CreateETF = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [total_amount, setTotalAmount] = useState('');
    const [lowest_amount, setLowestAmount] = useState('');
    const [announcement_start_date, setAnnouncementStartDate] = useState('');
    const [announcement_duration, setAnnouncementDuration] = useState('');
    const [fundraising_duration, setFundraisingDuration] = useState('');
    const [ETF_duration, setETFDuration] = useState('');
    const [description, setDescription] = useState('');

    const [announcement_end_date, setAnnouncementEndDate] = useState('');
    const [fundraising_start_date, setFundraisingStartDate] = useState('');
    const [fundraising_end_date, setFundraisingEndDate] = useState('');

    const [errors, setErrors] = useState({});
    const [nameExistsError, setNameExistsError] = useState(false); // Initialize as false
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const axiosInstance = useAxios();

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const response = await axiosInstance.get('/etfs/defaults/');
                const defaults = response.data;
                setName(defaults.name || '');
                setType(defaults.etf_type || '');
                setTotalAmount(defaults.total_amount || '');
                setLowestAmount(defaults.lowest_amount || '');
                setETFDuration(defaults.ETF_duration || '');
                setDescription(defaults.description || '');
            } catch (error) {
                console.error('Error fetching default values:', error);
            }
        };
        fetchDefaults();
    }, []);

    // Function to check if the name already exists in the database
    const handleNameBlur = async () => {
        if (name.trim() !== '') {
            try {
                const response = await checkNameExists(name); // Check if the name exists
                setNameExistsError(response.data.exists); // Update the error state
            } catch (error) {
                console.error('Error checking ETF name existence:', error);
            }
        }
    };

    // Update dates when announcement_start_date or announcement_duration change
    useEffect(() => {
        if (announcement_start_date && announcement_duration) {
            const announcementEnd = new Date(announcement_start_date);
            announcementEnd.setDate(announcementEnd.getDate() + parseInt(announcement_duration));
            console.log('test:', announcementEnd.toISOString().slice(0, 16));
            setAnnouncementEndDate(announcementEnd.toISOString().slice(0, 16)); // Convert to input value format

            const fundraisingStart = new Date(announcementEnd);
            setFundraisingStartDate(fundraisingStart.toISOString().slice(0, 16));

            if (fundraising_duration) {
                const fundraisingEnd = new Date(fundraisingStart);
                fundraisingEnd.setMonth(fundraisingEnd.getMonth() + parseInt(fundraising_duration));
                setFundraisingEndDate(fundraisingEnd.toISOString().slice(0, 16));
            }
        }
    }, [announcement_start_date, announcement_duration, fundraising_duration]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (nameExistsError) {
            alert('Name already exists. Please choose another name.');
            setLoading(false);
            return;
        }

        const newETF = {
            name,
            type,
            total_amount,
            lowest_amount,
            announcement_start_date,
            announcement_duration,
            fundraising_start_date,
            fundraising_duration,
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

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>名稱：</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameBlur} // Trigger the name check when input loses focus
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
                    <label>公告結束時間：</label>
                    <input
                        type="datetime-local"
                        value={announcement_end_date}
                        disabled
                    />
                </div>
                <div>
                    <label>招募開始時間：</label>
                    <input
                        type="datetime-local"
                        value={fundraising_start_date}
                        disabled
                    />
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
                    <label>招募結束時間：</label>
                    <input
                        type="datetime-local"
                        value={fundraising_end_date}
                        disabled
                    />
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
