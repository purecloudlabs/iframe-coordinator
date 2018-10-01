module Path exposing (Path, asString, decoder, join, parse, startsWith, stripPrefix)

{-| The Path module provides utilities for working with URL paths in the context of the iframe-coordinator.
-}

import Json.Decode as Decode exposing (Decoder)
import List.Extra as ListEx



-- Exports


type Path
    = Absolute (List String)


parse : String -> Path
parse pathStr =
    cleanPathString pathStr
        |> String.split "/"
        |> List.filter (not << String.isEmpty)
        |> Absolute


join : Path -> Path -> Path
join p1 p2 =
    case ( p1, p2 ) of
        ( Absolute l1, Absolute l2 ) ->
            Absolute (List.append l1 l2)


asString : Path -> String
asString path =
    case path of
        Absolute segments ->
            "/" ++ String.join "/" segments


startsWith : Path -> Path -> Bool
startsWith prefixPath path =
    case ( prefixPath, path ) of
        ( Absolute prefixSegments, Absolute segments ) ->
            ListEx.isPrefixOf prefixSegments segments


stripPrefix : Path -> Path -> Maybe Path
stripPrefix prefixPath path =
    case ( prefixPath, path ) of
        ( Absolute prefixSegments, Absolute segments ) ->
            ListEx.stripPrefix prefixSegments segments
                |> Maybe.map Absolute


decoder : Decoder Path
decoder =
    Decode.map parse Decode.string



-- Helpers


cleanPathString : String -> String
cleanPathString rawPathStr =
    let
        pathStr =
            String.trim rawPathStr
    in
    case ( String.startsWith "/" pathStr, String.endsWith "/" pathStr ) of
        ( True, True ) ->
            String.slice 1 -1 pathStr

        ( False, True ) ->
            String.dropRight 1 pathStr

        ( True, False ) ->
            String.dropLeft 1 pathStr

        ( False, False ) ->
            pathStr
