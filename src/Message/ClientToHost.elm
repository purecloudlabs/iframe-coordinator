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
    let
        ( label, value ) =
            case message of
                NavRequest location ->
                    ( Navigation.label, Navigation.encode location )

                Publish publication ->
                    ( PubSub.publishLabel, PubSub.encodePublication publication )

                ToastRequest toast ->
                    ( Toast.label, Toast.encode toast )
    in
    LabeledMessage.encode label value


decodeFromClient : Decoder ClientToHost
decodeFromClient =
    LabeledMessage.decoder
        (Dict.fromList
            [ ( Navigation.label, Decode.map NavRequest Navigation.decoder )
            , ( PubSub.publishLabel, Decode.map Publish PubSub.publicationDecoder )
            , ( Toast.label, Decode.map ToastRequest Toast.decoder )
            ]
        )
