module Message.PubSub exposing (Publication, encodePublication, publicationDecoder, publishLabel, subscribeLabel, unsubscribeLabel)

import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode


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


subscribeLabel : String
subscribeLabel =
    "subscribe"


unsubscribeLabel : String
unsubscribeLabel =
    "unsubscribe"
