module LabeledMessage exposing (expectLabel, withLabel)

{-| The LabeledMessagae module provides a consistent format for labelling, encoding, and decoding messages that are sent & recieved via ports.

Messages are formatted as objects with a `msgType` field that indicates the type of data and a `msg` field that contains the data to be decoded. e.g.:

```js
{
  msgType: "navRequest",
  msg: {
    host: "example.com",
    protocol: ...
  }
}
```

-}

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode


expectLabel : String -> Decoder a -> Decoder a
expectLabel expectedLabel decoder =
    Decode.field msgTypeField Decode.string
        |> Decode.andThen
            (\label ->
                if label /= expectedLabel then
                    Decode.fail ("Unrecognized msg type: " ++ label)

                else
                    Decode.field msgDataField decoder
            )


withLabel : String -> Encode.Value -> Encode.Value
withLabel label value =
    Encode.object
        [ ( msgTypeField, Encode.string label )
        , ( msgDataField, value )
        ]


msgTypeField : String
msgTypeField =
    "msgType"


msgDataField : String
msgDataField =
    "msg"
