port module Client exposing (main)

import ClientProgram
import Json.Decode as Decode


main : Program Never ClientProgram.Model ClientProgram.Msg
main =
    ClientProgram.create
        { fromHost = fromHost
        , toHost = toHost
        , fromClient = fromClient
        }


port fromHost : (Decode.Value -> msg) -> Sub msg


port toHost : Decode.Value -> Cmd msg


port fromClient : (Decode.Value -> msg) -> Sub msg
