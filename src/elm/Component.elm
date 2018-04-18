module Component exposing (Component, Id, Registry, decodeRegistry, urlForRoute)

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder, decodeValue)
import List.Extra as ListEx
import Path exposing (Path)


type Registry
    = Registry (Dict String Component)


type alias Component =
    { indexPath : Path
    , assignedRoute : Path
    }


type Id
    = ComponentId String


urlForRoute : Registry -> Path -> Maybe String
urlForRoute registry route =
    Dict.values (unwrapRegistry registry)
        |> ListEx.find (matchesRoute route)
        |> Maybe.map (getUrl route)


decodeRegistry : Decode.Value -> Registry
decodeRegistry json =
    decodeValue registryDecoder json
        |> Result.withDefault (Registry Dict.empty)



-- Helpers


unwrapRegistry : Registry -> Dict String Component
unwrapRegistry registry =
    case registry of
        Registry components ->
            components


unwrapId : Id -> String
unwrapId id =
    case id of
        ComponentId identifier ->
            identifier


getUrl : Path -> Component -> String
getUrl route component =
    Path.asString component.indexPath ++ "/#" ++ Path.asString route


matchesRoute : Path -> Component -> Bool
matchesRoute path component =
    Path.startsWith component.assignedRoute path


componentList : Registry -> List ( String, Component )
componentList registry =
    case registry of
        Registry components ->
            Dict.toList components
                |> List.sortBy (Tuple.second >> .assignedRoute >> Path.asString)


registryDecoder : Decoder Registry
registryDecoder =
    Decode.keyValuePairs componentDecoder
        |> Decode.map Dict.fromList
        |> Decode.map Registry


componentDecoder : Decoder Component
componentDecoder =
    Decode.map2 Component
        (Decode.field "indexPath" Path.decoder)
        (Decode.field "assignedRoute" Path.decoder)
