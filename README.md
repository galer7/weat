# weat

TODO: Tackle WS scaling problem with Redis.
Since we want to scale only the WS servers, and not the Next.js servers, we will separate the 2 entities.
I consider writing the WS server in a compiled language, maybe Rust.

The app will have register/login with credentials, because we want to invite friends in order to start collaborating on the menu.

When all the members of the group have locked-in their food choices, a 5 second countdown will start. After these 5 seconds, the request will be registered to the server.

The interface will allow only one member to insert their delivery address.
The app will consume the food catering app's API in order to list different offers from different restaurants.

Weighed price computation will not deserve much attention as some items from the food catering app will often be bundles.

The client will establish a WS connection with one of the WS servers.
How do we know that the client will send correct data to the WS server? I must check that

# Saving socket states per client
Saving client work should be emitted only if there exists a room context. If a client has some progress so far and joins a room, the WS server should emit to all other sockets in that room the progress of the current client, and vice-versa.
The initial dump should aggregate all changes so far from all other participants. Future changes will be announced per change per client.

# Links
1. use ref for modal show/hide: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
2. https://stackoverflow.com/questions/61102101/cannot-assign-refobjecthtmldivelement-to-refobjecthtmlelement-instance