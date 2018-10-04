module Message.AppToHost exposing (AppToHost(..), decodeFromApp)

{-| This module exposes a type representing all of the messages that can be
passed from a host application to the host library. It's a fairly direct
mapping to the host-facing API.

@docs AppToHost, decodeFromApp

-}

import Dict
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage exposing (expectLabel)
import Message.PubSub as PubSub exposing (Publication)
import Path exposing (Path)


{-| This custom type is just a set of variants for each valid message the app
can send to the host library. See the individual type descriptions for more
details on message structures.
-}
type AppToHost
    = Publish Publication
    | Subscribe String
    | Unsubscribe String
    | RouteChange Path


{-| Decoder for parsing incoming messages from the application to the relevant
types. Bad input from apps will produce nice console errors that describe the
exact failure.
-}
decodeFromApp : Decoder AppToHost
decodeFromApp =
    Decode.oneOf
        [ Decode.map Publish PubSub.publicationDecoder
        , Decode.map Subscribe PubSub.subscribeDecoder
        , Decode.map Unsubscribe PubSub.unsubscribeDecoder
        , Decode.map RouteChange (Path.decoder |> expectLabel "routeChange")
        ]
