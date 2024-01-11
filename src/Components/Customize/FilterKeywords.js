import React, { useState, useEffect } from 'react';


const KeywordFilter = () => {
    const [keywords, setKeywords] = useState('');
    const [tagKeywords, setTagKeywords] = useState([]);

    useEffect(() => {
        // Code to run on component mount
        chrome.storage.sync.get(['blockedKeywords'], ({ blockedKeywords }) => {
            setTagKeywords(blockedKeywords);
        });
    }, []);

    useEffect(() => {
        // Code to run when isHideWidgets changes
        chrome.storage.sync.set({ blockedKeywords: tagKeywords});
    }, [tagKeywords]);

    const saveKeywords = () => {
        const keywordArray = keywords.split(',');
        setTagKeywords([...tagKeywords, ...keywordArray]);
        setKeywords('');
    };

    const removeKeyword = (keyword) => {
        const updatedKeywords = tagKeywords.filter((kw) => kw !== keyword);
        setTagKeywords(updatedKeywords);
    };

    return (
        <div>
            <label htmlFor="keywords">Distracting Keywords:</label><br />
            <input 
                type="text" 
                id="keywords" 
                name="keywords" 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)} 
            /><br />
            <button id="save" onClick={saveKeywords}>Save</button>

            <div>
                {tagKeywords.map((keyword) => (
                    <span key={keyword}>
                        {keyword}
                        <button onClick={() => removeKeyword(keyword)}>Remove</button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default KeywordFilter;