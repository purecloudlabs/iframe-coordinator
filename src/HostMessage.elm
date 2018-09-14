module HostMessage exposing (HostMessage(..), decoder)

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage


type HostMessage
    = Subscribe String
    | Unsubscribe String


subscribeLabel : String
subscribeLabel =
    "subscribe"


unsubscribeLabel : String
unsubscribeLabel =
    "unsubscribe"


decoder : Decoder HostMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( subscribeLabel, Decode.map Subscribe Decode.string )
            , ( unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            ]
        )
