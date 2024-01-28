import {jest, beforeEach, describe, expect, it} from "@jest/globals";

global.chrome = {
  alarms: {
    create: jest.fn()
  },
  storage: {
    sync: {
      set: jest.fn(),
      get: jest.fn((key, callback) => callback({ googleSync: true }))
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    lastError: null
  },
  notifications: {
    create: jest.fn(),
    onButtonClicked: {
      addListener: jest.fn()
    }
  },
  identity: {
    getAuthToken: jest.fn((config, callback) => callback("fake-token"))
  },
  windows: {
    create: jest.fn()
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => callback([{ url: "blocked.html" }])),
    onUpdated: {
      addListener: jest.fn()
    }
  }
};
  
import { timerState, session, startTimer, resetTimer, displayNotification, openInputPage, addFocusSessionToCalendar, initPomodoroTimerListeners } from "../pomodoroTimer";

// mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ htmlLink: "fake-link" })
}));


describe("Pomodoro Timer", () => {
  // Reset timerState and session before each test
  beforeEach(() => {
    Object.assign(timerState, {
      countdown: null,
      timerDuration: 0,
      timerRunning: false,
      onBreak: false,
      pomodoroDuration: 25 * 60,
      breakDuration: 5 * 60,
      isPaused: false,
      pausedTime: 0
    });

    Object.assign(session, {
      startDateTime: null,
      endDateTime: null,
      startDate: null,
      endTime: null,
      startTime: null,
      totalTimeElapsed: null,
      timezoneArea: null,
      achievement: null
    });
  });

  // Tests for startTimer
  describe("startTimer", () => {
    it("should start the timer with default durations", () => {
      startTimer();
      expect(timerState.timerRunning).toBeTruthy();
      expect(timerState.timerDuration).toEqual(timerState.pomodoroDuration);
    });

    it("should resume the timer from paused state", () => {
      timerState.isPaused = true;
      timerState.pausedTime = 1000;
      startTimer();
      expect(timerState.timerRunning).toBeTruthy();
      expect(timerState.timerDuration).toEqual(1000);
    });

  });

  // Tests for updateTimer
  describe("updateTimer", () => {
    // Mocking setInterval and clearInterval
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
    jest.spyOn(global, "clearInterval");

    it("should decrement timerDuration every second", () => {
      startTimer();
      jest.advanceTimersByTime(1000);
      expect(timerState.timerDuration).toBeLessThan(timerState.pomodoroDuration);
    });

  });

  // Tests for resetTimer
  describe("resetTimer", () => {
    it("should reset the timer to its initial state", () => {
      timerState.timerRunning = true;
      timerState.onBreak = true;
      timerState.isPaused = true;
      timerState.pausedTime = 1000;
      timerState.timerDuration = 1000;
      resetTimer();
      expect(timerState.timerRunning).toBeFalsy();
      expect(timerState.onBreak).toBeFalsy();
      expect(timerState.isPaused).toBeFalsy();
      expect(timerState.timerDuration).toEqual(timerState.pomodoroDuration);
    });
  });

  // Tests for displayNotification
  describe("displayNotification", () => {
    it("should create a notification", () => {
      displayNotification();
      expect(chrome.notifications.create).toHaveBeenCalled();
    });
  });

  // Tests for openInputPage
  describe("openInputPage", () => {
    it("should open the input page", () => {
      openInputPage();
      expect(chrome.windows.create).toHaveBeenCalled();
    });
  });


  // Tests for addFocusSessionToCalendar
  describe("addFocusSessionToCalendar", () => {
    it("should add a session to Google Calendar", () => {
      addFocusSessionToCalendar();
      expect(chrome.identity.getAuthToken).toHaveBeenCalled();
    });
  });

  // Tests for initPomodoroTimerListeners
  describe("initPomodoroTimerListeners", () => {
    it("should set up event listeners", () => {
      // Mock the event listener setup

      initPomodoroTimerListeners();

      expect(chrome.notifications.onButtonClicked.addListener).toHaveBeenCalled();
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });
  });
});

