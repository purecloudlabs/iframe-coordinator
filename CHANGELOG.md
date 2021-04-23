# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.2.4](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.3...v4.2.4) (2021-04-23)


### Bug Fixes

* **framemanager:** COMUI-460 - Added new default to sandbox attributes ([de42224](https://github.com/purecloudlabs/iframe-coordinator/commit/de42224be10621dab52db08684e2658a08f49ea2))

### [4.2.3](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.2...v4.2.3) (2021-04-02)

### [4.2.2](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.1...v4.2.2) (2021-03-18)


### Bug Fixes

* **cli:** remove embedded app dual scrollbars ([71c9d17](https://github.com/purecloudlabs/iframe-coordinator/commit/71c9d171f5222b4a00f42e9377828516d20b7f0a))
* **linting:** update lower end commit due to bad commit message ([35e2451](https://github.com/purecloudlabs/iframe-coordinator/commit/35e24515d2fbc018fe8ea3a3c4d93c506199e120))

### [4.2.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.0...v4.2.1) (2020-10-27)


### Bug Fixes

* **cli:** missing hash and query parameters ([e7fc6a1](https://github.com/purecloudlabs/iframe-coordinator/commit/e7fc6a1c95f4950dec9e5ab344584cca78ec4dc2))

## [4.2.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.14...v4.2.0) (2020-09-16)


### Features

* **messaging:** support nested iframes by tagging messages with direction ([00d2cbf](https://github.com/purecloudlabs/iframe-coordinator/commit/00d2cbf446722983f51a3bedea41489428ade9b2))

### [4.1.14](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.13...v4.1.14) (2020-09-16)

### [4.1.13](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.12...v4.1.13) (2020-09-16)

### [4.1.12](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.11...v4.1.12) (2020-07-27)

### [4.1.11](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.10...v4.1.11) (2020-07-27)

### [4.1.10](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.9...v4.1.10) (2020-07-27)

### [4.1.9](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.8...v4.1.9) (2020-07-27)

### [4.1.8](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.7...v4.1.8) (2020-07-27)

### [4.1.7](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.6...v4.1.7) (2020-07-27)

### [4.1.6](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.5...v4.1.6) (2020-07-27)

### [4.1.5](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.4...v4.1.5) (2020-07-27)

### [4.1.4](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.3...v4.1.4) (2020-07-27)

# 3.0.0

- Exceptions are now thrown when bad messages are recieved across frames or from apps
- `requestToast` client API renamed to `requestNotification` for clarity
- Host events for notifications renamed from `toastRequest` to `notifyRequest`
