import useAxios from "./useAxios";

const fetchUserETFs = async (tab, state, setETFs) => {
    const axiosInstance = useAxios();
    try {
        const params = {};
        if (tab && tab !== "all") {
            params.filter_tab = tab;
        }
        if (state && state !== "all") {
            params.filter_state = state;
        }
        console.log({"tab": tab, "state": state});
        let response;
        if (state === "progressing") {
            // Fetch ETFs with joined_date and leave_date for progressing tab
            response = await axiosInstance.get("/etfs/progressing/", { params });
        } else if (tab === "all") {
            console.log("fetching all etfs...");
            response = await axiosInstance.get("/etfs/", { params });
        } else {
            console.log("fetching user etfs...");
            response = await axiosInstance.get("/etfs/user/", { params });
        }

        setETFs(response.data);
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching ETFs:", error);
        setETFs([]); // Set ETFs to an empty array on error
    }
};

export default fetchUserETFs;