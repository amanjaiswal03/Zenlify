import React from "react";
import { render, fireEvent, waitFor, describe, it, expect } from "@testing-library/react";
import Notifications from "./Notifications";
import jest from "jest";

// Mock the chrome.storage.sync object
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ pomodoroNotificationMessage: "", breakNotificationMessage: "" })),
      set: jest.fn(),
    },
  },
};

describe("Notifications", () => {
  it("renders without crashing", () => {
    render(<Notifications />);
  });

  it("updates pomodoroNotificationMessage state and calls chrome.storage.sync.set", async () => {
    const { getByLabelText } = render(<Notifications />);
    const input = getByLabelText("Pomodoro Notification Message");

    fireEvent.blur(input, { target: { value: "Test Pomodoro Message" } });

    await waitFor(() => expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ pomodoroNotificationMessage: "Test Pomodoro Message" }));
  });

  it("updates breakNotificationMessage state and calls chrome.storage.sync.set", async () => {
    const { getByLabelText } = render(<Notifications />);
    const input = getByLabelText("Break Notification Message");

    fireEvent.blur(input, { target: { value: "Test Break Message" } });

    await waitFor(() => expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ breakNotificationMessage: "Test Break Message" }));
  });
});