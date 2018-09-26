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
    LabeledMessage.decoder
        (Dict.fromList
            [ ( PubSub.publishLabel, Decode.map Publish PubSub.publicationDecoder )
            ]
        )


encodeToClient : HostToClient -> Encode.Value
encodeToClient message =
    let
        ( label, value ) =
            case message of
                Publish publication ->
                    ( PubSub.publishLabel, PubSub.encodePublication publication )
    in
    LabeledMessage.encode label value
