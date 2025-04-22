//return a string of a date following the "Month Day, Year HH:MM:SS" format of model.js
export default function today_date()  
{
    const options = {
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    }

    return new Date(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    
}
