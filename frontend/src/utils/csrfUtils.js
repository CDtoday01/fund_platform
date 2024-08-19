// Function to extract CSRF token from cookies
export const getCSRFToken = () => {
    const csrfCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('csrftoken='));
    if (!csrfCookie) {
        return null; // Handle case where CSRF token is not found
    }
    return csrfCookie.split('=')[1]; // Return the CSRF token value
};