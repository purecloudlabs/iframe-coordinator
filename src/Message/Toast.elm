module Message.Toast exposing (Toast, encode, decoder, label)

{-| Requesting the host application to show a notification of some sort is
a common use case for cross-frame messaging. The Message.Toast module defines
types to support this use case.

@docs Toast, encode, decoder, label

-}

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (hardcoded, optional, required)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)


{-| The Toast type represents a request from a client to a host to display
a notification. It consists of an optional `title`, a `message` to display
and a placeholder for custom pass-through data to support additional
app-specific features. Common use cases for app-specific features are things
like timed auto-dismissal, notification levels or icons, etc.
-}
type alias Toast =
    { title : String
    , message : String
    , custom : Maybe Decode.Value
    , icon : String
    }


{-| This is the label used to tag toast requests in JSON. Other modules
should not need to reference it, but it is exposed to force a package version
bump if it changes.
-}
label : String
label =
    "toastRequest"


{-| Decoder for Toast messages, which are expected to be tagged with
`label`
-}
decoder : Decoder Toast
decoder =
    Decode.oneOf
        [ v2decoder
        , v1Decoder
        ]


v2decoder : Decoder Toast
v2decoder =
    (Decode.succeed Toast
        |> required "title" Decode.string
        |> required "message" Decode.string
        |> optional "custom" (Decode.maybe Decode.value) Nothing
        |> required "icon" Decode.string
    )
        |> expectLabel label


v1Decoder : Decoder Toast
v1Decoder =
    (Decode.succeed Toast
        |> optional "title" Decode.string "Notification!"
        |> required "message" Decode.string
        |> optional "custom" (Decode.maybe Decode.value) Nothing
        |> hardcoded "info"
    )
        |> expectLabel "toastRequest"


{-| Encodes a Toast to JSON, tagging it with `label`
-}
encode : Toast -> Encode.Value
encode toast =
    [ Just ( "title", Encode.string toast.title )
    , Just ( "message", Encode.string toast.message )
    , Maybe.map (\custom -> ( "custom", custom )) toast.custom
    , Just ( "icon", Encode.string toast.icon )
    ]
        |> List.filterMap identity
        |> Encode.object
        |> withLabel label
