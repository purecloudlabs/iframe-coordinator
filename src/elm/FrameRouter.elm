port module FrameRouter exposing (main)

import Component exposing (Component)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Json.Decode as Decode exposing (decodeValue)
import List.Extra as ListEx
import Navigation exposing (Location)
import Path exposing (Path)


main : Program Decode.Value Model Msg
main =
    Navigation.programWithFlags
        (RouteChange << parseLocation)
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
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


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RouteChange route ->
            ( { model | route = route }, Cmd.none )


parseLocation : Location -> Path
parseLocation location =
    String.dropLeft 1 location.hash
        |> Path.parse



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
