module ClientRegistry exposing (Client, Id, ClientRegistry, decode, urlForRoute)

{-| The Client module defines the data structures used to represent individual client definitions and a registry of clients.
-}

import Dict exposing (Dict)
import Erl as Url exposing (Url)
import Json.Decode as Decode exposing (Decoder, decodeValue)
import List.Extra as ListEx
import Path exposing (Path)


type ClientRegistry
    = ClientRegistry (Dict String Client)


type alias Client =
    { url : Url
    , assignedRoute : Path
    }


type Id
    = ClientId String


urlForRoute : ClientRegistry -> Path -> Maybe String
urlForRoute registry route =
    Dict.values (unwrapClientRegistry registry)
        |> ListEx.find (matchesRoute route)
        |> Maybe.map (getUrl route)


decode : Decode.Value -> ClientRegistry
decode json =
    decodeValue registryDecoder json
        |> Result.withDefault (ClientRegistry Dict.empty)



-- Helpers


unwrapClientRegistry : ClientRegistry -> Dict String Client
unwrapClientRegistry registry =
    case registry of
        ClientRegistry clients ->
            clients


unwrapId : Id -> String
unwrapId id =
    case id of
        ClientId identifier ->
            identifier


matchesRoute : Path -> Client -> Bool
matchesRoute path client =
    Path.startsWith client.assignedRoute path


getUrl : Path -> Client -> String
getUrl route client =
    let
        clientUrl =
            client.url

        newHash =
            Path.join (Path.parse clientUrl.hash) route
    in
    { clientUrl | hash = Path.asString newHash }
        |> Url.toString


clientList : ClientRegistry -> List ( String, Client )
clientList registry =
    case registry of
        ClientRegistry clients ->
            Dict.toList clients
                |> List.sortBy (Tuple.second >> .assignedRoute >> Path.asString)


registryDecoder : Decoder ClientRegistry
registryDecoder =
    Decode.keyValuePairs clientDecoder
        |> Decode.map Dict.fromList
        |> Decode.map ClientRegistry


clientDecoder : Decoder Client
clientDecoder =
    Decode.map2 Client
        (Decode.field "url" urlDecoder)
        (Decode.field "assignedRoute" Path.decoder)


urlDecoder : Decoder Url
urlDecoder =
    Decode.map Url.parse Decode.string
