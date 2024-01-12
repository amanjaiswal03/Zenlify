let intervalId = null;
// Function to start the timer
function restStartTimer(restTime) {
    intervalId = setInterval(() => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '../images/zenlify_logo.png', // Replace with your icon
            title: 'Rest Time',
            message: 'Time to take rest from the screen!!'
        });
        restStopTimer();
    }, restTime * 60 * 1000); // Convert minutes to milliseconds
    console.log(intervalId);
}

// Function to stop the timer
function restStopTimer() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

export { restStartTimer, restStopTimer};