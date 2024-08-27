import useAxios from '../utils/useAxios';

const GET_ETFS_URL = 'etfs/';
const CREATE_ETF_URL = 'etfs/create/';
const DELETE_ETF_URL = (id) => `etfs/delete/${id}/`;

export const getETFs = () => {
    const axiosInstance = useAxios();
    return axiosInstance.get(GET_ETFS_URL);
};

export const createETF = (etf) => {
    const axiosInstance = useAxios();
    return axiosInstance.post(CREATE_ETF_URL, etf);
};

// Add this function to check if the ETF name exists
export const checkNameExists = (name) => {
    const axiosInstance = useAxios();
    return axiosInstance.get(`etfs/check-name-exists/`, {
        params: {
            name: name,
        },
    });
};

export const deleteETF = (id) => {
    const axiosInstance = useAxios();
    return axiosInstance.delete(DELETE_ETF_URL(id));
};