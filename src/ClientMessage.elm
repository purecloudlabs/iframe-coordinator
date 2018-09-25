module ClientMessage exposing (ClientMessage(..), decoder, encode)

{-| The ClientMsg module describes message formats used by clients to communicate with the parent application.

@docs ClientMessage, decoder, encode

-}

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (decode, required)
import Json.Encode as Encode
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)
import Navigation exposing (Location)


{-| Message types that can be sent to the parent app
-}
type ClientMessage
    = NavRequest Location
    | Publish Publication
    | Subscribe String
    | Unsubscribe String
    | ToastRequest Toast


navRequestLabel : String
navRequestLabel =
    "navRequest"


{-| Decoder for client messages. Messages are expected to be part of a labeled structure as defined in the LabeledMsg module.
-}
decoder : Decoder ClientMessage
decoder =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( navRequestLabel, navRequestDecoder )
            , ( PubSub.publishLabel, Decode.map Publish PubSub.publicationDecoder )
            , ( PubSub.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( PubSub.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            , ( "toastRequest", toastRequestDecoder )
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
                    ( navRequestLabel, encodeLocation location )

                Publish publication ->
                    ( PubSub.publishLabel, PubSub.encodePublication publication )

                Subscribe topic ->
                    ( PubSub.subscribeLabel, Encode.string topic )

                Unsubscribe topic ->
                    ( PubSub.unsubscribeLabel, Encode.string topic )

                ToastRequest toast ->
                    ( "toastRequest", Toast.encode toast )
    in
    LabeledMessage.encode label value



-- NavRequest


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
