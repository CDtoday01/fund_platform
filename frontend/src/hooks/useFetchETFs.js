import { useEffect, useState } from "react";
import useAxios from "../utils/useAxios"; // Adjust the import path as necessary

const useFetchETFs = (announcingCurrentPage, fundraisingCurrentPage) => {
    const [loading, setLoading] = useState(false);
    const [announcingETFs, setAnnouncingETFs] = useState([]);
    const [fundraisingETFs, setFundraisingETFs] = useState([]);
    const [announcingPagination, setAnnouncingPagination] = useState({});
    const [fundraisingPagination, setFundraisingPagination] = useState({});

    const axiosInstance = useAxios();

    useEffect(() => {
        const fetchETFs = async () => {
            setLoading(true);
            try {
                // Fetch Announcing ETFs from Elasticsearch
                const announcingResponse = await axiosInstance.get(`search?state=announcing&page=${announcingCurrentPage}`);
                setAnnouncingETFs(announcingResponse.data.results);
                setAnnouncingPagination(announcingResponse.data.pagination);

                // Fetch Fundraising ETFs from Elasticsearch
                const fundraisingResponse = await axiosInstance.get(`search?state=fundraising&page=${fundraisingCurrentPage}`);
                setFundraisingETFs(fundraisingResponse.data.results);
                setFundraisingPagination(fundraisingResponse.data.pagination);
            } catch (error) {
                console.error("Error fetching ETFs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchETFs();
    }, [announcingCurrentPage, fundraisingCurrentPage, axiosInstance]);

    return { loading, announcingETFs, fundraisingETFs, announcingPagination, fundraisingPagination };
};

export default useFetchETFs;