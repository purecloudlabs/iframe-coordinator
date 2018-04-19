port module FrameRouter exposing (main)

import Component exposing (Component)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Json.Decode as Decode exposing (decodeValue)
import Message.ComponentMsg as ComponentMsg exposing (ComponentMsg)
import Navigation exposing (Location)
import Path exposing (Path)


main : Program Decode.Value Model Msg
main =
    Navigation.programWithFlags
        (RouteChange << parseLocation)
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
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


subscriptions : Model -> Sub Msg
subscriptions model =
    componentIn decodeComponentMsg


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


port componentIn : (Decode.Value -> msg) -> Sub msg
