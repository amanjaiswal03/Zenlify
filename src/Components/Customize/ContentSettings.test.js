import React from "react";
import { render, fireEvent, waitFor, describe, it, expect } from "@testing-library/react";
import ContentSettings from "./ContentSettings";
import jest from "jest";

// Mock the chrome.storage.sync object
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ isHideWidgets: false, blockAds: false })),
      set: jest.fn(),
    },
  },
};

describe("ContentSettings", () => {
  it("renders without crashing", () => {
    render(<ContentSettings />);
  });

  it("updates isHideWidgets state and calls chrome.storage.sync.set when switch is clicked", async () => {
    const { getByLabelText } = render(<ContentSettings />);
    const switchControl = getByLabelText("Distraction free youtube (hide 'suggestions' and ads)");

    fireEvent.click(switchControl);

    await waitFor(() => expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ isHideWidgets: true, blockAds: false }));
  });

  it("updates blockAds state and calls chrome.storage.sync.set when switch is clicked", async () => {
    const { getByLabelText } = render(<ContentSettings />);
    const switchControl = getByLabelText("Block common ads from websites");

    fireEvent.click(switchControl);

    await waitFor(() => expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ isHideWidgets: false, blockAds: true }));
  });
});