// create a date module that will be used in another file

// export method those the calling of the action

// export function getDate for home route
module.exports.getDate = getDate;  

function getDate(){
    let today = new Date();

    let option = {
        weekday: "long",
        // day: "numeric",
        // month: "long"
    };
    return today.toLocaleDateString("en-US", option)
    
}

// export function getDay for  work route
module.exports.getDay = getDay;
function getDay(){
    let today = new Date();

    let option = {
        weekday: "long",
        // day: "numeric",
        
    };
    return today.toLocaleDateString("en-US", option)
    
}
