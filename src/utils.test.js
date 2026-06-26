import {
  formatIndianNumber,
  getRelativeTime,
  formatDateToDayMonthYear,
  getMonthOptions,
  getYearOptions,
  getTopCategoryColors,
} from "./utils";

describe("Utility Functions", () => {
  describe("formatIndianNumber", () => {
    test("formats positive numbers correctly", () => {
      expect(formatIndianNumber(1000)).toBe("₹1,000");
      expect(formatIndianNumber(100000)).toBe("₹1,00,000");
      expect(formatIndianNumber(1234567)).toBe("₹12,34,567");
    });

    test("formats negative numbers correctly", () => {
      expect(formatIndianNumber(-500)).toBe("-₹500");
      expect(formatIndianNumber(-10000)).toBe("-₹10,000");
    });

    test("handles zero correctly", () => {
      expect(formatIndianNumber(0)).toBe("₹0");
    });

    test("handles invalid input gracefully", () => {
      expect(formatIndianNumber("abc")).toBe("₹0");
      expect(formatIndianNumber(null)).toBe("₹0");
      expect(formatIndianNumber(undefined)).toBe("₹0");
    });
  });

  describe("getRelativeTime", () => {
    test("returns 'just now' for less than 1 minute", () => {
      const now = Date.now();
      expect(getRelativeTime(now - 30000)).toBe("just now");
    });

    test("returns minutes ago correctly", () => {
      const now = Date.now();
      expect(getRelativeTime(now - 5 * 60 * 1000)).toBe("5 mins ago");
      expect(getRelativeTime(now - 1 * 60 * 1000)).toBe("1 min ago");
    });

    test("returns hours ago correctly", () => {
      const now = Date.now();
      expect(getRelativeTime(now - 2 * 60 * 60 * 1000)).toBe("2 hours ago");
      expect(getRelativeTime(now - 1 * 60 * 60 * 1000)).toBe("1 hour ago");
    });

    test("returns days ago correctly", () => {
      const now = Date.now();
      expect(getRelativeTime(now - 2 * 24 * 60 * 60 * 1000)).toBe("2 days ago");
      expect(getRelativeTime(now - 1 * 24 * 60 * 60 * 1000)).toBe("1 day ago");
    });
  });

  describe("formatDateToDayMonthYear", () => {
    test("formats date correctly", () => {
      const date = new Date("2023-10-05T10:00:00");
      expect(formatDateToDayMonthYear(date)).toBe("05 Oct 2023");
    });
  });

  describe("getMonthOptions", () => {
    test("returns correct months for past year", () => {
      const options = getMonthOptions(2020);
      expect(options).toHaveLength(12);
      expect(options[0].label).toBe("Jan");
      expect(options[11].label).toBe("Dec");
    });

    test("returns months up to current month for current year", () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const options = getMonthOptions(currentYear);
      expect(options).toHaveLength(currentMonth + 1);
      expect(options[options.length - 1].value).toBe(currentMonth);
    });
  });

  describe("getYearOptions", () => {
    test("returns years from current year down to start year", () => {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2;
      const options = getYearOptions(startYear);
      expect(options).toHaveLength(3);
      expect(options[0].value).toBe(currentYear);
      expect(options[2].value).toBe(startYear);
    });
  });

  describe("getTopCategoryColors", () => {
    test("returns requested number of colors", () => {
      const colors = getTopCategoryColors(5);
      expect(colors).toHaveLength(5);
    });

    test("returns all colors if count exceeds palette size", () => {
      const colors = getTopCategoryColors(100);
      expect(colors.length).toBeLessThanOrEqual(100); // Should be palette length
    });
  });
});
