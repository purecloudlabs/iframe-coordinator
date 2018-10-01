module Message.Toast exposing (Toast, decoder, encode, label)

import Json.Decode as D
import Json.Decode.Pipeline exposing (decode, optional, required)
import Json.Encode as E
import LabeledMessage exposing (expectLabel, withLabel)


type alias Toast =
    { title : String
    , message : String
    , custom : Maybe D.Value
    }


label : String
label =
    "toastRequest"


decoder : D.Decoder Toast
decoder =
    (decode Toast
        |> optional "title" D.string ""
        |> required "message" D.string
        |> optional "custom" (D.maybe D.value) Nothing
    )
        |> expectLabel label


encode : Toast -> E.Value
encode toast =
    E.object
        [ ( "title", E.string toast.title )
        , ( "message", E.string toast.message )
        , ( "custom", Maybe.withDefault E.null toast.custom )
        ]
        |> withLabel label
