module Message.ComponentMsg exposing (ComponentMsg(..), decoder, encode)

{-| The ComponentMsg module describes message formats used by components to communicate with the parent application.

@docs ComponentMsg decoder encode

-}

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (decode, required)
import Json.Encode as Encode
import Message.LabeledMsg as LabeledMsg
import Navigation exposing (Location)


{-| Message types that can be sent to the parent app
-}
type ComponentMsg
    = NavRequest Location


{-| Decoder for component messages. Messages are expected to be part of a labeled structure as defined in the LabeledMsg module.
-}
decoder : Decoder ComponentMsg
decoder =
    LabeledMsg.decoder
        (Dict.fromList
            [ ( "navRequest", navRequestDecoder )
            ]
        )


{-| Encodes a ComponentMsg into a LabeledMsg format suitable for sending to a parent app.
-}
encode : ComponentMsg -> Encode.Value
encode msg =
    let
        ( label, value ) =
            case msg of
                NavRequest location ->
                    ( "navRequest", encodeLocation location )
    in
        LabeledMsg.encode label value



-- Helpers


navRequestDecoder : Decoder ComponentMsg
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
