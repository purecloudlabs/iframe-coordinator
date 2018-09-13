port module Host exposing (main)

import HostProgram
import Json.Decode as Decode


main : Program Decode.Value HostProgram.Model HostProgram.Msg
main =
    HostProgram.create fromClient


port fromClient : (Decode.Value -> msg) -> Sub msg
