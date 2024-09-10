import useAxios from './useAxios';

const fetchUserETFs = async (tab, state, setETFs) => {
    const axiosInstance = useAxios();
    try {
        const params = {}
        if (tab && tab !== 'all') {
            params.filter_tab = tab;
        }
        if (state && state !== 'all') {
            params.filter_state = state;
        }

        let response;

        if (tab === 'all' || state === 'all') {
            response = await axiosInstance.get('/etfs/', { params });
        } else {
            response = await axiosInstance.get('/etfs/user/', { params });
        }

        setETFs(response.data);
    } catch (error) {
        console.error('Error fetching ETFs:', error);
        setETFs([]);  // Set etfs to an empty array on error
    }
};

export default fetchUserETFs;