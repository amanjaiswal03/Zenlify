document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('addAchievement').addEventListener('click', function() {
        var achievement = document.getElementById('achievement').value;
        if (achievement) {
            var li = document.createElement('li');
            li.textContent = sanitizeInput(achievement);
            document.getElementById('achievementList').appendChild(li);
            document.getElementById('achievement').value = '';
        }
    });


    document.getElementById('inputForm').addEventListener('submit', function(event) {
        event.preventDefault();
        let achievement = '';
        var lis = document.getElementById('achievementList').getElementsByTagName('li');
        for (let i = 0; i < lis.length; i++) {
            achievement += lis[i].textContent;
            if (i < lis.length - 1) {
                achievement += ', '; // Add a comma and a space between achievement
            }
        }
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

    document.getElementById('nothingToLog').addEventListener('click', function(event) {
        event.preventDefault();
        let achievement = '';
        // Send the achievement (empty string in this case) to the background script
        chrome.runtime.sendMessage({ command: 'inputData', achievement }, function(response) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            } else {
                window.close();
            }
        });
    });
});


function sanitizeInput(input) {
    // Remove any non-alphanumeric characters, except for spaces and commas
    return input.replace(/[^a-zA-Z0-9 ,]/g, '');
}