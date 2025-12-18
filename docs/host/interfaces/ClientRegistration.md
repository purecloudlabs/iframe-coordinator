[**iframe-coordinator v6.3.10**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [host](../README.md) / ClientRegistration

# Interface: ClientRegistration

Defined in: [HostRouter.ts:96](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/HostRouter.ts#L96)

Configuration for a single `frame-router` client.

The 'url' property is the location where the client application is hosted. If the
client uses fragment-based routing, the URL should include a hash fragment, e.g.
`http://example.com/client/#/` if the client uses pushState routing, leave the
fragment out, e.g. `http://example.com/client`.

The `assignedRoute` property is the prefix for all routes that will be mapped to this client.
This prefix will be stripped when setting the route on the client. As an example,
if `assignedRoute` is `/foo/bar/`, `url` is `https://example.com/client/#/` and the
`frame-router` element is passed the route `/foo/bar/baz/qux`, the embedded iframe URL
will be `http://example.com/client/#/baz/qux`

## Properties

### allow?

> `optional` **allow**: `string`

Defined in: [HostRouter.ts:105](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/HostRouter.ts#L105)

Sets the iframe's [allow attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-allow)
for this client.

***

### assignedRoute

> **assignedRoute**: `string`

Defined in: [HostRouter.ts:100](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/HostRouter.ts#L100)

The `frame-router` route attribute prefix that maps to this client app

***

### defaultTitle?

> `optional` **defaultTitle**: `string`

Defined in: [HostRouter.ts:115](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/HostRouter.ts#L115)

Sets the iframe's default [title](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#accessibility_concerns) attribute.
This is required for accessibility.

***

### sandbox?

> `optional` **sandbox**: `string`

Defined in: [HostRouter.ts:110](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/HostRouter.ts#L110)

Sets the iframe's [sandbox attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
for this client. Values wll be merged with built-in defaults.

***

### url

> **url**: `string`

Defined in: [HostRouter.ts:98](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/HostRouter.ts#L98)

The URL where the client application is hosted
