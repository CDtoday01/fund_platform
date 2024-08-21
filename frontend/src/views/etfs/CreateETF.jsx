import React, { useState, useEffect } from 'react';
import { createETF } from '../../services/etfService';
import { Link, useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';

const CreateETF = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [fundraisingStart, setFundraisingStart] = useState('');
    const [fundraisingEnd, setFundraisingEnd] = useState('');
    const [existStart, setExistStart] = useState('');
    const [existEnd, setExistEnd] = useState('');
    const [currency, setCurrency] = useState('');
    const [roi, setRoi] = useState('');
    const [errors, setErrors] = useState({});
    const [nameExistsError, setNameExistsError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const axiosInstance = useAxios();
                const response = await axiosInstance.get('/etfs/defaults/');
                const defaults = response.data;
                setName(defaults.name);
                setType(defaults.etf_type);
                setFundraisingStart(defaults.fundraising_start);
                setFundraisingEnd(defaults.fundraising_end);
                setExistStart(defaults.exist_start);
                setExistEnd(defaults.exist_end);
                setCurrency(defaults.currency);
                setRoi(defaults.roi);
            } catch (error) {
                console.error('Error fetching default values:', error);
            }
        };
        fetchDefaults();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if name is already taken
        const nameExists = await checkNameExists(name);
        if (nameExists) {
            setNameExistsError(true);
            return;
        } else {
            setNameExistsError(false);
        }

        const newETF = {
            name,
            etf_type: type,
            fundraising_start: fundraisingStart,
            fundraising_end: fundraisingEnd,
            exist_start: existStart,
            exist_end: existEnd,
            currency,
            roi
        };

        try {
            const response = await createETF(newETF);
            alert('ETF added successfully');
            setErrors({});
            // Redirect to ETF detail page with the newly created ETF ID
            navigate(`/etfs/${response.data.id}`); // Ensure response.data.id matches your API's response
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                console.error('Error adding ETF:', error.response.data);
                alert('Failed to add ETF. Please fix the errors and try again.');
            } else {
                console.error('Error adding ETF:', error.message);
                alert('An unexpected error occurred.');
            }
        }
    };

    const checkNameExists = async (name) => {
        try {
            const axiosInstance = useAxios();
            const response = await axiosInstance.get(`/etfs/?name=${name}`);
            return response.data.length > 0;
        } catch (error) {
            console.error('Error checking ETF name:', error);
            return false;
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ borderColor: nameExistsError ? 'red' : '' }}
                    />
                    {nameExistsError && <span style={{ color: 'red' }}>Name already exists</span>}
                </div>
                <div>
                    <label>Type:</label>
                    <input
                        type="text"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                        style={{ borderColor: errors.etf_type ? 'red' : '' }}
                    />
                    {errors.etf_type && <span style={{ color: 'red' }}>{errors.etf_type}</span>}
                </div>
                <div>
                    <label>Fundraising Start (in UTC):</label>
                    <input
                        type="datetime-local"
                        value={fundraisingStart}
                        onChange={(e) => setFundraisingStart(e.target.value)}
                        required
                        style={{ borderColor: errors.fundraising_start ? 'red' : '' }}
                    />
                    {errors.fundraising_start && <span style={{ color: 'red' }}>{errors.fundraising_start}</span>}
                </div>
                <div>
                    <label>Fundraising End (in UTC):</label>
                    <input
                        type="datetime-local"
                        value={fundraisingEnd}
                        onChange={(e) => setFundraisingEnd(e.target.value)}
                        required
                        style={{ borderColor: errors.fundraising_end ? 'red' : '' }}
                    />
                    {errors.fundraising_end && <span style={{ color: 'red' }}>{errors.fundraising_end}</span>}
                </div>
                <div>
                    <label>Exist Start (in UTC):</label>
                    <input
                        type="datetime-local"
                        value={existStart}
                        onChange={(e) => setExistStart(e.target.value)}
                        required
                        style={{ borderColor: errors.exist_start ? 'red' : '' }}
                    />
                    {errors.exist_start && <span style={{ color: 'red' }}>{errors.exist_start}</span>}
                </div>
                <div>
                    <label>Exist End (in UTC):</label>
                    <input
                        type="datetime-local"
                        value={existEnd}
                        onChange={(e) => setExistEnd(e.target.value)}
                        required
                        style={{ borderColor: errors.exist_end ? 'red' : '' }}
                    />
                    {errors.exist_end && <span style={{ color: 'red' }}>{errors.exist_end}</span>}
                </div>
                <div>
                    <label>Currency:</label>
                    <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        required
                        style={{ borderColor: errors.currency ? 'red' : '' }}
                    />
                    {errors.currency && <span style={{ color: 'red' }}>{errors.currency}</span>}
                </div>
                <div>
                    <label>ROI:</label>
                    <input
                        type="number"
                        value={roi}
                        onChange={(e) => setRoi(e.target.value)}
                        required
                        style={{ borderColor: errors.roi ? 'red' : '' }}
                    />
                    {errors.roi && <span style={{ color: 'red' }}>{errors.roi}</span>}
                </div>
                <button type="submit">Add ETF</button>
            </form>
            <Link to="/etfs/user">
                <button>Return to ETFs</button>
            </Link>
        </>
    );
};

export default CreateETF;
