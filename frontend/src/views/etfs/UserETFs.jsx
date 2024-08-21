import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/tab.css';
import useAxios from '../../utils/useAxios';
import { useAuthStore } from '../../store/auth';

const UserETFs = () => {
    const [etfs, setETFs] = useState([]);
    const [activeTab, setActiveTab] = useState('joined');
    const [activeState, setActiveState] = useState('active');
    const { user } = useAuthStore();
    const currentUserId = user ? user.user_id : null;
    
    useEffect(() => {
        if (user) {
            fetchUserETFs(activeTab, activeState);
        }
    }, [user, activeTab, activeState]);

    const fetchUserETFs = async (tab, state) => {
        const axiosInstance = useAxios();
        try {
            const params = {
                filter_tab: tab,
                filter_state: state,
            };
            const response = await axiosInstance.get('/etfs/user/', { params });
            console.log(response);
            setETFs(response.data);
        } catch (error) {
            console.error('Error fetching ETFs:', error);
            setETFs([]); // Set etfs to an empty array on error
        }
    };

    const joinETF = async (etfId) => {
        try {
            const axiosInstance = useAxios();
            const response = await axiosInstance.post(`/etfs/${etfId}/join/`, {});
            if (response.status === 200) {
                setETFs(prevETFs => prevETFs.map(etf => {
                    if (etf.id === etfId) {
                        return { ...etf, users: [...etf.users, currentUserId] };
                    }
                    return etf;
                }));
                alert(`Joined ETF ${etfId}!`);
            } else {
                console.error('Failed to join ETF:', response.data);
            }
        } catch (error) {
            console.error('Error joining ETF:', error);
        }
    };

    const leaveETF = async (etfId, etfName) => {
        try {
            const axiosInstance = useAxios();
            const response = await axiosInstance.post(`/etfs/${etfId}/leave/`, {});
            if (response.status === 200) {
                if (window.confirm(`Are you sure you want to refund and leave ${etfName}?`)) {
                    setETFs(prevETFs => prevETFs.map(etf => {
                        if (etf.id === etfId) {
                            return { ...etf, users: etf.users.filter(userId => userId !== currentUserId) };
                        }
                        return etf;
                    }));
                }
            } else {
                console.error('Failed to leave ETF');
            }
        } catch (error) {
            console.error('Error leaving ETF:', error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleStateChange = (state) => {
        setActiveState(state);
    };

    const renderButton = (etf, tab) => {
        const isUserJoined = etf.users.includes(currentUserId);
        
        if (tab === 'other') {
            return (
                <button className="join-button" onClick={() => joinETF(etf.id)}>Join</button>
            );
        } else if (tab === 'joined') {
            if (isUserJoined) {
                return (
                    <button className="leave-button" onClick={() => leaveETF(etf.id, etf.name)}>Leave</button>
                );
            } else {
                return null;
            }
        }
    };

    return (
        <div>
            <h1>ETFs</h1>
            <div className="tabs">
                <button
                    className={activeTab === 'joined' ? 'active' : ''}
                    onClick={() => handleTabChange('joined')}
                >
                    Joined ETFs
                </button>
                <button
                    className={activeTab === 'other' ? 'active' : ''}
                    onClick={() => handleTabChange('other')}
                >
                    Other ETFs
                </button>
                <Link to="/etfs/new">
                    <button>Add ETF</button>
                </Link>
            </div>
            <div className="state-tabs">
                <button
                    className={activeState === 'past' ? 'active' : ''}
                    onClick={() => handleStateChange('past')}
                >
                    Past ETFs
                </button>
                <button
                    className={activeState === 'active' ? 'active' : ''}
                    onClick={() => handleStateChange('active')}
                >
                    Active ETFs
                </button>
                <button
                    className={activeState === 'future' ? 'active' : ''}
                    onClick={() => handleStateChange('future')}
                >
                    Future ETFs
                </button>
            </div>
            <div className="etf-list">
                <ul>
                    {etfs.map(etf => (
                        <li key={etf.id}>
                            <Link to={`/etfs/${etf.id}`}>{etf.name}</Link>
                            {renderButton(etf, activeTab)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserETFs;
