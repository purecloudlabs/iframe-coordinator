port module Host exposing (main)

import HostProgram
import Json.Decode as Decode


main : Program Decode.Value HostProgram.Model HostProgram.Msg
main =
    HostProgram.create
        { fromHost = fromHost
        , fromClient = fromClient
        , toHost = toHost
        , toClient = toClient
        }

port fromHost : (Decode.Value -> msg) -> Sub msg

port fromClient : (Decode.Value -> msg) -> Sub msg

port toHost : Decode.Value -> Cmd msg

port toClient : Decode.Value -> Cmd msg
