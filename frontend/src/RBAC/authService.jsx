import useAxios from "../utils/useAxios";

export const getUserPermissions = async () => {
    const axiosInstance = useAxios()
    try {
        const response = await axiosInstance.get('company/user/permisses/')
        console.log('response6666',response.data.permissions)
        return response.data.permissions
    } catch (error) {
        console.error('Error fetching user permissions', error)
        return []        
    }
}