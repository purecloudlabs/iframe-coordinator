module HostProgram exposing (create)

{-| The HostProgram module is the Elm code that backs the frame-router custom element
used in host applications. It handles mapping application routes to clients displayed
in a child frame as well as message validation and routing within the parent application.


# Create a program

@docs create

-}

import Browser
import ClientRegistry exposing (Client, ClientRegistry)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Html.Events exposing (on)
import Json.Decode as Decode exposing (Decoder, decodeValue)
import Message.AppToHost as AppToHost exposing (AppToHost)
import Message.ClientToHost as ClientToHost exposing (ClientToHost)
import Message.HostToApp as HostToApp exposing (HostToApp)
import Message.HostToClient as HostToClient exposing (HostToClient)
import Path exposing (Path)
import Set exposing (Set)


{-| Create a program to handle routing. Takes an input port to listen to messages on
and and outputPort to deliver messages to the js embedder.
port binding is handled in the custom frame-router element in LINK\_TO\_JS\_LIB\_HERE
-}
create :
    { fromHost : (Decode.Value -> Msg) -> Sub Msg
    , toHost : Decode.Value -> Cmd Msg
    , toClient : Decode.Value -> Cmd Msg
    }
    -> Program Decode.Value Model Msg
create ports =
    Browser.element
        { init = init
        , update = update ports
        , view = view
        , subscriptions =
            subscriptions ports.fromHost
        }



-- Model


type alias Model =
    { clients : ClientRegistry
    , subscriptions : Set String
    , route : Path
    }


init : Decode.Value -> ( Model, Cmd Msg )
init clientJson =
    --TODO: Warn somehow if some clients fail to decode
    ( { clients = ClientRegistry.decode clientJson
      , subscriptions = Set.empty
      , route = Path.parse "/"
      }
    , Cmd.none
    )



-- Update


type Msg
    = ClientMsg ClientToHost
    | HostMsg AppToHost
    | BadMessage String


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
        ClientMsg clientMsg ->
            handleClientMsg ports.toHost model clientMsg

        HostMsg hostMsg ->
            handleHostMsg ports.toClient model hostMsg

        BadMessage err ->
            ( model, logWarning ("Bad Message: " ++ err) )


handleHostMsg : (Decode.Value -> Cmd Msg) -> Model -> AppToHost -> ( Model, Cmd Msg )
handleHostMsg toClientPort model msg =
    let
        sendToClient =
            sendClientMessage toClientPort
    in
    case msg of
        AppToHost.RouteChange path ->
            ( { model | route = path }, Cmd.none )

        AppToHost.Subscribe topic ->
            ( { model | subscriptions = Set.insert topic model.subscriptions }
            , Cmd.none
            )

        AppToHost.Unsubscribe topic ->
            ( { model | subscriptions = Set.remove topic model.subscriptions }
            , Cmd.none
            )

        AppToHost.Publish publication ->
            ( model, sendToClient (HostToClient.Publish publication) )


handleClientMsg : (Decode.Value -> Cmd Msg) -> Model -> ClientToHost -> ( Model, Cmd Msg )
handleClientMsg toAppPort model msg =
    let
        sendToApp =
            sendAppMessage toAppPort
    in
    case msg of
        ClientToHost.NavRequest location ->
            ( model, sendToApp (HostToApp.NavRequest location) )

        --TODO: We should probably decorate messages outbound to the host app with details about the client they came from
        ClientToHost.Publish publication ->
            ( model
            , if Set.member publication.topic model.subscriptions then
                sendToApp (HostToApp.Publish publication)

              else
                Cmd.none
            )

        ClientToHost.ToastRequest toast ->
            ( model, sendToApp (HostToApp.ToastRequest toast) )


logWarning : String -> Cmd Msg
logWarning errMsg =
    -- TODO: message app to trigger logging
    Cmd.none


sendAppMessage : (Decode.Value -> Cmd Msg) -> HostToApp -> Cmd Msg
sendAppMessage appPort message =
    HostToApp.encodeToApp message
        |> appPort


sendClientMessage : (Decode.Value -> Cmd Msg) -> HostToClient -> Cmd Msg
sendClientMessage clientPort message =
    HostToClient.encodeToClient message
        |> clientPort



-- View


view : Model -> Html Msg
view model =
    clientFrame [ src (url model.clients model.route), onClientMessage ] []


url : ClientRegistry -> Path -> String
url registry route =
    ClientRegistry.urlForRoute registry route
        |> Maybe.withDefault "about:blank"


clientFrame : List (Attribute msg) -> List (Html msg) -> Html msg
clientFrame =
    Html.node "x-ifc-frame"


src : String -> Attribute msg
src value =
    attribute "src" value


onClientMessage : Attribute Msg
onClientMessage =
    on "clientMessage" (Decode.field "detail" ClientToHost.decodeFromClient |> Decode.map ClientMsg)



-- subscriptions


subscriptions : ((Decode.Value -> Msg) -> Sub Msg) -> Model -> Sub Msg
subscriptions fromHost model =
    fromHost
        (messageDecoder
            (Decode.map HostMsg AppToHost.decodeFromApp)
            "Bad message from host app:"
        )


messageDecoder : Decoder Msg -> String -> Decode.Value -> Msg
messageDecoder decoder errorText value =
    case Decode.decodeValue decoder value of
        Ok msg ->
            msg

        Err err ->
            BadMessage (errorText ++ " " ++ Decode.errorToString err)
