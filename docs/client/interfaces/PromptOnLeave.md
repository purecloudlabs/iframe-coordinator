[**iframe-coordinator v6.3.10**](../../README.md)

***

[iframe-coordinator](../../modules.md) / [client](../README.md) / PromptOnLeave

# Interface: PromptOnLeave

Defined in: [messages/PromptOnLeave.ts:8](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/messages/PromptOnLeave.ts#L8)

A prompt on leave dialog to be displayed
by the host application. If the host application receives a message with the shouldPrompt field set to true
a dialog will be displayed asking the user for confirmation before navigating.

## Properties

### message?

> `optional` **message**: `string`

Defined in: [messages/PromptOnLeave.ts:14](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/messages/PromptOnLeave.ts#L14)

Optional message to prompt the user with.

***

### shouldPrompt

> **shouldPrompt**: `boolean`

Defined in: [messages/PromptOnLeave.ts:12](https://github.com/purecloudlabs/iframe-coordinator/blob/24ed55ca26cc76eded1b943b3678a12067596d6d/packages/iframe-coordinator/src/messages/PromptOnLeave.ts#L12)

The host application will ask the user for confirmation before
leaving the current page if it has received a message with the shouldPrompt field set to true.
