import { jest, describe, afterEach, expect, it } from "@jest/globals";

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
    update: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn()
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
};

// Import the module to be tested
const { initBlockedWebsitesListeners } = require("../blockedWebsites");

describe("Blocked Websites", () => {
  afterEach(() => {
    // Clear all mock function calls and instances between tests
    jest.clearAllMocks();
  });

  it("should update tab URL to \"blocked.html\" if the website is blocked", () => {
    // Mock the chrome.storage.sync.get method to return a list of blocked websites
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ blockedWebsites: ["example.com", "google.com"] });
    });

    // Mock the chrome.tabs.query method to return an active tab
    chrome.tabs.query.mockImplementation((queryInfo, callback) => {
      callback([{ id: 1 }]);
    });

    // Call the function to be tested
    initBlockedWebsitesListeners();

    // Simulate a tab update event
    chrome.tabs.onUpdated.addListener.mock.calls[0][0](1, { url: "https://example.com/page" }, { url: "https://example.com/page" });

    // Verify that the chrome.tabs.update method was called with the correct arguments
    expect(chrome.tabs.update).toHaveBeenCalledWith(1, { url: "blocked.html" });
  });

});
