import { useEffect, useState } from "react";
import useAxios from "../utils/useAxios";

const useFetchfunds = (announcingCurrentPage, fundraisingCurrentPage, searchParams) => {
    const [loading, setLoading] = useState(true);
    const [announcingfunds, setAnnouncingfunds] = useState([]);
    const [fundraisingfunds, setFundraisingfunds] = useState([]);
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

        const fetchfunds = async () => {
            setLoading(true);
            try {
                // Build search params query string for announcing funds
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
                // Fetch Announcing funds
                const announcingResponse = await axiosInstance.get(`search/?${announcingQueryString}`);
                console.log("Announcing funds Response:", announcingResponse.data);
                setAnnouncingfunds(announcingResponse.data.results);
                setAnnouncingPagination({ count: announcingResponse.data.count, next: announcingResponse.data.next, previous: announcingResponse.data.previous });

                // Build search params query string for fundraising funds
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

                // Fetch Fundraising funds
                const fundraisingResponse = await axiosInstance.get(`search/?${fundraisingQueryString}`);
                console.log("Fundraising funds Response:", fundraisingResponse.data);
                setFundraisingfunds(fundraisingResponse.data.results);
                setFundraisingPagination({ count: fundraisingResponse.data.count, next: fundraisingResponse.data.next, previous: fundraisingResponse.data.previous });
            } catch (error) {
                console.error("Error fetching funds:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchfunds();
    }, [announcingCurrentPage, fundraisingCurrentPage, searchParams]);

    return { loading, announcingfunds, fundraisingfunds, announcingPagination, fundraisingPagination };
};

export default useFetchfunds;
