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

# Main picker logic
## Restaurant picker
- should have a selected array, in which we push/remove/change restaurants
- when pushing a new restaurant, we can also push a first item in its `items` array, so that we have better UI

## Restaurant food item picker
- should render selected `items` array
- should have possibility of changing selected `items` array by mutating existing items + pushing to this selected `items` array

# Websocket flows
## Invite flow
1. press send invite button
2. emit `user:invite:sent` to server. attach to this emit the state of the inviter, _if it is the first invite_ :)
3. ws server on `user:invite:sent` create map entry with `{ foodieGroupId: { [from]: initial_sender_state, [to]: {} } }`
4. meanwhile, `[from]` can send as many `user:state:updated` as he wants
5. ws server emits `server:invite:sent`, 2 things happen:
   1. everyone **but the invited** listens for this event, and then renders animation
   2. invited will have a popup with this invitation: accept invitation and will emit `user:invite:accepted`
6. ws server on `user:invite:accepted` will receive invited user state. ws server updates state with this new user state
7. ws server emits `server:state:updated` to all participants in the room

# Features
## Login
- the user will be redirected to login when going to /food
- user name should be displayed on top of his selector (first it will be only one selector, if the user is not included in a group)

## (First) Invite / create group
- if the user has a null `foodieGroupId`, it means that it has no group
- when inviting (and not accepted yet), a group should be created => `foodieGroupId`. The other users from the group will render a pending animation for the new user
- the invited user will receive an invite popup on his page
- when the invited user accepts the invite, a new selection menu will be rendered for the user
- TODO: the list will be updating on user type, and it will display only online users whose names pass the matcher's rules

## Resume on page refresh
- if the user is not in a group, then tab refresh will delete his selection
- if the user is part of a group, the state is persisted by the WS server in the DB. So, on page refresh, the user will emit a `user:initial:event`; when the server gets that, the server will emit `server:initial:event`, which will respond with the entire group state

## Food selection
- a user can select multiple food items from multiple restaurants
- add/remove/change for each node
- ideally, the user cannot have the same restaurant chosen twice, nor the same food item (from a given restaurant) twice
- if the user is in a group with other users, his changes will be emitted to the other users in the group, and changes of other users will behave the same

# Constraints
- trpc api should be disabled for unauthenticated users
- 

---
# Links
1. use ref for modal show/hide: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
2. https://stackoverflow.com/questions/61102101/cannot-assign-refobjecthtmldivelement-to-refobjecthtmlelement-instance