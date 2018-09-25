module CommonMessages exposing (Publication, encodePublication, publicationDecoder, encodeLocation, navRequestDecoder, publishLabel, subscribeLabel, unsubscribeLabel, navRequestLabel)

import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode
import Navigation exposing (Location)
import Json.Decode.Pipeline exposing (required)


type alias Publication =
    { topic : String
    , payload : Value
}

publishLabel : String
publishLabel =
    "publish"


publicationDecoder : Decoder Publication
publicationDecoder =
    Decode.map2 Publication
        (Decode.field "topic" Decode.string)
        (Decode.field "payload" Decode.value)


encodePublication : Publication -> Value
encodePublication publication =
    Encode.object
        [ ( "topic", Encode.string publication.topic )
        , ( "payload", publication.payload )
        ]


navRequestDecoder : Decoder Location
navRequestDecoder =
    Decode.succeed Location
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

subscribeLabel : String
subscribeLabel =
    "subscribe"


unsubscribeLabel : String
unsubscribeLabel =
    "unsubscribe"

navRequestLabel : String
navRequestLabel =
    "navRequest"