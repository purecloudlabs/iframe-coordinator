# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.5.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.5.0...v5.5.1) (2023-05-03)


### Bug Fixes

* **cli:** readded missing files from the published cli package ([26c8eb9](https://github.com/purecloudlabs/iframe-coordinator/commit/26c8eb993292e3bc18e190fcc56a13bc32499551))

## [5.5.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.4.1...v5.5.0) (2023-04-25)


### Features

* **frame-router:** emit clientNotFound event after each invalid route change ([837d0e5](https://github.com/purecloudlabs/iframe-coordinator/commit/837d0e522861038bd11250186d1fedb5cb064302))


### Bug Fixes

* **frame-router:** check for new path before emitting clientNotFound event ([62fa98d](https://github.com/purecloudlabs/iframe-coordinator/commit/62fa98d95b97a18f2126989d58bd1c6ff373259f))

### [5.4.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.4.0...v5.4.1) (2023-03-30)


### Bug Fixes

* **frame-router:** clientConfig type fixed ([99897c6](https://github.com/purecloudlabs/iframe-coordinator/commit/99897c6511f8dbe6ffd3e0169f172689fd486310))

## [5.4.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.3.0...v5.4.0) (2023-03-02)


### Features

* 🎸 prompt on leave ([270b039](https://github.com/purecloudlabs/iframe-coordinator/commit/270b039734137b49b0a7ff1645a661605e994c6a))

## [5.3.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.2.1...v5.3.0) (2023-02-22)


### Features

* **frame-router:** emit custom dom event for client publish messages ([0845d97](https://github.com/purecloudlabs/iframe-coordinator/commit/0845d97c4eab0faa08b4d63204250f78eedeb367))

### [5.2.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.2.0...v5.2.1) (2023-02-03)

## [5.2.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.1.0...v5.2.0) (2023-02-02)


### Features

* add client message to notify host of click events ([4a7768f](https://github.com/purecloudlabs/iframe-coordinator/commit/4a7768f738967700c3cf0f9b86d4eb07d82ca4ff))
* **framemanager:** emit click event to host when client clicked ([7b75f46](https://github.com/purecloudlabs/iframe-coordinator/commit/7b75f46496b8df3a893e6e223116745361d25bc0))


### Bug Fixes

* address issues in PR for click events ([9c204b3](https://github.com/purecloudlabs/iframe-coordinator/commit/9c204b36defb097a730fed4f41abb2c7d93c45e7))

## [5.1.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v5.0.0...v5.1.0) (2023-01-20)


### Features

* **page-metadata:** adding ability to send page metadata to host ([a087ab2](https://github.com/purecloudlabs/iframe-coordinator/commit/a087ab2772bdb4334d7a439ac6f4ec447737ddb9))


### Bug Fixes

* **event-emitter:** can now remove a listener in an add listener callback ([02ad998](https://github.com/purecloudlabs/iframe-coordinator/commit/02ad998d7fa349dd66f3a5900c0cc5d17ed670fa))

## [5.0.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.6.1...v5.0.0) (2022-12-07)


### ⚠ BREAKING CHANGES

* ifc-cli is no longer in iframe-coordinator

COMUI-1121

### Features

* **frame-manager:** add attribute that sets the id of the iframe ([226f550](https://github.com/purecloudlabs/iframe-coordinator/commit/226f55008a328d5a140a7d92ad95394dd5b8828d))
* **frame-router:** accept prop to setup frames ([03d0c40](https://github.com/purecloudlabs/iframe-coordinator/commit/03d0c4006f87a638bf79441598b524746ae7c7dd))
* migrated to monorepo with separate packages ([b042338](https://github.com/purecloudlabs/iframe-coordinator/commit/b0423388c4fe5416e92405d7d695c270e2d87824))
* **navrequest:** add support for nav request that replaces session history ([6836462](https://github.com/purecloudlabs/iframe-coordinator/commit/6836462d71b03fee6c3b8cde25760dc6935dbaf4))


### Bug Fixes

* **cli:** fix iframe-coordinator-cli build by migrating to vite ([d1b8a5f](https://github.com/purecloudlabs/iframe-coordinator/commit/d1b8a5fb669ef4d1f7f108e8774159a0949cd6ab))
* **cli:** rename ifc-cli ([93ba85f](https://github.com/purecloudlabs/iframe-coordinator/commit/93ba85fe8d121560a3ae60b4a644d8884c97425b))
* **frame-manager:** fixed template string error ([a77931b](https://github.com/purecloudlabs/iframe-coordinator/commit/a77931b22903e30e161661f9d13fad17a0e348f8))

### [4.6.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.6.0...v4.6.1) (2022-08-24)

### Bug Fixes

- **url-utils:** joinRoutes now accounts for routes that normalize to an empty string ([3df97a5](https://github.com/purecloudlabs/iframe-coordinator/commit/3df97a57372891d1e77226c4fbbad22aaccde22a))

## [4.6.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.5.2...v4.6.0) (2022-06-23)

### Features

- **ifc-cli:** allow consumer to specify their own ssl cert and key ([700e963](https://github.com/purecloudlabs/iframe-coordinator/commit/700e9631ed121a67ef7ef65430118ca4be382835))

### [4.5.2](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.5.1...v4.5.2) (2022-04-15)

### [4.5.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.5.0...v4.5.1) (2022-02-25)

## [4.5.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.4.4...v4.5.0) (2022-01-28)

### Features

- **a11y:** support adding a title attribute to the iframe ([fb267ec](https://github.com/purecloudlabs/iframe-coordinator/commit/fb267ec3ad5952d687ca5aabe3ba5bb479414b34))

### [4.4.4](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.4.3...v4.4.4) (2021-10-29)

### [4.4.3](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.4.2...v4.4.3) (2021-09-22)

### [4.4.2](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.4.1...v4.4.2) (2021-09-17)

### [4.4.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.4.0...v4.4.1) (2021-09-17)

## [4.4.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.3.0...v4.4.0) (2021-07-07)

### Features

- **modal:** added global modal to render in web-dir from client apps includes api and message code ([9eb63a7](https://github.com/purecloudlabs/iframe-coordinator/commit/9eb63a74382848c4a5bbf4301789ec0601fc7528))
- **modal:** made modal types public ([194df85](https://github.com/purecloudlabs/iframe-coordinator/commit/194df859bfd176717a3775ca8bb206e3a426e9fa))
- **modal:** removed the modal type enum, updated the modal request function and the message class ([48aa888](https://github.com/purecloudlabs/iframe-coordinator/commit/48aa88857bcb91c9bcf24a7fd9477518e4a1ae93))
- **modal:** updated client-setup.md to add requestModal documentation ([2dd7a85](https://github.com/purecloudlabs/iframe-coordinator/commit/2dd7a85da0c68e3a0da0d03b150048a45c8a2e92))
- **modal:** updated documentation for requestModal function ([423e96d](https://github.com/purecloudlabs/iframe-coordinator/commit/423e96d4735ed4f2d8b1e20563072301f1839768))

### Bug Fixes

- **cli:** add missing example file to package, improve behavior when proxied ([da3af1b](https://github.com/purecloudlabs/iframe-coordinator/commit/da3af1b04691b5403dcb741834087e923cbaec50))

## [4.3.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.6...v4.3.0) (2021-06-03)

### Features

- **ifc-api-improvements:** Improve URL and link generation APIs ([6f77f9d](https://github.com/purecloudlabs/iframe-coordinator/commit/6f77f9dc29d23175d2e07b0814fab57b9a190b7f))

### [4.2.6](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.5...v4.2.6) (2021-04-30)

### Bug Fixes

- **docs:** fix static asset URLs in deployed docs ([3bc9fae](https://github.com/purecloudlabs/iframe-coordinator/commit/3bc9faea2e136dd2ef51fd88fbd19c0218e3799c))

### [4.2.5](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.4...v4.2.5) (2021-04-28)

### [4.2.4](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.3...v4.2.4) (2021-04-23)

### Bug Fixes

- **framemanager:** COMUI-460 - Added new default to sandbox attributes ([de42224](https://github.com/purecloudlabs/iframe-coordinator/commit/de42224be10621dab52db08684e2658a08f49ea2))

### [4.2.3](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.2...v4.2.3) (2021-04-02)

### [4.2.2](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.1...v4.2.2) (2021-03-18)

### Bug Fixes

- **cli:** remove embedded app dual scrollbars ([71c9d17](https://github.com/purecloudlabs/iframe-coordinator/commit/71c9d171f5222b4a00f42e9377828516d20b7f0a))
- **linting:** update lower end commit due to bad commit message ([35e2451](https://github.com/purecloudlabs/iframe-coordinator/commit/35e24515d2fbc018fe8ea3a3c4d93c506199e120))

### [4.2.1](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.2.0...v4.2.1) (2020-10-27)

### Bug Fixes

- **cli:** missing hash and query parameters ([e7fc6a1](https://github.com/purecloudlabs/iframe-coordinator/commit/e7fc6a1c95f4950dec9e5ab344584cca78ec4dc2))

## [4.2.0](https://github.com/purecloudlabs/iframe-coordinator/compare/v4.1.14...v4.2.0) (2020-09-16)

### Features

- **messaging:** support nested iframes by tagging messages with direction ([00d2cbf](https://github.com/purecloudlabs/iframe-coordinator/commit/00d2cbf446722983f51a3bedea41489428ade9b2))

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
