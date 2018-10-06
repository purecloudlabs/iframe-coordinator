module Fixture.ToastMessage exposing (encodeV1, toastFuzzer, v1Fuzzer)

import Fuzz exposing (Fuzzer, int, list, string)
import Json.Decode as Decode
import Json.Encode as Encode
import LabeledMessage exposing (withLabel)
import Message.Toast exposing (Toast)


toastFuzzer : Fuzzer Toast
toastFuzzer =
    Fuzz.map4 Toast
        Fuzz.string
        Fuzz.string
        (Fuzz.maybe (Fuzz.constant Encode.null))
        (Fuzz.oneOf
            [ Fuzz.constant "info"
            , Fuzz.constant "warning"
            , Fuzz.constant "error"
            ]
        )



-- Old Versions


type alias ToastV1 =
    { title : Maybe String
    , message : String
    , custom : Maybe Decode.Value
    }


v1Fuzzer : Fuzzer ToastV1
v1Fuzzer =
    Fuzz.map3 ToastV1
        (Fuzz.maybe Fuzz.string)
        Fuzz.string
        (Fuzz.maybe (Fuzz.constant Encode.null))


encodeV1 : ToastV1 -> Encode.Value
encodeV1 toast =
    [ Maybe.map (\title -> ( "title", Encode.string title )) toast.title
    , Just ( "message", Encode.string toast.message )
    , Maybe.map (\custom -> ( "custom", custom )) toast.custom
    ]
        |> List.filterMap identity
        |> Encode.object
        |> withLabel "toastRequest"
