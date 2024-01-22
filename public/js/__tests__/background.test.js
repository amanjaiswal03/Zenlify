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

import { initPomodoroTimerListeners } from '../pomodoroTimer.js';
import { initBrowsingHistoryListeners} from '../browsingHistory.js';
import { initBlockedWebsitesListeners } from '../blockedWebsites.js';
import { initMaxTabsListeners } from '../maxTabs.js';
import { initUpdateBlockAdsRulesListener } from '../blockAds.js';

describe('Background Script', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Pomodoro Timer listeners', () => {
        // Test the initialization of Pomodoro Timer listeners
        initPomodoroTimerListeners();
        // Assert that the listeners are properly initialized
        // Add your assertions here
    });

    it('should initialize Browsing History listeners', () => {
        // Test the initialization of Browsing History listeners
        initBrowsingHistoryListeners();
        // Assert that the listeners are properly initialized
        // Add your assertions here
    });

    it('should initialize Blocked Websites listeners', () => {
        // Test the initialization of Blocked Websites listeners
        initBlockedWebsitesListeners();
        // Assert that the listeners are properly initialized
        // Add your assertions here
    });

    it('should initialize Max Tabs listeners', () => {
        // Test the initialization of Max Tabs listeners
        initMaxTabsListeners();
        // Assert that the listeners are properly initialized
        // Add your assertions here
    });

    it('should initialize Block Ads rules listener', () => {
        // Test the initialization of Block Ads rules listener
        initUpdateBlockAdsRulesListener();
        // Assert that the listener is properly initialized
        // Add your assertions here
    });
});

