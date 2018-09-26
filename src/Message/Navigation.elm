module Message.Navigation exposing (Navigation, decoder, encode, label)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (decode, required)
import Json.Encode as Encode
import Navigation exposing (Location)


type alias Navigation =
    Location


label : String
label =
    "navRequest"


encode : Navigation -> Encode.Value
encode loc =
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


decoder : Decoder Navigation
decoder =
    decode Location
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
