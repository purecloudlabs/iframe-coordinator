module Message.AppToClient exposing (AppToClient(..), decodeFromApp)

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage
import Message.Navigation as Navigation exposing (Navigation)
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)


type AppToClient
    = NavRequest Navigation
    | Publish Publication
    | Subscribe String
    | Unsubscribe String
    | ToastRequest Toast


decodeFromApp : Decoder AppToClient
decodeFromApp =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( Navigation.label, Decode.map NavRequest Navigation.decoder )
            , ( PubSub.publishLabel, Decode.map Publish PubSub.publicationDecoder )
            , ( PubSub.subscribeLabel, Decode.map Subscribe Decode.string )
            , ( PubSub.unsubscribeLabel, Decode.map Unsubscribe Decode.string )
            , ( Toast.label, Decode.map ToastRequest Toast.decoder )
            ]
        )
