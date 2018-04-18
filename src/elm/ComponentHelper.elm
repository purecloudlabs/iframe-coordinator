port module ComponentHelper exposing (main)

import Json.Decode as Decode
import Message.Navigate as Navigate
import Navigation exposing (modifyUrl)
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
    = Navigate String
    | Unknown Decode.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Navigate string ->
            Debug.log "navigate" ( model, modifyUrl string )

        Unknown value ->
            ( model, Cmd.none )



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    parentMessage decodeMessage


decodeMessage : Decode.Value -> Msg
decodeMessage value =
    Decode.decodeValue
        (Decode.field "data"
            (Decode.oneOf
                [ Decode.map Navigate Navigate.decoder ]
            )
        )
        value
        |> Result.withDefault (Unknown value)


port parentMessage : (Decode.Value -> msg) -> Sub msg
