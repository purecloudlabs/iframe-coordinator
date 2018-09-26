module Message.HostToApp exposing (HostToApp(..), encodeToApp)

import Dict
import Json.Encode as Encode
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)


type HostToApp
    = Publish Publication
    | ToastRequest Toast


encodeToApp : HostToApp -> Encode.Value
encodeToApp message =
    let
        ( label, value ) =
            case message of
                Publish publication ->
                    ( PubSub.publishLabel, PubSub.encodePublication publication )

                ToastRequest toast ->
                    ( Toast.label, Toast.encode toast )
    in
    LabeledMessage.encode label value
