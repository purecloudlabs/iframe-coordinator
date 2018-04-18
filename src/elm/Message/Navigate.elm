module Message.Navigate exposing (decoder, encode)

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode


decoder : Decoder String
decoder =
    Decode.field "msgType" Decode.string
        |> Decode.andThen
            (\msgType ->
                if msgType == "navigate" then
                    Decode.field "msg" Decode.string
                else
                    Decode.fail ("invalid msgType: " ++ msgType)
            )


encode : String -> Encode.Value
encode url =
    encodeExternalMsg msgLabel (Encode.string url)


msgLabel : String
msgLabel =
    "navigate"


type alias ExternalMsg =
    { msgType : String
    , msg : Decode.Value
    }


encodeExternalMsg : String -> Encode.Value -> Encode.Value
encodeExternalMsg msgType data =
    Encode.object
        [ ( "msgType", Encode.string msgType )
        , ( "msg", data )
        ]
