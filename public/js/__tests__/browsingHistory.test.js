if (typeof structuredClone === 'undefined') {
    global.structuredClone = function(obj) {
      return JSON.parse(JSON.stringify(obj));
    };
}

global.chrome = {
    runtime: {
      onInstalled: {
        addListener: jest.fn()
      },
      onMessage: {
        addListener: jest.fn()
      },
    },
    tabs: {
        onCreated: {
            addListener: jest.fn()
        },
        query: jest.fn(),
        onUpdated: {
            addListener: jest.fn()
        },
        onActivated: {
            addListener: jest.fn()
        },
    },
    storage: {
        sync: {
            get: jest.fn()
        },
        onChanged: {
            addListener: jest.fn()
        }
    },
    notifications: {
        create: jest.fn(),
        onButtonClicked: {
            addListener: jest.fn()
        }
    },
    idle: {
        queryState: jest.fn(),
        onStateChanged: {
            addListener: jest.fn()
        },
        setDetectionInterval: jest.fn()
    },
};

import { saveBrowsingHistory, formatTime, padZero, calculateTimeSpent, initBrowsingHistoryListeners } from '../browsingHistory';

// Mock IndexedDB using fake-indexeddb
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

global.indexedDB = new FDBFactory();
global.IDBKeyRange = FDBKeyRange;

// clear mock data before each test
beforeEach(() => {
    jest.clearAllMocks();
});




// Utility function to read from the mocked IndexedDB
const readFromIndexedDB = async (storeName) => {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open("browsingHistoryDB", 1);
            openRequest.onerror = () => reject(openRequest.error);
            openRequest.onsuccess = () => {
                const db = openRequest.result;
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            };
        });
};


describe('browsingHistory', () => {
    // Test for formatTime function
    it('formats time correctly', () => {
    expect(formatTime(3600000)).toEqual('01:00:00');
    expect(formatTime(61000)).toEqual('00:01:01');
    });

    // Test for padZero function
    it('pads zero correctly', () => {
    expect(padZero(5)).toEqual('05');
    expect(padZero(10)).toEqual('10');
    });

    // Test for saveBrowsingHistory
    it('saves browsing history correctly', async () => {
        const website = 'https://example.com';
        const timeSpent = 5000; // 5 seconds
        const visited = true;

        await saveBrowsingHistory(website, timeSpent, visited);
        
        const data = await readFromIndexedDB('browsingHistory');
        expect(data).toBeDefined();
        expect(data[0].website).toBe(website);
    });
  
    // Test for calculateTimeSpent
    it('calculates time spent correctly', async () => {
      const mockTab = { url: 'https://example.com' };
      const mockStartTime = Date.now() - 5000; // 5 seconds ago
      global.startTime = mockStartTime; // Assuming global startTime variable
  
      await calculateTimeSpent(mockTab, true);
  
      const data = await readFromIndexedDB('browsingHistory');
      expect(data[0]).toBeDefined();
      expect(data[0].timeSpent).toBeGreaterThanOrEqual(5000);
    });
  


    // Test for initBrowsingHistoryListeners
    it('initializes listeners correctly', () => {
        initBrowsingHistoryListeners();
        expect(chrome.tabs.onUpdated.addListener).toHaveBeenCalled();
        expect(chrome.tabs.onActivated.addListener).toHaveBeenCalled();
        expect(chrome.idle.onStateChanged.addListener).toHaveBeenCalled();
    });

  
});
