module ToastMessage exposing (suite)

import Expect exposing (Expectation)
import Fixture.ToastMessage exposing (toastFuzzer)
import Json.Decode as Decode exposing (decodeValue)
import Message.Toast as Toast
import Test exposing (..)


suite : Test
suite =
    describe "Toast Messages"
        [ fuzz toastFuzzer "Encodes and decodes consistently" <|
            \toast ->
                Toast.encode toast
                    |> decodeValue Toast.decoder
                    |> Expect.equal (Ok toast)
        ]
