module ClientMessage exposing (ClientMessage(..), decoder, encode)

{-| The ClientMsg module describes message formats used by clients to communicate with the parent application.
@docs ClientMessage, decoder, encode
-}

import CommonMessages exposing (Publication)
import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (decode, required)
import Json.Encode as Encode
import LabeledMessage
import Navigation exposing (Location)



-- ClientMessage


{-| Message types that can be sent to the parent app
-}
type ClientMessage
    = NavRequest Location
    | Publish Publication
    | Subscribe String
    | Unsubscribe String

{-| Decoder for client messages. Messages are expected to be part of a labeled structure as defined in the LabeledMsg module.
-}
decoder : Decoder ClientMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( CommonMessages.navRequestLabel, Decode.map NavRequest CommonMessages.navRequestDecoder )
            , ( CommonMessages.publishLabel, Decode.map Publish CommonMessages.publicationDecoder )
            , ( CommonMessages.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( CommonMessages.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            ]
        )


{-| Encodes a ClientMsg into a LabeledMsg format suitable for sending to a parent app.
-}
encode : ClientMessage -> Encode.Value
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
