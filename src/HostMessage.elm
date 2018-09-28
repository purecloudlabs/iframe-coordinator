module HostMessage exposing (HostMessage(..), decoder)

import CommonMessages exposing (Publication)
import Dict
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import LabeledMessage
import Navigation exposing (Location)


type HostMessage
    = Subscribe String
    | Unsubscribe String
    | Publish Publication
    | NavRequest Location


decoder : Decoder HostMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( CommonMessages.navRequestLabel, Decode.map NavRequest CommonMessages.navRequestDecoder )
            , ( CommonMessages.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( CommonMessages.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            , ( CommonMessages.publishLabel, Decode.map Publish CommonMessages.publicationDecoder )
            ]
        )

encode : HostMessage -> Encode.Value
encode msg =
    let
        ( label, value ) =
            case msg of
                NavRequest location ->
                    ( CommonMessages.navRequestLabel, CommonMessages.encodeLocation location )

                Publish publication ->
                    ( CommonMessages.publishLabel, CommonMessages.encodePublication publication )

                Subscribe topic ->
                    ( CommonMessages.subscribeLabel, Encode.string topic )

                Unsubscribe topic ->
                    ( CommonMessages.unsubscribeLabel, Encode.string topic )
    in
    LabeledMessage.encode label value