if (typeof structuredClone === "undefined") {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

import React from "react";
import { render, waitFor } from "@testing-library/react";
import FocusSession from "./FocusSession";

// Mock IndexedDB using fake-indexeddb
import FDBFactory from "fake-indexeddb/lib/FDBFactory";
import FDBKeyRange from "fake-indexeddb/lib/FDBKeyRange";

global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};


// Mock indexedDB
global.indexedDB = new FDBFactory();
global.IDBKeyRange = FDBKeyRange;

const saveToIndexedDB = (session) => {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("focusSessionHistoryDB", 2);
        
    openRequest.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("focusSessionHistory")) {
        // Use a single key or handle compound key differently
        db.createObjectStore("focusSessionHistory", { keyPath: ["startDate", "startTime"] }); 
      }
    };

    openRequest.onerror = () => reject(openRequest.error);

    openRequest.onsuccess = async () => {
      const db = openRequest.result;
      const transaction = db.transaction(["focusSessionHistory"], "readwrite");
      const store = transaction.objectStore("focusSessionHistory");

            
      store.add(session).onsuccess = () => {
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = () => {
          console.log(transaction.error);
          reject(transaction.error);
        };
      };

            
    };
  });
};


describe("FocusSession", () => {
  test("renders FocusSession component", () => {
    const { getByText } = render(<FocusSession />);

    expect(getByText("Focus session logs")).toBeInTheDocument();
  });


  test("renders focus session data", async () => {
        
    const focusSessionData = {
      startDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      startTime: "09:02 PM",
      startDateTime: "2024-01-21T21:02:13+01:00",
      endDateTime: "2024-01-21T22:04:15+01:00",
      endTime: "09:04 PM",
      totalTimeElapsed: "00:02:00",
      timezoneArea: "Asia/Singapore",
      achievement: "Achievement 1",
    };

    expect(await saveToIndexedDB(focusSessionData));

        
    const { getByText } = render(<FocusSession />);

    // Assuming that the focus session data contains a session with these details
    await waitFor(() => {
      expect(getByText("Achievement 1")).toBeInTheDocument();
    });
  });
});