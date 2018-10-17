module Message.Navigation exposing (Navigation, encode, decoder, urlDecoder, label)

{-| The Message.Navigation module defines and handles messages for navigation
requests from the client app to the host app.

@docs Navigation, encode, decoder, urlDecoder, label

-}

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)
import Url exposing (Protocol(..), Url)


{-| Navigation requests are represented with an alias to the Url type.
-}
type alias Navigation =
    Url


{-| This is the label that navigation events are tagged with when serialized
to JSON. Other modules should not need to reference it, but it is exposed to
force a package version bump if it changes.
-}
label : String
label =
    "navRequest"


{-| Encodes a Navigation request to JSON and tags it with `label`.
-}
encode : Navigation -> Encode.Value
encode url =
    Encode.object
        [ ( "protocol", encodeProtocol url.protocol )
        , ( "host", Encode.string url.host )
        , ( "port"
          , Maybe.map Encode.int url.port_
                |> Maybe.withDefault Encode.null
          )
        , ( "path", Encode.string url.path )
        , ( "query"
          , Maybe.map Encode.string url.query
                |> Maybe.withDefault Encode.null
          )
        , ( "fragment"
          , Maybe.map Encode.string url.fragment
                |> Maybe.withDefault Encode.null
          )
        ]
        |> withLabel label


{-| Decodes a Navigation request from JSON, if it is tagged with `label`.
-}
decoder : Decoder Navigation
decoder =
    (Decode.succeed Url
        |> required "protocol" protocolDecoder
        |> required "host" Decode.string
        |> required "port" (Decode.nullable Decode.int)
        |> required "path" Decode.string
        |> required "query" (Decode.nullable Decode.string)
        |> required "fragment" (Decode.nullable Decode.string)
    )
        |> expectLabel label


{-| Decodes a Navigation request from a URL string, if it is tagged with `label`.
-}
urlDecoder : Decoder Navigation
urlDecoder =
    (Decode.string
        |> Decode.andThen
            (\url ->
                case Url.fromString url of
                    Just decoded ->
                        Decode.succeed decoded

                    Nothing ->
                        Decode.fail ("Unable to parse '" ++ url ++ "' as a URL.'")
            )
    )
        |> expectLabel label


encodeProtocol : Protocol -> Encode.Value
encodeProtocol proto =
    case proto of
        Http ->
            Encode.string "http"

        Https ->
            Encode.string "https"


protocolDecoder : Decoder Protocol
protocolDecoder =
    Decode.string
        |> Decode.andThen
            (\protoStr ->
                case protoStr of
                    "http" ->
                        Decode.succeed Http

                    "https" ->
                        Decode.succeed Https

                    _ ->
                        Decode.fail ("Unknown protocol: " ++ protoStr)
            )
