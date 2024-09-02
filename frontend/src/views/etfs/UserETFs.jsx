import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/tab.css';
import useAxios from '../../utils/useAxios';
import { useAuthStore } from '../../store/auth';

const UserETFs = () => {
    const [etfs, setETFs] = useState([]);
    const [activeTab, setActiveTab] = useState('joined');
    const [activeState, setActiveState] = useState('announcing');
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
                fetchUserETFs(activeTab, activeState);
                alert(`Joined ETF!`);
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
                    fetchUserETFs(activeTab, activeState);
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
        const isUserCreator = etf.creator === currentUserId;  // Assuming you have the creator info in the ETF data
        const isAnnouncing = etf.state === 'announcing';  // Assuming state is returned from the serializer
        const isDisabled = isUserCreator || isAnnouncing;

        if (tab === 'other') {
            return (
                <button
                    className="join-button"
                    onClick={() => joinETF(etf.id)}
                    disabled={isUserCreator || isAnnouncing}
                    title={isUserCreator ? "You can't join your own ETF" : isAnnouncing ? "Announcing ETFs can't be joined" : ""}
                >
                    Join
                </button>
            );
        } else if (tab === 'joined') {
            if (isUserJoined) {
                return (
                    <button className="leave-button" onClick={() => leaveETF(etf.id, etf.name)}>Leave</button>
                );
            } else {
                return null;
            }
        } else {
            return <button className="join-button" disabled={isDisabled}>{isDisabled ? 'Disabled' : 'Join'}</button>;
        }
    };

    return (
        <div>
            <h1>ETFs</h1>
            <div className="tabs">
                <button
                    className={activeTab === 'created' ? 'active' : ''}
                    onClick={() => handleTabChange('created')}
                    style={{ backgroundColor: activeTab === 'created' ? 'lightgreen' : 'initial' }}
                >
                    Created ETFs
                </button>
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
                    className={activeState === 'future' && activeTab !== 'joined' ? 'active' : ''}
                    onClick={() => handleStateChange('future')}
                    disabled={activeTab === 'joined'}
                >
                    Future ETFs
                </button>
                <button
                    className={activeState === 'announcing' && activeTab !== 'joined' ? 'active' : ''}
                    onClick={() => handleStateChange('announcing')}
                    disabled={activeTab === 'joined'}
                >
                    Announcing ETFs
                </button>
                <button
                    className={activeState === 'fundraising' && activeTab !== 'joined' ? 'active' : ''}
                    onClick={() => handleStateChange('fundraising')}
                    disabled={activeTab === 'joined'}
                >
                    Fundraising ETFs
                </button>
                <button
                    className={activeState === 'progressing' && activeTab !== 'joined' ? 'active' : ''}
                    onClick={() => handleStateChange('progressing')}
                    disabled={activeTab === 'joined'}
                >
                    Progressing ETFs
                </button>
                <button
                    className={activeState === 'past' && activeTab !== 'joined' ? 'active' : ''}
                    onClick={() => handleStateChange('past')}
                    disabled={activeTab === 'joined'}
                >
                    Past ETFs
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
