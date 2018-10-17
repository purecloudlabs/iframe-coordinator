module Message.ClientToHost exposing (ClientToHost(..), encodeToHost, decodeFromClient)

{-| This module exposes a type representing all of the messages that can be
passed from the client library to the host library via postMessage.

@docs ClientToHost, encodeToHost, decodeFromClient

-}

import Dict
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import LabeledMessage
import Message.Navigation as Navigation exposing (Navigation)
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)


{-| This custom type is just a set of variants for each valid message the client
library can send to the host library across the iframe boundary. See the
individual type descriptions for more details on message structures.
-}
type ClientToHost
    = NavRequest Navigation
    | Publish Publication
    | ToastRequest Toast


{-| Encodes a ClientToHost message for delivery to the host library via
postMessage.
-}
encodeToHost : ClientToHost -> Encode.Value
encodeToHost message =
    case message of
        NavRequest navigation ->
            Navigation.encode navigation

        Publish publication ->
            PubSub.encodePublication publication

        ToastRequest toast ->
            Toast.encode toast


{-| Decoder for parsing incoming messages from the client library to the host
library. Bad input from postMessage will produce nice console errors that
describe the exact failure.
-}
decodeFromClient : Decoder ClientToHost
decodeFromClient =
    Decode.oneOf
        [ Decode.map NavRequest Navigation.decoder
        , Decode.map Publish PubSub.publicationDecoder
        , Decode.map ToastRequest Toast.decoder
        ]
