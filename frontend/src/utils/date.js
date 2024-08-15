export const formateDate = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}







