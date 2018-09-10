port module HostProgram exposing (main)

import FrameRouter exposing (createRouter)
import Json.Decode as Decode


main : Program Decode.Value FrameRouter.Model FrameRouter.Msg
main =
    createRouter componentIn


port componentIn : (Decode.Value -> msg) -> Sub msg
