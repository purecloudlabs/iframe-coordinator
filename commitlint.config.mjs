export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "never", ["pascal-case", "upper-case"]],
  },
  ignores: [
    (message) => message.includes("MIT"),
    (message) => message.includes("update license"),
  ],
};
