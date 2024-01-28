import React from "react";
import { render, fireEvent, waitFor, describe, it, expect } from "@testing-library/react";
import FilterKeywords from "./FilterKeywords";
import jest from "jest";

// Mock the chrome.storage.sync object
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ blockedKeywords: [] })),
      set: jest.fn(),
    },
  },
};

describe("FilterKeywords", () => {
  it("renders without crashing", () => {
    render(<FilterKeywords />);
  });

  it("updates keywords state when text field is changed", () => {
    const { getByLabelText } = render(<FilterKeywords />);
    const textField = getByLabelText("Enter keywords");

    fireEvent.change(textField, { target: { value: "test" } });

    expect(textField.value).toBe("test");
  });

  it("updates tagKeywords state and calls chrome.storage.sync.set when Save button is clicked", async () => {
    const { getByLabelText, getByText } = render(<FilterKeywords />);
    const textField = getByLabelText("Enter keywords");
    const saveButton = getByText("Save");

    fireEvent.change(textField, { target: { value: "test" } });
    fireEvent.click(saveButton);

    await waitFor(() => expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ blockedKeywords: ["test"] }));
  });

});