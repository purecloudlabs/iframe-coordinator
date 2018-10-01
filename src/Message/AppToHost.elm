module Message.AppToHost exposing (AppToHost(..), decodeFromApp)

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage
import Message.PubSub as PubSub exposing (Publication)


type AppToHost
    = Publish Publication
    | Subscribe String
    | Unsubscribe String


decodeFromApp : Decoder AppToHost
decodeFromApp =
    Decode.oneOf
        [ Decode.map Publish PubSub.publicationDecoder
        , Decode.map Subscribe PubSub.subscribeDecoder
        , Decode.map Unsubscribe PubSub.unsubscribeDecoder
        ]
