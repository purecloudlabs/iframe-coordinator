module Message.AppToHost exposing (AppToHost(..), decodeFromApp)

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage exposing (expectLabel)
import Message.PubSub as PubSub exposing (Publication)
import Path exposing (Path)


type AppToHost
    = Publish Publication
    | Subscribe String
    | Unsubscribe String
    | RouteChange Path


decodeFromApp : Decoder AppToHost
decodeFromApp =
    Decode.oneOf
        [ Decode.map Publish PubSub.publicationDecoder
        , Decode.map Subscribe PubSub.subscribeDecoder
        , Decode.map Unsubscribe PubSub.unsubscribeDecoder
        , Decode.map RouteChange (Path.decoder |> expectLabel "routeChange")
        ]
