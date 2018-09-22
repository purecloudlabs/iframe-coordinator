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
import Navigation exposing (Location)
import Path exposing (Path)
import Set exposing (Set)
import LabeledMessage


{-| Create a program to handle routing. Takes an input port to listen to messages on.
port binding is handled in the custom frame-router element in LINK_TO_JS_LIB_HERE
-}
create :
    { fromClient : (Decode.Value -> Msg) -> Sub Msg
    , toHost : Decode.Value -> Cmd Msg
    }
    -> Program Decode.Value Model Msg
create ports =
    Html.programWithFlags
        { init = init
        , update = update ports.toHost
        , view = view
        , subscriptions =
            \_ ->
                ports.fromClient decodeClientMsg
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
    | Unknown String


update : (Decode.Value -> Cmd Msg) -> Msg -> Model -> ( Model, Cmd Msg )
update toHost msg model =
    case msg of
        ClientMsg msg ->
            handleClientMsg toHost model msg

        Unknown err ->
            ( model, logWarning ("Unknown Msg: " ++ err) )


handleClientMsg :
    (Decode.Value -> Cmd Msg)
    -> Model
    -> ClientMessage
    -> ( Model, Cmd Msg)
handleClientMsg toHost model msg =
    case msg of
        ClientMessage.NavRequest location ->
            ( { model | route = parseLocation location }, toHost (ClientMessage.encode msg ) )


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
