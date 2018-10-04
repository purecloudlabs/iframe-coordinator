module Message.HostToClient exposing (HostToClient(..), encodeToClient, decodeFromHost)

{-| This module exposes a type representing all of the messages that can be
passed from the host library to the client library via postMessage.

@docs HostToClient, encodeToClient, decodeFromHost

-}

import Dict
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)


{-| This custom type is just a set of variants for each valid message the host
library can send to the client application. See the individual type
descriptions for more details on message structures.
-}
type HostToClient
    = Publish Publication


{-| Decoder for parsing incoming messages from the host library to the client
library. Bad input from postMessage will produce nice console errors that
describe the exact failure.
-}
decodeFromHost : Decoder HostToClient
decodeFromHost =
    Decode.map Publish PubSub.publicationDecoder


{-| Encodes a HostToClient message for delivery to the client application
-}
encodeToClient : HostToClient -> Encode.Value
encodeToClient message =
    case message of
        Publish publication ->
            PubSub.encodePublication publication
