import React from "react";
import { render, fireEvent, waitFor, describe, it, expect } from "@testing-library/react";
import GeneralSettings from "./GeneralSettings";
import jest from "jest";

// Mock the chrome.storage.sync object
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ maxTabs: 0 })),
      set: jest.fn(),
    },
  },
};

describe("GeneralSettings", () => {
  it("renders without crashing", () => {
    render(<GeneralSettings />);
  });

  it("updates maxTabs state when text field is changed", () => {
    const { getByLabelText } = render(<GeneralSettings />);
    const textField = getByLabelText("Allowed number of open tabs");

    fireEvent.change(textField, { target: { value: "10" } });

    expect(textField.value).toBe("10");
  });

  it("calls chrome.storage.sync.set when maxTabs state is updated", async () => {
    const { getByLabelText } = render(<GeneralSettings />);
    const textField = getByLabelText("Allowed number of open tabs");

    fireEvent.change(textField, { target: { value: "10" } });

    await waitFor(() => expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ maxTabs: "10" }));
  });
});