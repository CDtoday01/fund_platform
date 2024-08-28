import React, { useState, useEffect } from 'react';
import { createETF, checkNameExists } from '../../services/etfService'; // Add a service function for name check
import { Link, useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';

const CreateETF = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [total_amount, setTotalAmount] = useState('');
    const [lowest_amount, setLowestAmount] = useState('');
    
    const [utc_announcement_start_date, setUtcAnnouncementStartDate] = useState('');
    const [local_announcement_start_date, setLocalAnnouncementStartDate] = useState('');
    const [announcement_duration, setAnnouncementDuration] = useState('');
    const [utc_announcement_end_date, setUtcAnnouncementEndDate] = useState('');
    const [local_announcement_end_date, setLocalAnnouncementEndDate] = useState('');
    
    const [utc_fundraising_start_date, setUtcFundraisingStartDate] = useState('');
    const [local_fundraising_start_date, setLocalFundraisingStartDate] = useState('');
    const [fundraising_duration, setFundraisingDuration] = useState('');
    const [utc_fundraising_end_date, setUtcFundraisingEndDate] = useState('');
    const [local_fundraising_end_date, setLocalFundraisingEndDate] = useState('');

    const [ETF_duration, setETFDuration] = useState('');
    const [description, setDescription] = useState('');

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
                const start_date = utcToLocalISO(defaults.announcement_start_date)
                setType(defaults.etf_type || '');
                setLocalAnnouncementStartDate(start_date); // get time up to minutes
                setUtcAnnouncementStartDate(defaults.announcement_start_date);
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
    
    const handleAnnouncementStartDateChange = (localDate) => {
        setLocalAnnouncementStartDate(localDate);
        const utcDate = localToUtcISO(localDate);
        setUtcAnnouncementStartDate(utcDate);
    };

    const utcToLocalISO = (utcDateString) => {
        const localOffset = new Date().getTimezoneOffset() * 60 * 1000; // to milliseconds
        const localTimestamp = new Date(utcDateString).getTime() - localOffset;
        return new Date(localTimestamp).toISOString(); // Local ISO 8601 format
    };
    
    const localToUtcISO = (localDateString) => {
        const localOffset = new Date().getTimezoneOffset() * 60 * 1000; // to milliseconds
        const utcTimestamp = new Date(localDateString).getTime() + localOffset;
        return new Date(utcTimestamp).toISOString(); // UTC ISO 8601 format
    };
    
    // Update dates when announcement_start_date or announcement_duration change
    useEffect(() => {
        // This effect updates end dates based on the start date and duration
        if (local_announcement_start_date && announcement_duration) {
            // Calculate announcement end date
            const local_announcementEnd = new Date(local_announcement_start_date);
            local_announcementEnd.setDate(local_announcementEnd.getDate() + parseInt(announcement_duration));
            
            const localEndISO = local_announcementEnd.toISOString();
            const utcEndISO = localToUtcISO(localEndISO);
            
            // Set both local and UTC dates
            setLocalAnnouncementEndDate(localEndISO);
            setUtcAnnouncementEndDate(utcEndISO);
            setLocalFundraisingStartDate(localEndISO);
            setUtcFundraisingStartDate(utcEndISO);
            
            // Update fundraising end date if duration is present
            if (fundraising_duration) {
                const local_fundraisingEnd = new Date(local_announcementEnd);
                local_fundraisingEnd.setMonth(local_fundraisingEnd.getMonth() + parseInt(fundraising_duration));
                const localFundEndISO = local_fundraisingEnd.toISOString();
                setLocalFundraisingEndDate(localFundEndISO);
                setUtcFundraisingEndDate(localToUtcISO(localFundEndISO));
            }
        }
    }, [local_announcement_start_date, announcement_duration, fundraising_duration]);

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
            local_announcement_start_date,
            announcement_duration,
            local_fundraising_start_date,
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
                        value={local_announcement_start_date.slice(0, 16)}
                        onChange={(e) => handleAnnouncementStartDateChange(e.target.value + "Z")} // restore ISO 8601 format by adding utc indicator "Z".
                        required
                        style={{ borderColor: errors.local_announcement_start_date ? 'red' : '' }}
                        disabled={loading}
                    />
                    <input
                        type="datetime-local"
                        value={utc_announcement_start_date.slice(0, 16)}
                        disabled
                    />
                    {errors.local_announcement_start_date && <span style={{ color: 'red' }}>{errors.local_announcement_start_date}</span>}
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
                        value={local_announcement_end_date.slice(0, 16)}
                        disabled
                    />
                    <input
                        type="datetime-local"
                        value={utc_announcement_end_date.slice(0, 16)}
                        disabled
                    />
                </div>
                <div>
                    <label>招募開始時間：</label>
                    <input
                        type="datetime-local"
                        value={local_fundraising_start_date.slice(0, 16)}
                        disabled
                    />
                    <input
                        type="datetime-local"
                        value={utc_fundraising_start_date.slice(0, 16)}
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
                        value={local_fundraising_end_date.slice(0, 16)}
                        disabled
                    />
                    <input
                        type="datetime-local"
                        value={utc_fundraising_end_date.slice(0, 16)}
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
