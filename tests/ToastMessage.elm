module ToastMessage exposing (suite)

import Expect exposing (Expectation)
import Fixture.ToastMessage as Fixture exposing (toastFuzzer, v1Fuzzer)
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
        , fuzz v1Fuzzer "Can decode old messages" <|
            \v1Toast ->
                Fixture.encodeV1 v1Toast
                    |> decodeValue Toast.decoder
                    |> Expect.equal
                        (Ok
                            { title = v1Toast.title |> Maybe.withDefault "Notification!"
                            , message = v1Toast.message
                            , custom = v1Toast.custom
                            , icon = "info"
                            }
                        )
        ]
