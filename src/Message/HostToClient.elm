module Message.HostToClient exposing (HostToClient(..), decodeFromHost, encodeToClient)

import Dict
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)


type HostToClient
    = Publish Publication


decodeFromHost : Decoder HostToClient
decodeFromHost =
    Decode.map Publish PubSub.publicationDecoder


encodeToClient : HostToClient -> Encode.Value
encodeToClient message =
    case message of
        Publish publication ->
            PubSub.encodePublication publication
