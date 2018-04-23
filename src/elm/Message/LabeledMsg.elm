module Message.LabeledMsg exposing (decoder, encode)

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode


decoder : Dict String (Decoder a) -> Decoder a
decoder decoders =
    Decode.field msgTypeField Decode.string
        |> Decode.andThen (decoderForType decoders)


encode : String -> Encode.Value -> Encode.Value
encode label value =
    Encode.object
        [ ( msgTypeField, Encode.string label )
        , ( msgDataField, value )
        ]



-- Helpers


msgTypeField : String
msgTypeField =
    "msgType"


msgDataField : String
msgDataField =
    "msg"


decoderForType : Dict String (Decoder a) -> String -> Decoder a
decoderForType decoders msgType =
    Dict.get msgType decoders
        |> Maybe.map (Decode.field msgDataField)
        |> Maybe.withDefault (Decode.fail ("Unknown message type: " ++ msgType))
