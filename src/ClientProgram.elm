module ClientProgram exposing
    ( create
    , Model, Msg
    )

{-| The ClientProgram module is the Elm code that backs the client-side JS helper
library in the iframe-coordinator library. It message handles message validation
and delivery to and from clients.
This module is not currently designed for stand-alone use. You should instead use the
client library defined in iframe-coordinator to create seamless iframe applications

@docs create

-}

import Json.Decode as Decode exposing (Decoder)
import Message.AppToClient as AppToClient exposing (AppToClient)
import Message.ClientToApp as ClientToApp exposing (ClientToApp)
import Message.ClientToHost as ClientToHost exposing (ClientToHost)
import Message.HostToClient as HostToClient exposing (HostToClient)
import Platform exposing (Program, worker)
import Set exposing (Set)


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
    , toClient : Decode.Value -> Cmd Msg
    }
    -> Program () Model Msg
create ports =
    worker
        { init = init
        , update = update ports
        , subscriptions =
            subscriptions
                ports.fromClient
                ports.fromHost
        }



-- Model


type alias Model =
    { subscriptions : Set String }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { subscriptions = Set.empty }, Cmd.none )



-- Update


type Msg
    = BadMessage Decode.Error
    | ClientMsg AppToClient
    | HostMsg HostToClient


update :
    { a
        | toHost : Decode.Value -> Cmd Msg
        , toClient : Decode.Value -> Cmd Msg
    }
    -> Msg
    -> Model
    -> ( Model, Cmd Msg )
update ports msg model =
    case msg of
        ClientMsg message ->
            handleAppMessage ports.toHost message model

        HostMsg message ->
            handleHostMessage ports.toClient message model

        BadMessage error ->
            ( model
            , logWarning
                ("Could not parse incoming message: "
                    ++ Decode.errorToString error
                )
            )


handleAppMessage : (Decode.Value -> Cmd Msg) -> AppToClient -> Model -> ( Model, Cmd Msg )
handleAppMessage toHostPort msg model =
    let
        sendToHost =
            sendHostMessage toHostPort
    in
    case msg of
        AppToClient.NavRequest navigation ->
            ( model, sendToHost (ClientToHost.NavRequest navigation) )

        AppToClient.Publish publication ->
            ( model, sendToHost (ClientToHost.Publish publication) )

        AppToClient.Subscribe topic ->
            ( { model | subscriptions = Set.insert topic model.subscriptions }, Cmd.none )

        AppToClient.Unsubscribe topic ->
            ( { model | subscriptions = Set.remove topic model.subscriptions }, Cmd.none )

        AppToClient.ToastRequest toast ->
            ( model, sendToHost (ClientToHost.ToastRequest toast) )


handleHostMessage : (Decode.Value -> Cmd Msg) -> HostToClient -> Model -> ( Model, Cmd Msg )
handleHostMessage toClientPort msg model =
    let
        sendToApp =
            sendAppMessage toClientPort
    in
    case msg of
        HostToClient.Publish publication ->
            ( model
            , if Set.member publication.topic model.subscriptions then
                sendToApp (ClientToApp.Publish publication)

              else
                Cmd.none
            )


sendHostMessage : (Decode.Value -> Cmd Msg) -> ClientToHost -> Cmd Msg
sendHostMessage hostPort message =
    ClientToHost.encodeToHost message
        |> hostPort


sendAppMessage : (Decode.Value -> Cmd Msg) -> ClientToApp -> Cmd Msg
sendAppMessage appPort message =
    ClientToApp.encodeToApp message
        |> appPort


logWarning : String -> Cmd Msg
logWarning errMsg =
    Debug.log errMsg Cmd.none



-- Subscriptions


subscriptions :
    ((Decode.Value -> Msg) -> Sub Msg)
    -> ((Decode.Value -> Msg) -> Sub Msg)
    -> Model
    -> Sub Msg
subscriptions fromClient fromHost _ =
    Sub.batch
        [ fromClient (messageDecoder ClientMsg AppToClient.decodeFromApp)
        , fromHost (messageDecoder HostMsg (Decode.field "data" HostToClient.decodeFromHost))
        ]


messageDecoder : (a -> Msg) -> Decoder a -> Decode.Value -> Msg
messageDecoder label decoder value =
    case
        Decode.decodeValue
            (Decode.map label decoder)
            value
    of
        Ok msg ->
            msg

        Err err ->
            BadMessage err
