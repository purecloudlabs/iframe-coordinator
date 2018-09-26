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
    LabeledMessage.decoder
        (Dict.fromList
            [ ( PubSub.publishLabel, Decode.map Publish PubSub.publicationDecoder )
            , ( PubSub.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( PubSub.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            ]
        )
