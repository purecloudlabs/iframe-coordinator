module HostProgram exposing (Model, Msg, create)

{-| The FrameRouter module is the Elm code that backs the frame-router custom element
in the iframe-coordinator toolkit. It handles mapping URL routes to clients displayed
in a child frame as well as message validation and routing within the parent application.

This module is not currently designed for stand-alone use. You should instead use the
custom elements defined in LINK\_TO\_JS\_LIB to create seamless iframe applications

@docs createRouter

-}

import ClientRegistry exposing (Client, ClientRegistry)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Html.Events exposing (on)
import Json.Decode as Decode exposing (Decoder, decodeValue)
import Message.AppToHost as AppToHost exposing (AppToHost)
import Message.ClientToHost as ClientToHost exposing (ClientToHost)
import Message.HostToApp as HostToApp exposing (HostToApp)
import Message.HostToClient as HostToClient exposing (HostToClient)
import Navigation exposing (Location)
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
    Navigation.programWithFlags
        (RouteChange << parseLocation)
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


init : Decode.Value -> Location -> ( Model, Cmd Msg )
init clientJson location =
    ( { clients = ClientRegistry.decode clientJson
      , subscriptions = Set.empty
      , route = parseLocation location
      }
    , Cmd.none
    )



-- Update


type Msg
    = RouteChange Path
    | ClientMsg ClientToHost
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
        RouteChange route ->
            ( { model | route = route }, Cmd.none )

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
            ( model, Navigation.newUrl location.hash )

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


parseLocation : Location -> Path
parseLocation location =
    String.dropLeft 1 location.hash
        |> Path.parse


logWarning : String -> Cmd Msg
logWarning errMsg =
    let
        _ =
            Debug.log errMsg
    in
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
            BadMessage (errorText ++ " " ++ err)
