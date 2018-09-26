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
import Message.Toast as Toast exposing (Toast)
import Navigation exposing (Location)



-- ClientMessage


{-| Message types that can be sent to the parent app
-}
type ClientMessage
    = NavRequest Location
    | ToastRequest Toast
    | Publish Publication
    | Subscribe String
    | Unsubscribe String

{-| Decoder for client messages. Messages are expected to be part of a labeled structure as defined in the LabeledMsg module.
-}
decoder : Decoder ClientMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( "toastRequest", toastRequestDecoder )
            , ( CommonMessages.navRequestLabel, Decode.map NavRequest CommonMessages.navRequestDecoder )
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
                ToastRequest toast ->
                    ( "toastRequest", Toast.encode toast )
                
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


-- Helpers


navRequestDecoder : Decoder ClientMessage
navRequestDecoder =
    Decode.map NavRequest
        (decode Location
            |> required "href" Decode.string
            |> required "host" Decode.string
            |> required "hostname" Decode.string
            |> required "protocol" Decode.string
            |> required "origin" Decode.string
            |> required "port" Decode.string
            |> required "pathname" Decode.string
            |> required "search" Decode.string
            |> required "hash" Decode.string
            |> required "username" Decode.string
            |> required "password" Decode.string
        )


encodeLocation : Location -> Encode.Value
encodeLocation loc =
    Encode.object
        [ ( "href", Encode.string loc.href )
        , ( "host", Encode.string loc.host )
        , ( "hostname", Encode.string loc.hostname )
        , ( "protocol", Encode.string loc.protocol )
        , ( "origin", Encode.string loc.origin )
        , ( "port", Encode.string loc.port_ )
        , ( "pathname", Encode.string loc.pathname )
        , ( "search", Encode.string loc.search )
        , ( "hash", Encode.string loc.hash )
        , ( "username", Encode.string loc.username )
        , ( "password", Encode.string loc.password )
        ]


toastRequestDecoder : Decoder ClientMessage
toastRequestDecoder =
    Decode.map ToastRequest Toast.decoder