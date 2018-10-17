module Fixture.ToastMessage exposing (toastFuzzer)

import Fuzz exposing (Fuzzer, int, list, string)
import Json.Encode as Encode
import Message.Toast exposing (Toast)


toastFuzzer : Fuzzer Toast
toastFuzzer =
    Fuzz.map3 Toast
        (Fuzz.maybe Fuzz.string)
        Fuzz.string
        (Fuzz.maybe (Fuzz.constant Encode.null))
