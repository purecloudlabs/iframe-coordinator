module Message.AppToClient exposing (AppToClient(..), decodeFromApp)

{-| This module exposes a type representing all of the messages that can be
passed from a client application to the client library. It's a fairly direct
mapping to the client-facing API.

@docs AppToClient, decodeFromApp

-}

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage
import Message.Navigation as Navigation exposing (Navigation)
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)


{-| This custom type is just a set of variants for each valid message the app
can send to the client library. See the individual type descriptions for more
details on message structures.
-}
type AppToClient
    = NavRequest Navigation
    | Publish Publication
    | Subscribe String
    | Unsubscribe String
    | ToastRequest Toast


{-| Decoder for parsing incoming messages from the application to the relevant
types. Bad input from clients will produce nice console errors that describe the
exact failure:

    Could not parse incoming message: Json.Decode.oneOf failed in the following 5 ways:


    (1) Problem with the given value:

        {
                "msgType": "toastRequest",
                "msg": {
                    "title": "Hello iframe World",
                    "custom": {
                        "level": "success"
                    }
                }
            }

        Unrecognized msg type: toastRequest



    (2) Problem with the given value:

        ...



    (3) Problem with the given value:

        ...



    (4) Problem with the given value:

        ...



    (5) Problem with the value at json.msg:

            {
                "title": "Hello iframe World",
                "custom": {
                    "level": "success"
                }
            }

        Expecting an OBJECT with a field named `message`: <internals>

-}
decodeFromApp : Decoder AppToClient
decodeFromApp =
    Decode.oneOf
        [ Decode.map NavRequest Navigation.urlDecoder
        , Decode.map Publish PubSub.publicationDecoder
        , Decode.map Subscribe PubSub.subscribeDecoder
        , Decode.map Unsubscribe PubSub.unsubscribeDecoder
        , Decode.map ToastRequest Toast.decoder
        ]
