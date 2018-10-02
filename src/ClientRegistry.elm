module ClientRegistry exposing (Client, ClientRegistry, Id, decode, urlForRoute)

{-| The Client module defines the data structures used to represent individual client definitions and a registry of clients.
-}

import Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder, decodeValue)
import List.Extra as ListEx
import Path exposing (Path)
import Url exposing (Url)


type ClientRegistry
    = ClientRegistry (Dict String Client)


{-| TODO: Add an accessiblityTitle that's set on the frame based on which
cleint is loaded
-}
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


fragmentPath : Client -> Path
fragmentPath client =
    Path.parse (Maybe.withDefault "" client.url.fragment)



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

        newFragment =
            Path.join (fragmentPath client) clientRoute
    in
    { clientUrl | fragment = Just (Path.asString newFragment) }
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
    Decode.string
        |> Decode.andThen
            (\str ->
                case Url.fromString str of
                    Just url ->
                        Decode.succeed url

                    Nothing ->
                        Decode.fail ("'" ++ str ++ "'" ++ " is not a valid URL.")
            )
