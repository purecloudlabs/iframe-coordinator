module FrameRouter exposing (createRouter, Model, Msg)

{-| The FrameRouter module is the Elm code that backs the frame-router custom element
in the iframe-coordinator toolkit. It handles mapping URL routes to components displayed
in a child frame as well as message validation and routing within the parent application.

This module is not currently designed for stand-alone use. You should instead use the
custom elements defined in LINK_TO_JS_LIB to create seamless iframe applications

@docs createRouter

-}

import Component exposing (Component)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Json.Decode as Decode exposing (decodeValue)
import Message.ComponentMsg as ComponentMsg exposing (ComponentMsg)
import Navigation exposing (Location)
import Path exposing (Path)


{-| Create a program to handle routing. Takes an input port to listen to messages on.
port binding is handled in the custom frame-router element in LINK_TO_JS_LIB_HERE
-}
createRouter :
    ((Decode.Value -> Msg) -> Sub Msg)
    -> Program Decode.Value Model Msg
createRouter inputPort =
    Navigation.programWithFlags
        (RouteChange << parseLocation)
        { init = init
        , update = update
        , view = view
        , subscriptions =
            \_ ->
                inputPort decodeComponentMsg
        }



-- Model


type alias Model =
    { components : Component.Registry
    , route : Path
    }


init : Decode.Value -> Location -> ( Model, Cmd Msg )
init componentJson location =
    ( { components = Component.decodeRegistry componentJson
      , route = parseLocation location
      }
    , Cmd.none
    )



-- Update


type Msg
    = RouteChange Path
    | ComponentMessage ComponentMsg
    | Unknown String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RouteChange route ->
            ( { model | route = route }, Cmd.none )

        ComponentMessage msg ->
            handleComponentMsg model msg

        Unknown err ->
            ( model, logWarning ("Unknown Msg: " ++ err) )


handleComponentMsg : Model -> ComponentMsg -> ( Model, Cmd Msg )
handleComponentMsg model msg =
    case msg of
        ComponentMsg.NavRequest location ->
            ( model, Navigation.newUrl location.hash )


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
    componentFrame [ src (url model.components model.route) ] []


url : Component.Registry -> Path -> String
url registry route =
    Component.urlForRoute registry route
        |> Maybe.withDefault "about:blank"


componentFrame : List (Attribute msg) -> List (Html msg) -> Html msg
componentFrame =
    Html.node "component-frame"


src : String -> Attribute msg
src value =
    attribute "src" value



-- Subs


decodeComponentMsg : Decode.Value -> Msg
decodeComponentMsg json =
    case
        Decode.decodeValue
            (Decode.map ComponentMessage ComponentMsg.decoder)
            json
    of
        Ok msg ->
            msg

        Err err ->
            Unknown err
