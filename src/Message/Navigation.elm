module Message.Navigation exposing (Navigation, decoder, encode, label, urlDecoder)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)
import Url exposing (Protocol(..), Url)


type alias Navigation =
    Url


label : String
label =
    "navRequest"


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


urlDecoder : Decoder Navigation
urlDecoder =
    (Decode.string
        |> Decode.andThen
            (\url ->
                case Url.fromString (Debug.log "URL" url) of
                    Just decoded ->
                        Decode.succeed (Debug.log "Decoded" decoded)

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
