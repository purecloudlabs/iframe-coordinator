module HostProgram exposing (create, Model, Msg)

{-| The FrameRouter module is the Elm code that backs the frame-router custom element
in the iframe-coordinator toolkit. It handles mapping URL routes to clients displayed
in a child frame as well as message validation and routing within the parent application.

This module is not currently designed for stand-alone use. You should instead use the
custom elements defined in LINK_TO_JS_LIB to create seamless iframe applications

@docs createRouter

-}

import ClientRegistry exposing (ClientRegistry)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Json.Decode as Decode exposing (decodeValue)
import ClientMessage exposing (ClientMessage)
import HostMessage exposing (HostMessage)
import Navigation exposing (Location)
import Path exposing (Path)
import Set exposing (Set)
import LabeledMessage
import CommonMessages exposing (Publication)


{-| Create a program to handle routing. Takes an input port to listen to messages on.
port binding is handled in the custom frame-router element in LINK_TO_JS_LIB_HERE
-}
create :
    { fromHost : (Decode.Value -> Msg) -> Sub Msg
    , fromClient : (Decode.Value -> Msg) -> Sub Msg
    , toHost : Decode.Value -> Cmd Msg
    , toClient : Decode.Value -> Cmd Msg
    }
    -> Program Decode.Value Model Msg
create ports =
    Html.programWithFlags
        { init = init
        , update = update ports
        , view = view
        , subscriptions =
            subscriptions
                ports.fromClient
                ports.fromHost
        }



-- Model


type alias Model =
    { clients : ClientRegistry
    , hostSubscriptions : Set String
    , route : Path
    }


init : Decode.Value -> ( Model, Cmd Msg )
init clientJson =
    ( { clients = ClientRegistry.decode clientJson, hostSubscriptions = Set.empty, route = Path.parse("/") }, Cmd.none )


-- Update


type Msg
    = ClientMsg ClientMessage
    | HostMsg HostMessage
    | Unknown String


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
        ClientMsg msg ->
            handleClientMsg ports.toHost model msg

        HostMsg msg ->
            handleHostMsg ports.toClient model msg

        Unknown err ->
            ( model, logWarning ("Unknown Msg: " ++ err) )


handleClientMsg :
    (Decode.Value -> Cmd Msg)
    -> Model
    -> ClientMessage
    -> (Model, Cmd Msg)
handleClientMsg toHost model msg =
    case msg of
        ClientMessage.NavRequest location ->
            ( model, toHost (ClientMessage.encode msg ) )

        _ ->
            Debug.crash "Need to distinguish between internal and external messages"

handleHostMsg :
    (Decode.Value -> Cmd Msg)
    -> Model
    -> HostMessage
    -> (Model, Cmd Msg)
handleHostMsg toClient model msg =
    case msg of
        HostMessage.NavRequest location ->
            ( { model | route = parseLocation location }, Cmd.none )

        HostMessage.Subscribe topic ->
            ( { model | hostSubscriptions = Set.insert topic model.hostSubscriptions }
            , Cmd.none
            )

        HostMessage.Unsubscribe topic ->
            ( { model | hostSubscriptions = Set.remove topic model.hostSubscriptions }
            , Cmd.none
            )

        HostMessage.Publish publication ->
            ( model, dispatchClientPublication toClient publication )

dispatchHostPublication : (Decode.Value -> Cmd Msg) -> Set String -> Publication -> Cmd Msg
dispatchHostPublication toHost hostSubscriptions publication =
    if Set.member publication.topic hostSubscriptions then
        toHost
            (CommonMessages.encodePublication publication
                |> LabeledMessage.encode CommonMessages.publishLabel
            )

    else
        Cmd.none


dispatchClientPublication : (Decode.Value -> Cmd Msg) -> Publication -> Cmd Msg
dispatchClientPublication toClient publication =
    toClient
        (CommonMessages.encodePublication publication
            |> LabeledMessage.encode CommonMessages.publishLabel
        )

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


-- View


view : Model -> Html Msg
view model =
    clientFrame [ src (url model.clients model.route) ] []


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



-- Subs


decodeClientMsg : Decode.Value -> Msg
decodeClientMsg json =
    case
        Decode.decodeValue
            (Decode.map ClientMsg ClientMessage.decoder)
            json
    of
        Ok msg ->
            msg

        Err err ->
            Unknown err

decodeHostMsg : Decode.Value -> Msg
decodeHostMsg json =
    case
        Decode.decodeValue
            (Decode.map HostMsg HostMessage.decoder)
            json
    of
        Ok msg ->
            msg

        Err err ->
            Unknown err

-- Subscriptions


subscriptions :
    ((Decode.Value -> Msg) -> Sub Msg)
    -> ((Decode.Value -> Msg) -> Sub Msg)
    -> Model
    -> Sub Msg
subscriptions fromClient fromHost _ =
    Sub.batch
        [ fromClient decodeClientMsg
        , fromHost decodeHostMsg
        ]