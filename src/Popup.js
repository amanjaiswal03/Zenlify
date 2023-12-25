// src/Popup.js
import React, { useState } from 'react';

function Popup() {
    const [url, setUrl] = useState('');

    const blockSite = () => {
        try {
            console.log(url);
            const newUrl = new URL("https://" + url);
            console.log(newUrl.hostname);
            chrome.storage.sync.get('blockedSites', ({ blockedSites }) => {
                const updatedBlockedSites = [...blockedSites, newUrl.hostname];
                chrome.storage.sync.set({ blockedSites: updatedBlockedSites }, () => {
                    console.log(`Blocked: ${newUrl}`);
                });
            });
        } catch (error) {
        console.error('Invalid URL:', url);
        }
    };
  

  return (
    <div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to block"
      />
      <button onClick={blockSite}>Block Site</button>
    </div>
  );
}

export default Popup;
