module Message.ClientToApp exposing (ClientToApp(..), encodeToApp)

import Json.Encode as Encode
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)


type ClientToApp
    = Publish Publication


encodeToApp : ClientToApp -> Encode.Value
encodeToApp msg =
    case msg of
        Publish publication ->
            PubSub.encodePublication publication
