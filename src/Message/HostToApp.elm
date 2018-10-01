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
    case message of
        Publish publication ->
            PubSub.encodePublication publication

        ToastRequest toast ->
            Toast.encode toast
