module ClientRegistry exposing (Client, ClientRegistry, Id, decode, urlForRoute)

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
urlForRoute registry hostRoute =
    Dict.values (unwrapClientRegistry registry)
        |> List.filterMap (getUrl hostRoute)
        |> List.head


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


getUrl : Path -> Client -> Maybe String
getUrl hostRoute client =
    getClientRoute client hostRoute
        |> Maybe.map (buildUrl client)


getClientRoute : Client -> Path -> Maybe Path
getClientRoute client hostRoute =
    Path.stripPrefix client.assignedRoute hostRoute


buildUrl : Client -> Path -> String
buildUrl client clientRoute =
    let
        clientUrl =
            client.url

        newHash =
            Path.join (Path.parse clientUrl.hash) clientRoute
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
