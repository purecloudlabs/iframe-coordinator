# iframe-coordinator

Tools for coordinating independent single-page-apps embedded via iframe

## Why would I want to do that?

Iframes are the only way to obtain strong isolation of the javascript runtime in a browser. This is useful for organizations with multiple teams shipping interfaces for different features. Teams can ship with confidence, knowing errors in other's code won't crash their interface.

Embedding applications via iframe also means that code from separate teams can be deployed and rolled back independently, limiting the impact of breaking changes. 


## How do I use it?

Currently iframe-coordinator is designed to be used via a set of JS bindings. We use Elm internally for it's reliability and protection against accidental breaking changes in the message formats.

