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
    Decode.oneOf
        [ Decode.map NavRequest Navigation.urlDecoder
        , Decode.map Publish PubSub.publicationDecoder
        , Decode.map Subscribe PubSub.subscribeDecoder
        , Decode.map Unsubscribe PubSub.unsubscribeDecoder
        , Decode.map ToastRequest Toast.decoder
        ]
