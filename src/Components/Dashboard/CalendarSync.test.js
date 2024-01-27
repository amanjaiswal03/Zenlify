import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CalendarSync from './CalendarSync';

// Mock IndexedDB using fake-indexeddb
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';

// Mock the chrome.runtime and chrome.storage objects
global.chrome = {
    runtime: {
        lastError: null,
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn(),
        },
    },
    storage: {
        sync: {
            get: jest.fn((keys, callback) => callback({ googleSync: false })),
            set: jest.fn(),
        },
    },
    identity: {
        getAuthToken: jest.fn(),
        removeCachedAuthToken: jest.fn(),
    },
};

// Mock indexedDB
global.indexedDB = new FDBFactory();

describe('CalendarSync', () => {
    it('renders without crashing', () => {
        render(<CalendarSync />);
    });


    it('updates googleSync state and when button is clicked', async () => {
        const { getByText } = render(<CalendarSync />);
        const button = getByText('Add logs to google calendar');

        // Wrap the click event in act
        act(() => {
            fireEvent.click(button);
            // Mock the callback function passed to getAuthToken
            global.chrome.identity.getAuthToken.mock.calls[0][1]('mock-token');
        });

        // Check that getAuthToken is called with the correct parameters
        expect(global.chrome.identity.getAuthToken).toHaveBeenCalledWith({ 'interactive': true }, expect.any(Function));


        // Wait for the state update to be reflected in the DOM
        await waitFor(() => {
            expect(button.textContent).toBe('Stop adding logs to google calendar');
        });
    });

    it('calls the correct functions when button is clicked', () => {
        const { getByText } = render(<CalendarSync />);
        const button = getByText('Add logs to google calendar');

        fireEvent.click(button);

        expect(global.chrome.identity.getAuthToken).toHaveBeenCalled();
    });
});