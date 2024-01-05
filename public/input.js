document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('inputForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const achievement = document.getElementById('achievement').value;
        console.log(achievement);

        // Send the achievement to the background script
        chrome.runtime.sendMessage({ command: 'inputData', achievement }, function(response) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            } else {
                window.close();
            }
        });
    });
});