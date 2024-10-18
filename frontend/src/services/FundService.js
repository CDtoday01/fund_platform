import useAxios from "../utils/useAxios";

const GET_funds_URL = "funds/";
const CREATE_Fund_URL = "funds/create/";
const DELETE_Fund_URL = (id) => `funds/delete/${id}/`;

export const getfunds = () => {
    const axiosInstance = useAxios();
    return axiosInstance.get(GET_funds_URL);
};

export const createFund = (fund) => {
    const axiosInstance = useAxios();
    return axiosInstance.post(CREATE_Fund_URL, fund);
};

// Add this function to check if the Fund name exists
export const checkNameExists = (name) => {
    const axiosInstance = useAxios();
    return axiosInstance.get(`funds/check-name-exists/`, {
        params: {
            name: name,
        },
    });
};

export const deleteFund = (id) => {
    const axiosInstance = useAxios();
    return axiosInstance.delete(DELETE_Fund_URL(id));
};