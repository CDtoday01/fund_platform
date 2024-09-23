import useAxios from "./useAxios";

const fetchUserETFs = async (tab, state, setETFs, setPagination, page = 1) => {
    const axiosInstance = useAxios();
    try {
        const params = { page };
        if (tab && tab !== "all") {
            params.filter_tab = tab;
        }
        if (state && state !== "all") {
            params.filter_state = state;
        }

        let response;
        if (tab === "all") {
            response = await axiosInstance.get("/etfs/", { params });
        } else {
            response = await axiosInstance.get("/etfs/user/", { params });
        }
        // Ensure that we always have `results` in the response
        setETFs({
            results: response.data.results || [],  // Fallback to an empty array
            count: response.data.count || 0,       // Fallback to 0 count
        });

        console.log(response.data.results);

        setPagination({
            next: response.data.next,
            previous: response.data.previous,
            count: response.data.count,
        });
    } catch (error) {
        console.error("Error fetching ETFs:", error);
        setETFs({ results: [], count: 0 });  // Set to default empty array on error
        setPagination({ next: null, previous: null, count: 0 });
    }
};

export default fetchUserETFs;