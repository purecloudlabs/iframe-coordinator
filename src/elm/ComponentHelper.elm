port module ComponentHelper exposing (main)

import Json.Decode as Decode
import Message.ComponentMsg as ComponentMsg exposing (ComponentMsg)
import Platform exposing (Program, program)


main : Program Never Model Msg
main =
    program
        { init = init
        , update = update
        , subscriptions = subscriptions
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


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case Debug.log "Message" msg of
        Unknown value ->
            ( model, logWarning ("No handler for unknown message: " ++ toString value) )

        ComponentMessage message ->
            handleComponentMessage model message

        CoordinatorMessage value ->
            ( model, logWarning ("No handler for coordinator messages" ++ toString value) )


handleComponentMessage : Model -> ComponentMsg -> ( Model, Cmd Msg )
handleComponentMessage model msg =
    case msg of
        ComponentMsg.NavRequest _ ->
            ( model, coordinatorOut (ComponentMsg.encode msg) )


logWarning : String -> Cmd Msg
logWarning errMsg =
    let
        _ =
            Debug.log errMsg
    in
    Cmd.none



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ componentIn componentMessageDecoder
        , coordinatorIn CoordinatorMessage
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


port coordinatorIn : (Decode.Value -> msg) -> Sub msg


port coordinatorOut : Decode.Value -> Cmd msg


port componentIn : (Decode.Value -> msg) -> Sub msg


port componentOut : Decode.Value -> Cmd msg
