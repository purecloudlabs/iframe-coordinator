module Message.Toast exposing (Toast, encode, decoder, label)

{-| Requesting the host application to show a notification of some sort is
a common use case for cross-frame messaging. The Message.Toast module defines
types to support this use case.

@docs Toast, encode, decoder, label

-}

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode
import LabeledMessage exposing (expectLabel, withLabel)


{-| The Toast type represents a request from a client to a host to display
a notification. It consists of an optional `title`, a `message` to display
and a placeholder for custom pass-through data to support additional
app-specific features. Common use cases for app-specific features are things
like timed auto-dismissal, notification levels or icons, etc.
-}
type alias Toast =
    { title : Maybe String
    , message : String
    , custom : Maybe Decode.Value
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
    (Decode.succeed Toast
        |> optional "title" (Decode.maybe Decode.string) Nothing
        |> required "message" Decode.string
        |> optional "custom" (Decode.maybe Decode.value) Nothing
    )
        |> expectLabel label


{-| Encodes a Toast to JSON, tagging it with `label`
-}
encode : Toast -> Encode.Value
encode toast =
    [ Maybe.map (\title -> ( "title", Encode.string title )) toast.title
    , Just ( "message", Encode.string toast.message )
    , Maybe.map (\custom -> ( "custom", custom )) toast.custom
    ]
        |> List.filterMap identity
        |> Encode.object
        |> withLabel label
