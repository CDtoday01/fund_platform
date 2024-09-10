const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();  // Locale-aware formatting
};

export default formatDate