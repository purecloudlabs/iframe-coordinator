# Design ideas for modal dialogs

## The simple approach

Several of the UX modal designs are pretty simple, consisting of a title, some text and some buttons (examples). These prompt-like intefaces could be supported with a cross-frame message with the format:

```TypeScript
interface Prompt = {
  title : string,
  message : string,
  button : array<Button>
}

interface Button = {
  text : string,
  type : 'secondary' | 'primary',
  id : string
}
```

When the host app displays the prompt and the user clicks a button, the client would be sent a message:

```TypeScript
interface ModalResult = {
  buttonId : string
}
```

With the caveat that buttonId can probably always be 'cancel', if the user closes the modal.

## The complicated approach

The more complex option is that when it wants to display a modal, the client app sends a URL to the parent app via a message like:

```TypeScript
interface Modal = {
  frame: string
}
```

example:

```TypeScript
{
  frame: "https://www.com/theBestApp/groupEditModal.html?groupId=1234"
}
```

The host app will open a modal dialog and display the url in an iframe as part of the modal. The iframe can do
whatever it needs and when it's complete, send a message to the host app, which will be passed back to the client:

```TypeScript
interface ModalResult = {
  result: any
}
```

As in the previous case, the client has to be able to handle the case where `result` is `'cancel'`.
