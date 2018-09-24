port module Host exposing (main)

import HostProgram
import Json.Decode as Decode


main : Program Decode.Value HostProgram.Model HostProgram.Msg
main =
    HostProgram.create fromClient toHost


port fromClient : (Decode.Value -> msg) -> Sub msg


port toHost : Decode.Value -> Cmd msg
