import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import BlockedWebsites from "./BlockedWebsites";


// Mock the chrome.storage.sync object
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((key, callback) => callback({ blockedWebsites: [] })),
      set: jest.fn(),
    },
  },
};

describe("BlockedWebsites", () => {
  it("renders without crashing", () => {
    render(<BlockedWebsites />);
  });

  it("adds a website to the blocked list", async () => {
    const { getByPlaceholderText, getByText } = render(<BlockedWebsites />);
    const input = getByPlaceholderText("Enter website URL");
    const button = getByText("Add to Blocked List");

    fireEvent.change(input, { target: { value: "www.test.com" } });
    fireEvent.click(button);

    await waitFor(() => getByText("www.test.com"));
  });

  it("removes a website from the blocked list", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<BlockedWebsites />);
    const input = getByPlaceholderText("Enter website URL");
    const button = getByText("Add to Blocked List");

    fireEvent.change(input, { target: { value: "www.test.com" } });
    fireEvent.click(button);

    await waitFor(() => getByText("www.test.com"));

    const deleteButton = getByText((content, node) => node.getAttribute("aria-label") === "delete");
    fireEvent.click(deleteButton);

    await waitFor(() => expect(queryByText("www.test.com")).toBeNull());
  });
});