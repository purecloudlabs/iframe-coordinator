module HostMessage exposing (HostMessage(..), decoder)

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)


type HostMessage
    = Subscribe String
    | Unsubscribe String
    | Publish Publication


decoder : Decoder HostMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( PubSub.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( PubSub.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            , ( PubSub.publishLabel, Decode.map Publish PubSub.publicationDecoder )
            ]
        )
