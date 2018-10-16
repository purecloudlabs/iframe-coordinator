module Message.HostToApp exposing (HostToApp(..), encodeToApp)

{-| This module exposes a type representing all of the messages that can be
passed from the host library to a host application.

@docs HostToApp, encodeToApp

-}

import Dict
import Json.Encode as Encode
import LabeledMessage
import Message.Navigation as Navigation exposing (Navigation)
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)


{-| This custom type is just a set of variants for each valid message the host
library can send to the host application. See the individual type
descriptions for more details on message structures.
-}
type HostToApp
    = Publish Publication
    | ToastRequest Toast
    | NavRequest Navigation


{-| Encodes a HostToApp message for delivery to the host application
-}
encodeToApp : HostToApp -> Encode.Value
encodeToApp message =
    case message of
        Publish publication ->
            PubSub.encodePublication publication

        ToastRequest toast ->
            Toast.encode toast

        NavRequest navigation ->
            Navigation.encode navigation
