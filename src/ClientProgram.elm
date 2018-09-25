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

import ClientMessage exposing (ClientMessage)
import CommonMessages exposing (Publication)
import HostMessage exposing (HostMessage)
import Json.Decode as Decode exposing (Decoder)
import LabeledMessage
import Platform exposing (Program, program)
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
    -> Program Never Model Msg
create ports =
    program
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


init : ( Model, Cmd Msg )
init =
    ( { subscriptions = Set.empty }, Cmd.none )



-- Update


type Msg
    = Unknown String
    | ClientMsg ClientMessage
    | HostMsg HostMessage


update :
    { a
        | toHost : Decode.Value -> Cmd Msg
        , toClient : Decode.Value -> Cmd Msg
    }
    -> Msg
    -> Model
    -> ( Model, Cmd Msg )
update ports msg model =
    case Debug.log "ClientEvent" msg of
        Unknown value ->
            ( model, logWarning ("No handler for unknown message: " ++ toString value) )

        ClientMsg message ->
            handleClientMessage ports.toHost message model

        HostMsg message ->
            handleHostMessage ports.toClient message model


handleClientMessage : (Decode.Value -> Cmd Msg) -> ClientMessage -> Model -> ( Model, Cmd Msg )
handleClientMessage toHostPort msg model =
    case msg of
        ClientMessage.NavRequest _ ->
            ( model, toHostPort (ClientMessage.encode msg) )

        ClientMessage.Publish _ ->
            ( model, toHostPort (ClientMessage.encode msg) )

        ClientMessage.Subscribe topic ->
            ( { model | subscriptions = Set.insert topic model.subscriptions }, Cmd.none )

        ClientMessage.Unsubscribe topic ->
            ( { model | subscriptions = Set.remove topic model.subscriptions }, Cmd.none )


handleHostMessage : (Decode.Value -> Cmd Msg) -> HostMessage -> Model -> ( Model, Cmd Msg )
handleHostMessage toClientPort msg model =
    case msg of
        HostMessage.Publish publication ->
            ( model, dispatchPublication toClientPort model.subscriptions publication )

        _ ->
            Debug.crash "Need to distinguish between internal and external messages"


dispatchPublication : (Decode.Value -> Cmd Msg) -> Set String -> Publication -> Cmd Msg
dispatchPublication destinationPort subscriptions publication =
    if Set.member publication.topic subscriptions then
        destinationPort
            (CommonMessages.encodePublication publication
                |> LabeledMessage.encode CommonMessages.publishLabel
            )

    else
        Cmd.none


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
        [ fromClient (messageDecoder ClientMsg ClientMessage.decoder)
        , fromHost (messageDecoder HostMsg (Decode.field "data" HostMessage.decoder))
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
            Unknown err