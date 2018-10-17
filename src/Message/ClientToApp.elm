module Message.ClientToApp exposing (ClientToApp(..), encodeToApp)

{-| This module exposes a type representing all of the messages that can be
passed from the client library to a client application.

@docs ClientToApp, encodeToApp

-}

import Json.Encode as Encode
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)


{-| This custom type is just a set of variants for each valid message the client
library can send to the client application. See the individual type descriptions
for more details on message structures.
-}
type ClientToApp
    = Publish Publication


{-| Encodes a ClientToApp message for delivery to the client application
-}
encodeToApp : ClientToApp -> Encode.Value
encodeToApp msg =
    case msg of
        Publish publication ->
            PubSub.encodePublication publication
