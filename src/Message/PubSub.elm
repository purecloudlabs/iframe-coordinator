module Message.PubSub exposing
    ( Publication
    , encodePublication
    , publicationDecoder
    , publishLabel
    , subscribeDecoder
    , subscribeLabel
    , unsubscribeDecoder
    , unsubscribeLabel
    )

import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)


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
        |> expectLabel publishLabel


encodePublication : Publication -> Value
encodePublication publication =
    Encode.object
        [ ( "topic", Encode.string publication.topic )
        , ( "payload", publication.payload )
        ]
        |> withLabel publishLabel


subscribeLabel : String
subscribeLabel =
    "subscribe"


subscribeDecoder : Decoder String
subscribeDecoder =
    Decode.string |> expectLabel subscribeLabel


encodeSubscribe : String -> Value
encodeSubscribe topic =
    Encode.string topic |> withLabel subscribeLabel


unsubscribeLabel : String
unsubscribeLabel =
    "unsubscribe"


unsubscribeDecoder : Decoder String
unsubscribeDecoder =
    Decode.string |> expectLabel unsubscribeLabel


encodeUnbsubscribe : String -> Value
encodeUnbsubscribe topic =
    Encode.string topic |> withLabel unsubscribeLabel
