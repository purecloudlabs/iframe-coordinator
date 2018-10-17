module Message.PubSub exposing
    ( Publication, encodePublication, publicationDecoder, publishLabel
    , subscribeDecoder, subscribeLabel, unsubscribeDecoder, unsubscribeLabel
    )

{-| The other messages in this library cover common use cases for coordination
between host and client applications, but there is often some coordination
required specific to the application domain. To that end, the Message.PubSub
module provides a set of types for publishing to topics as well as subscribing
and unsubscribing from them.


# Publishing

@docs Publication, encodePublication, publicationDecoder, publishLabel


# Subscription Management

@docs subscribeDecoder, subscribeLabel, unsubscribeDecoder, unsubscribeLabel

-}

import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)


{-| This is the type used by host and client applications to publish any data
to a topic.
-}
type alias Publication =
    { topic : String
    , payload : Value
    }


{-| This is the label used to tag publish events in JSON. Other modules should
not need to reference it, but it is exposed to force a package version bump if
it changes.
-}
publishLabel : String
publishLabel =
    "publish"


{-| Decoder for publication messages, which are expected to be tagged with
`publishLabel`
-}
publicationDecoder : Decoder Publication
publicationDecoder =
    Decode.map2 Publication
        (Decode.field "topic" Decode.string)
        (Decode.field "payload" Decode.value)
        |> expectLabel publishLabel


{-| Encodes a Publication to JSON, tagging it with `publishLabel`
-}
encodePublication : Publication -> Value
encodePublication publication =
    Encode.object
        [ ( "topic", Encode.string publication.topic )
        , ( "payload", publication.payload )
        ]
        |> withLabel publishLabel


{-| This is the label used to tag subscribe requests in JSON. Other modules should
not need to reference it, but it is exposed to force a package version bump if
it changes.
-}
subscribeLabel : String
subscribeLabel =
    "subscribe"


{-| Decoder for subscription requests, which are just a topic string
tagged with `subscribeLabel`.
-}
subscribeDecoder : Decoder String
subscribeDecoder =
    Decode.string |> expectLabel subscribeLabel


{-| Encodes a subscription request to JSON and tags it with `subscribeLabel`.
-}
encodeSubscribe : String -> Value
encodeSubscribe topic =
    Encode.string topic |> withLabel subscribeLabel


{-| This is the label used to tag unsubscribe requests in JSON. Other modules
should not need to reference it, but it is exposed to force a package version
bump if it changes.
-}
unsubscribeLabel : String
unsubscribeLabel =
    "unsubscribe"


{-| Decoder for unsubscribe requests, which are just a topic string
tagged with `unsubscribeLabel`.
-}
unsubscribeDecoder : Decoder String
unsubscribeDecoder =
    Decode.string |> expectLabel unsubscribeLabel


{-| Encodes an unsubscribe request to JSON and tags it with `unsubscribeLabel`.
-}
encodeUnbsubscribe : String -> Value
encodeUnbsubscribe topic =
    Encode.string topic |> withLabel unsubscribeLabel
