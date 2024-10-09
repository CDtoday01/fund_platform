import { useEffect, useState } from "react";
import useAxios from "../utils/useAxios";

const useFetchETFs = (announcingCurrentPage, fundraisingCurrentPage, searchParams) => {
    const [loading, setLoading] = useState(true);
    const [announcingETFs, setAnnouncingETFs] = useState([]);
    const [fundraisingETFs, setFundraisingETFs] = useState([]);
    const [announcingPagination, setAnnouncingPagination] = useState({});
    const [fundraisingPagination, setFundraisingPagination] = useState({});
    
    const axiosInstance = useAxios();

    useEffect(() => {
        const buildQueryParams = (params) => {
            const queryString = new URLSearchParams();
        
            for (const key in params) {
                if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
                    queryString.append(key, params[key]);
                }
            }
        
            return queryString.toString();
        };

        const fetchETFs = async () => {
            setLoading(true);
            try {
                // Build search params query string for announcing ETFs
                const announcingQueryString = buildQueryParams({
                    state: "announcing",
                    page: announcingCurrentPage,
                    q: searchParams.query,
                    category: searchParams.category || null,
                    months: searchParams.months || null,
                    start: searchParams.startDate || "",
                    end: searchParams.endDate || "",
                    showClosed: searchParams.showClosed || false,
                }).toString();
                // Fetch Announcing ETFs
                const announcingResponse = await axiosInstance.get(`search/?${announcingQueryString}`);
                console.log("Announcing ETFs Response:", announcingResponse.data);
                setAnnouncingETFs(announcingResponse.data.results);
                setAnnouncingPagination({ count: announcingResponse.data.count, next: announcingResponse.data.next, previous: announcingResponse.data.previous });

                // Build search params query string for fundraising ETFs
                const fundraisingQueryString = buildQueryParams({
                    state: "fundraising",
                    page: fundraisingCurrentPage,
                    q: searchParams.query,
                    category: searchParams.category || null,
                    months: searchParams.months || null,
                    start: searchParams.startDate || "",
                    end: searchParams.endDate || "",
                    showClosed: searchParams.showClosed || false,
                }).toString();

                // Fetch Fundraising ETFs
                const fundraisingResponse = await axiosInstance.get(`search/?${fundraisingQueryString}`);
                console.log("Fundraising ETFs Response:", fundraisingResponse.data);
                setFundraisingETFs(fundraisingResponse.data.results);
                setFundraisingPagination({ count: fundraisingResponse.data.count, next: fundraisingResponse.data.next, previous: fundraisingResponse.data.previous });
            } catch (error) {
                console.error("Error fetching ETFs:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchETFs();
    }, [announcingCurrentPage, fundraisingCurrentPage, searchParams]);

    return { loading, announcingETFs, fundraisingETFs, announcingPagination, fundraisingPagination };
};

export default useFetchETFs;
