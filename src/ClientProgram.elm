module ClientProgram exposing (create, Model, Msg)

{-| The ClientProgram module is the Elm code that backs the client-side JS helper
library in the iframe-coordinator library. It message handles message validation
and delivery to and from clients.

This module is not currently designed for stand-alone use. You should instead use the
client library defined in iframe-coordinator to create seamless iframe applications

@docs create

-}

import Json.Decode as Decode
import ClientMessage exposing (ClientMessage)
import Platform exposing (Program, program)


{-| Create a program to handle client messages. Takes an record of ports to send and
receive messages on. Communication with the parent application and the local client
code are handled through four ports, an input and output pair for the client
application and another pair for the host. Port bindings are handled and exposed
via the iframe-coordinator library.
-}
create :
    { fromHost : (Decode.Value -> Msg) -> Sub Msg
    , toHost : Decode.Value -> Cmd Msg
    , fromClient : (Decode.Value -> Msg) -> Sub Msg
    }
    -> Program Never Model Msg
create ports =
    program
        { init = init
        , update = update ports.toHost
        , subscriptions =
            subscriptions
                ports.fromClient
                ports.fromHost
        }



-- Model


type alias Model =
    {}


init : ( Model, Cmd Msg )
init =
    ( {}, Cmd.none )



-- Update


type Msg
    = Unknown String
    | ClientMsg ClientMessage
    | HostMessage Decode.Value


update : (Decode.Value -> Cmd Msg) -> Msg -> Model -> ( Model, Cmd Msg )
update toHost msg model =
    case Debug.log "Message" msg of
        Unknown value ->
            ( model, logWarning ("No handler for unknown message: " ++ toString value) )

        ClientMsg message ->
            handleClientMessage toHost model message

        HostMessage value ->
            ( model, logWarning ("No handler for host messages" ++ toString value) )


handleClientMessage :
    (Decode.Value -> Cmd Msg)
    -> Model
    -> ClientMessage
    -> ( Model, Cmd Msg )
handleClientMessage toHost model msg =
    case msg of
        ClientMessage.NavRequest _ ->
            ( model, toHost (ClientMessage.encode msg) )


logWarning : String -> Cmd Msg
logWarning errMsg =
    let
        _ =
            Debug.log errMsg
    in
        Cmd.none



-- Subscriptions


subscriptions :
    ((Decode.Value -> Msg) -> Sub Msg)
    -> ((Decode.Value -> Msg) -> Sub Msg)
    -> Model
    -> Sub Msg
subscriptions fromClient fromHost _ =
    Sub.batch
        [ fromClient clientMessageDecoder
        , fromHost HostMessage
        ]


clientMessageDecoder : Decode.Value -> Msg
clientMessageDecoder value =
    case
        Decode.decodeValue
            (Decode.map ClientMsg ClientMessage.decoder)
            value
    of
        Ok msg ->
            msg

        Err err ->
            Unknown err
