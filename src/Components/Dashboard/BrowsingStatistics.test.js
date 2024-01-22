if (typeof structuredClone === 'undefined') {
    global.structuredClone = function(obj) {
      return JSON.parse(JSON.stringify(obj));
    };
}

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import BrowsingStatistics from './BrowsingStatistics';

// Mock IndexedDB using fake-indexeddb
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

global.chrome = {
    storage: {
        sync: {
            get: jest.fn(),
            set: jest.fn(),
        },
    },
};


// Mock indexedDB
global.indexedDB = new FDBFactory();
global.IDBKeyRange = FDBKeyRange;

const saveToIndexedDB = (entry) => {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open("browsingHistoryDB", 1);
        
        openRequest.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('browsingHistory')) {
                // Use a single key or handle compound key differently
                db.createObjectStore('browsingHistory', { keyPath: ['formattedDate', 'website'] }); 
            }
        };

        openRequest.onerror = () => reject(openRequest.error);

        openRequest.onsuccess = async () => {
            const db = openRequest.result;
            const transaction = db.transaction(['browsingHistory'], 'readwrite');
            const store = transaction.objectStore('browsingHistory');

            
            store.add(entry).onsuccess = () => {
                transaction.oncomplete = () => {
                    resolve();
                };
                transaction.onerror = () => {
                    console.log(transaction.error);
                    reject(transaction.error);
                };
            };

            
        };
    });
};

describe('BrowsingStatistics', () => {

    test('renders without crashing', () => {
        render(<BrowsingStatistics />);
    });

    test('renders table with browsing history data', async () => {

        const browsingHistoryData = {
            website: 'Website 1',
            timesVisited: 1,
            timeSpent: 10000,
            formattedTimeSpent: '00:00:10',
            formattedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };

        await saveToIndexedDB(browsingHistoryData);


        const { getAllByText } = render(<BrowsingStatistics />);
    
        // Wait for the component to fetch data
        await waitFor(() => {
            expect(getAllByText('Website 1')).toBeTruthy();
            expect(getAllByText('00:00:10')).toBeTruthy();
        });
      });
});