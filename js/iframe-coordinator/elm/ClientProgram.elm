port module ClientProgram exposing (main)

import ComponentHelper
import Json.Decode as Decode


main : Program Never ComponentHelper.Model ComponentHelper.Msg
main =
    ComponentHelper.create
        { coordinatorIn = coordinatorIn
        , coordinatorOut = coordinatorOut
        , componentIn = componentIn
        }


port coordinatorIn : (Decode.Value -> msg) -> Sub msg


port coordinatorOut : Decode.Value -> Cmd msg


port componentIn : (Decode.Value -> msg) -> Sub msg


port componentOut : Decode.Value -> Cmd msg
