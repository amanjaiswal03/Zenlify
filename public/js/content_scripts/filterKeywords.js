// Function to filter keywords in the DOM
function filterKeywords(keywords) {
  // Recursive function to traverse the DOM
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE && node.parentNode.tagName !== 'SCRIPT') {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.trim()}\\b`, 'gi');
        if (regex.test(node.textContent)) {
          const parent = node.parentNode;
          const grandParent = parent.parentNode;
          if (grandParent) {
            // Create a new paragraph element
            const paragraph = document.createElement('p');
            paragraph.style.color = 'orange';
            paragraph.textContent = 'Content contains blocked keyword';

            // Replace the parent element with the new paragraph
            grandParent.replaceChild(paragraph, parent);
          }
        }
      });
    } else {
      node.childNodes.forEach(child => traverse(child));
    }
  }

  // Start traversing from the body
  traverse(document.body);
}

// Get keywords from chrome.storage.sync and filter them initially
// Set up a mutation observer to filter keywords when the page changes
chrome.storage.sync.get('blockedKeywords', function(data) {
  if (data?.blockedKeywords) {
    filterKeywords(data.blockedKeywords);
  }
});