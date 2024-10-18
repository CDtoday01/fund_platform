import useAxios from './useAxios';

const fetchTransactions = async (state, setTransactions, setPagination, page = 1) => {
    const axiosInstance = useAxios();

    try {
        const params = { page };
        if (state) {
            params.filter_state = state;
        }

        const response = await axiosInstance.get(`/funds/user-fund-transactions/`, {params});
        // Ensure that we always have `results` in the response
        setTransactions({
            results: response.data.results || [],   // Fallback to an empty array
            count: response.data.count || 0         // Fallback to 0 count
        });
        console.log("transaction", response.data.results);
        
        setPagination({
            next: response.data.next,
            previous: response.data.previous,
            count: response.data.count,
        });

    } catch (error){
        console.error("There was an error fetching the transactions", error);
        setTransactions({ results: [], count: 0 });  // Set to default empty array on error
        setPagination({ next: null, previous: null, count: 0 });
    }

};

export default fetchTransactions;
