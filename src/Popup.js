// src/Popup.js
import React, { useState } from 'react';

function Popup() {
    const [url, setUrl] = useState('');
    const blockSite = () => {
    chrome.storage.sync.get('blockedSites', ({ blockedSites }) => {
      const updatedBlockedSites = [...blockedSites, new URL(url).hostname];
      chrome.storage.sync.set({ blockedSites: updatedBlockedSites }, () => {
        console.log(`Blocked: ${url}`);
      });
    });
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
