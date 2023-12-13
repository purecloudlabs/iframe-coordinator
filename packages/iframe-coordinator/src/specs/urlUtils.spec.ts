import {
  joinRoutes,
  normalizeRoute,
  stripLeadingSlash,
  stripLeadingSlashAndHashTag,
  stripTrailingSlash,
} from "../urlUtils";

describe("urlUtils", () => {
  describe("joinRoutes", () => {
    [
      { input: ["", "", ""], expectedOutput: "" },
      { input: ["test", "test", "test"], expectedOutput: "test/test/test" },
      {
        input: ["/test/", "/test/", "/test/"],
        expectedOutput: "test/test/test",
      },
      { input: ["test", "", "test"], expectedOutput: "test/test" },
      { input: ["/test/", "", "/test/"], expectedOutput: "test/test" },
      { input: ["test", "/", "test"], expectedOutput: "test/test" },
      { input: ["/test/", "/", "/test/"], expectedOutput: "test/test" },
    ].forEach(({ input, expectedOutput }, index) => {
      it(`should work as expected (${index + 1})`, () => {
        expect(joinRoutes(...input)).toBe(expectedOutput);
      });
    });
  });
});
