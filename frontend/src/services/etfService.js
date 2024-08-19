import axiosInstance from '../utils/axiosInstance';

const GET_ETFS_URL = 'etfs/';
const CREATE_ETF_URL = 'etfs/create/';
const DELETE_ETF_URL = (id) => `etfs/delete/${id}/`;

export const getETFs = () => {
    return axiosInstance.get(GET_ETFS_URL);
};

export const createETF = (etf) => {
    return axiosInstance.post(CREATE_ETF_URL, etf);
};

export const deleteETF = (id) => {
    return axiosInstance.delete(DELETE_ETF_URL(id));
};