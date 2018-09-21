module HostMessage exposing (HostMessage(..), decoder)

import CommonMessages exposing (Publication)
import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage


type HostMessage
    = Subscribe String
    | Unsubscribe String
    | Publish Publication


decoder : Decoder HostMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( CommonMessages.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( CommonMessages.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            , ( CommonMessages.publishLabel, Decode.map Publish CommonMessages.publicationDecoder )
            ]
        )
