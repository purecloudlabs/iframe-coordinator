port module ComponentProgram exposing (main)

import ComponentHelper


main =
    ComponentHelper.create
        { coordinatorIn = coordinatorIn
        , coordinatorOut = coordinatorOut
        , componentIn = componentIn
        }
