module Message.Toast exposing (Toast, decoder, encode, label)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)


type alias Toast =
    { title : String
    , message : String
    , custom : Maybe Decode.Value
    }


label : String
label =
    "toastRequest"


decoder : Decoder Toast
decoder =
    (Decode.succeed Toast
        |> optional "title" Decode.string ""
        |> required "message" Decode.string
        |> optional "custom" (Decode.maybe Decode.value) Nothing
    )
        |> expectLabel label


encode : Toast -> Encode.Value
encode toast =
    Encode.object
        [ ( "title", Encode.string toast.title )
        , ( "message", Encode.string toast.message )
        , ( "custom", Maybe.withDefault Encode.null toast.custom )
        ]
        |> withLabel label
