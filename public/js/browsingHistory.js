// Define an array to store browsing history
let browsingHistory = [];

// Function to save browsing history
const saveBrowsingHistory = (website, timeSpent) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const existingEntry = browsingHistory.find(entry => entry.date===formattedDate && entry.website === website);
  console.log('SAVED!!!!')

  let formattedTimeSpent;

  if (existingEntry) {
    existingEntry.timesVisited++;
    existingEntry.timeSpent += timeSpent;
    existingEntry.formattedtimeSpent = formatTime(existingEntry.timeSpent);
    existingEntry.date = formattedDate;
  } else {
    browsingHistory.push({ website, timesVisited: 1, timeSpent, formattedTimeSpent, date: formattedDate });
  }

  // Save browsing history to chrome storage
  chrome.storage.sync.set({ ['browsingHistory-'+ formattedDate]: browsingHistory });
};


// Function to format time in HH:MM:SS format
const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
    return formattedTime;
};
  
// Function to pad zero for single-digit numbers
const padZero = (number) => {
    return number.toString().padStart(2, '0');
};

export { saveBrowsingHistory};