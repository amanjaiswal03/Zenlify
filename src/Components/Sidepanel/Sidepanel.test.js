import React from "react";
import { render, fireEvent, describe, it, expect } from "@testing-library/react";
import Sidepanel from "./Sidepanel";
import jest from "jest";

describe("Sidepanel", () => {
  it("renders without crashing", () => {
    const setPage = jest.fn();
    render(<Sidepanel setPage={setPage} />);
  });

  it("updates activePage state and calls setPage prop when a menu item is clicked", () => {
    const setPage = jest.fn();
    const { getByText } = render(<Sidepanel setPage={setPage} />);

    const dashboardMenuItem = getByText("Dashboard");
    fireEvent.click(dashboardMenuItem);
    expect(setPage).toHaveBeenCalledWith("dashboard");

    const blockedWebsitesMenuItem = getByText("Blocked Websites");
    fireEvent.click(blockedWebsitesMenuItem);
    expect(setPage).toHaveBeenCalledWith("blocked-websites");

    const customizeMenuItem = getByText("Customize");
    fireEvent.click(customizeMenuItem);
    expect(setPage).toHaveBeenCalledWith("customize");

    const notificationsMenuItem = getByText("Notifications");
    fireEvent.click(notificationsMenuItem);
    expect(setPage).toHaveBeenCalledWith("notifications");
  });
});