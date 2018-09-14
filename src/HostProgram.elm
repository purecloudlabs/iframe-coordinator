module HostProgram exposing (Model, Msg, create)

{-| The FrameRouter module is the Elm code that backs the frame-router custom element
in the iframe-coordinator toolkit. It handles mapping URL routes to clients displayed
in a child frame as well as message validation and routing within the parent application.

This module is not currently designed for stand-alone use. You should instead use the
custom elements defined in LINK\_TO\_JS\_LIB to create seamless iframe applications

@docs createRouter

-}

import ClientMessage exposing (ClientMessage)
import ClientRegistry exposing (Client, ClientRegistry)
import CommonMessages exposing (Publication)
import HostMessage exposing (HostMessage)
import Html exposing (Attribute, Html)
import Html.Attributes exposing (attribute)
import Html.Events exposing (on)
import Json.Decode as Decode exposing (Decoder, decodeValue)
import LabeledMessage
import Navigation exposing (Location)
import Path exposing (Path)
import Set exposing (Set)


{-| Create a program to handle routing. Takes an input port to listen to messages on.
port binding is handled in the custom frame-router element in LINK\_TO\_JS\_LIB\_HERE
-}
create :
    { fromHost : (Decode.Value -> Msg) -> Sub Msg
    , toHost : Decode.Value -> Cmd Msg
    }
    -> Program Decode.Value Model Msg
create ports =
    Navigation.programWithFlags
        (RouteChange << parseLocation)
        { init = init
        , update = update ports.toHost
        , view = view
        , subscriptions =
            subscriptions ports.fromHost
        }



-- Model


type alias Model =
    { clients : ClientRegistry
    , hostSubscriptions : Set String
    , route : Path
    }


init : Decode.Value -> Location -> ( Model, Cmd Msg )
init clientJson location =
    ( { clients = ClientRegistry.decode clientJson
      , hostSubscriptions = Set.empty
      , route = parseLocation location
      }
    , Cmd.none
    )



-- Update


type Msg
    = RouteChange Path
    | ClientMsg ClientMessage
    | HostMsg HostMessage
    | BadMessage String


update : (Decode.Value -> Cmd Msg) -> Msg -> Model -> ( Model, Cmd Msg )
update toHostPort msg model =
    case Debug.log "HostEvent" msg of
        RouteChange route ->
            ( { model | route = route }, Cmd.none )

        ClientMsg clientMsg ->
            handleClientMsg toHostPort model clientMsg

        HostMsg hostMsg ->
            handleHostMsg model hostMsg

        BadMessage err ->
            ( model, logWarning ("Bad Message: " ++ err) )


handleHostMsg : Model -> HostMessage -> ( Model, Cmd Msg )
handleHostMsg model msg =
    case msg of
        HostMessage.Subscribe topic ->
            ( { model | hostSubscriptions = Set.insert topic model.hostSubscriptions }
            , Cmd.none
            )

        HostMessage.Unsubscribe topic ->
            ( { model | hostSubscriptions = Set.remove topic model.hostSubscriptions }
            , Cmd.none
            )


handleClientMsg : (Decode.Value -> Cmd Msg) -> Model -> ClientMessage -> ( Model, Cmd Msg )
handleClientMsg toHostPort model msg =
    case msg of
        ClientMessage.NavRequest location ->
            ( model, Navigation.newUrl location.hash )

        --TODO: We should probably decorate messages outbound to the host app with details about the client they came from
        ClientMessage.Publish publication ->
            ( model, dispatchPublication toHostPort model.hostSubscriptions publication )


dispatchPublication : (Decode.Value -> Cmd Msg) -> Set String -> Publication -> Cmd Msg
dispatchPublication toHostPort hostSubscriptions publication =
    if Set.member publication.topic hostSubscriptions then
        toHostPort
            (CommonMessages.encodePublication publication
                |> LabeledMessage.encode CommonMessages.publishLabel
            )

    else
        Cmd.none


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
    on "clientMessage" (Decode.field "detail" ClientMessage.decoder |> Decode.map ClientMsg)



-- subscriptions


subscriptions : ((Decode.Value -> Msg) -> Sub Msg) -> Model -> Sub Msg
subscriptions fromHost model =
    fromHost
        (messageDecoder
            (Decode.map HostMsg HostMessage.decoder)
            "Bad message from host app:"
        )


messageDecoder : Decoder Msg -> String -> Decode.Value -> Msg
messageDecoder decoder errorText value =
    case Decode.decodeValue decoder value of
        Ok msg ->
            msg

        Err err ->
            BadMessage (errorText ++ " " ++ err)
