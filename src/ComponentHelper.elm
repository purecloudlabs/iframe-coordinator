 module ComponentHelper exposing (create)

{-| The ComponentHelper module is the Elm code that backs the component-side JS helper
library in the iframe-coordinator toolkit. It message validation and routing within an
embedded iframe component.

This module is not currently designed for stand-alone use. You should instead use the
component library defined in LINK_TO_JS_LIB to create seamless iframe applications

@docs create

-}

import Json.Decode as Decode
import Message.ComponentMsg as ComponentMsg exposing (ComponentMsg)
import Platform exposing (Program, program)


{-| Create a program to handle component messages. Takes an record of ports to send and
receive messages on. Communication with the parent application and the local component
code are handled through four ports, an input and output pair for each of the component
application and the parent coordinator. Port bindings are handled and exposed via the
js library in LINK_TO_JS_LIB_HERE.
-}
create :
    { coordinatorIn : (Decode.Value -> Msg) -> Sub Msg
    , coordinatorOut : Decode.Value -> Cmd Msg
    , componentIn : (Decode.Value -> Msg) -> Sub Msg
    }
    -> Program Never Model Msg
create ports =
    program
        { init = init
        , update =
            update
                ports.coordinatorOut
        , subscriptions =
            subscriptions
                ports.componentIn
                ports.coordinatorIn
        }



-- Model


type alias Model =
    {}


init : ( Model, Cmd Msg )
init =
    ( {}, Cmd.none )



-- Update


type Msg
    = Unknown String
    | ComponentMessage ComponentMsg
    | CoordinatorMessage Decode.Value


update : (Decode.Value -> Cmd Msg) -> Msg -> Model -> ( Model, Cmd Msg )
update coordinatorPort msg model =
    case Debug.log "Message" msg of
        Unknown value ->
            ( model, logWarning ("No handler for unknown message: " ++ toString value) )

        ComponentMessage message ->
            handleComponentMessage coordinatorPort model message

        CoordinatorMessage value ->
            ( model, logWarning ("No handler for coordinator messages" ++ toString value) )


handleComponentMessage :
    (Decode.Value -> Cmd Msg)
    -> Model
    -> ComponentMsg
    -> ( Model, Cmd Msg )
handleComponentMessage coordinatorPort model msg =
    case msg of
        ComponentMsg.NavRequest _ ->
            ( model, coordinatorPort (ComponentMsg.encode msg) )


logWarning : String -> Cmd Msg
logWarning errMsg =
    let
        _ =
            Debug.log errMsg
    in
        Cmd.none



-- Subscriptions


subscriptions :
    ((Decode.Value -> Msg) -> Sub Msg)
    -> ((Decode.Value -> Msg) -> Sub Msg)
    -> Model
    -> Sub Msg
subscriptions componentPort coordinatorPort _ =
    Sub.batch
        [ componentPort componentMessageDecoder
        , coordinatorPort CoordinatorMessage
        ]


componentMessageDecoder : Decode.Value -> Msg
componentMessageDecoder value =
    case
        Decode.decodeValue
            (Decode.map ComponentMessage ComponentMsg.decoder)
            value
    of
        Ok msg ->
            msg

        Err err ->
            Unknown err
