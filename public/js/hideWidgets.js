// List of CSS selectors for recommendation widgets
const widgetSelectors = [
    '#secondary', // Selector for YouTube's "watch next" section
    '.ad', // Common class for ads
    '[id^="google_ads_"]', // Google ads
    '[id^="div-gpt-ad"]', // Google Publisher Tag ads
    '.ytd-display-ad-renderer', // YouTube ads
    // Add more selectors as needed
];

// Function to hide widgets
function hideWidgets() {
    widgetSelectors.forEach(selector => {
        const widgets = document.querySelectorAll(selector);
        widgets.forEach(widget => {
            widget.style.display = 'none';
        });
    });
}

// Hide widgets initially
chrome.storage.sync.get('isHideWidgets', function(data) {
    console.log(data);
    if (data.isHideWidgets === true) {
        hideWidgets();
        // Set up a mutation observer to hide widgets when the page changes
        const observer = new MutationObserver(hideWidgets);
        observer.observe(document, { childList: true, subtree: true });
    }
});



