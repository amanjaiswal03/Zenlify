import React from "react";
import { render, fireEvent } from "@testing-library/react";
import PomodoroTimer from "./PomodoroTimer";

// Mock the chrome.runtime object
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ breakTime: false })),
    },
  },
};

describe("PomodoroTimer", () => {
  it("renders without crashing", () => {
    render(<PomodoroTimer />);
  });

  it("updates pomodoroDuration state when text field is changed", () => {
    const { getByLabelText } = render(<PomodoroTimer />);
    const textField = getByLabelText("Pomodoro Duration (minutes)");

    fireEvent.change(textField, { target: { value: "30" } });
    fireEvent.blur(textField);

    expect(textField.value).toBe("30");
  });

  it("updates breakDuration state when text field is changed", () => {
    const { getByLabelText } = render(<PomodoroTimer />);
    const textField = getByLabelText("Break Duration (minutes)");

    fireEvent.change(textField, { target: { value: "10" } });
    fireEvent.blur(textField);

    expect(textField.value).toBe("10");
  });

  it("calls chrome.runtime.sendMessage with correct command when start button is clicked", () => {
    const { getByText } = render(<PomodoroTimer />);
    const button = getByText("Start");

    fireEvent.click(button);

    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: "start", pomodoroDuration: 25, breakDuration: 5 });
  });

  it("calls chrome.runtime.sendMessage with correct command when reset button is clicked", () => {
    const { getByText } = render(<PomodoroTimer />);
    const button = getByText("Reset");

    fireEvent.click(button);

    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: "reset", pomodoroDuration: 25, breakDuration: 5 });
  });
});