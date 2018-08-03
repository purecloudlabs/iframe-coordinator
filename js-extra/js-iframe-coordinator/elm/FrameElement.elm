port module FrameElement exposing (main)

import FrameRouter exposing (createRouter)
import Json.Decode as Decode


main =
    createRouter componentIn


port componentIn : (Decode.Value -> msg) -> Sub msg
