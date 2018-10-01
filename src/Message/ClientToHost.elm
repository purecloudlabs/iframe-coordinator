module Message.ClientToHost exposing
    ( ClientToHost(..)
    , decodeFromClient
    , encodeToHost
    )

import Dict
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import LabeledMessage
import Message.Navigation as Navigation exposing (Navigation)
import Message.PubSub as PubSub exposing (Publication)
import Message.Toast as Toast exposing (Toast)


type ClientToHost
    = NavRequest Navigation
    | Publish Publication
    | ToastRequest Toast


encodeToHost : ClientToHost -> Encode.Value
encodeToHost message =
    case message of
        NavRequest navigation ->
            Navigation.encode navigation

        Publish publication ->
            PubSub.encodePublication publication

        ToastRequest toast ->
            Toast.encode toast


decodeFromClient : Decoder ClientToHost
decodeFromClient =
    Decode.oneOf
        [ Decode.map NavRequest Navigation.decoder
        , Decode.map Publish PubSub.publicationDecoder
        , Decode.map ToastRequest Toast.decoder
        ]
