- [x] find how login and register works in next auth with credentials provider 😕
- [x] register -> 3h debugging session because of superjson transformer
- [x] login using next-auth endpoint
- [x] find how to use next-auth session inside `getServerSideProps`
- [x] find how sessions work
- [x] add next router to show unauthorized if you are not logged in
- [x] move reconnect render logic at the WS level. progress so far is still good because we also need `getServerSideProps` to get session username
- [x] socket-io: rooms and broadcast to the sessions in the room
- [x] find how to attach foodieGroupId on the session object when creating the new foodieGroup...
- [x] ws: persist foodieGroup in db
- [x] add google provider
- [x] implement signout logics: remove user from foodieGroup + ws update state after. if the group has only one user left, delete the group completely
- [ ] bug: first add restaurant press after user joins the group is not registered (sometimes?)
- [x] save user state to local storage
- [x] add leave group button
- [x] add `accepted_invite` boolean prop on WS and React state for other users, so we can have a pending animation
- [x] add refuse invite button
- [ ] persist invites
- [ ] add session-token cookie to the WS requests, in order to validate on server
- [ ] implement online users list on invite submit form
- [ ] add order now button
- [ ] add group orders list
- [x] add user events popup notifications (e.g. user joined your group, user left your group)
- [ ] make use of CSRF tokens from next-auth. first learn where they are helpful
- [ ] design selector component
- [ ] make sure all app routes are protected

Will not implement:
- [ ] map user state to its account id, not his name (e.g. we can have 2  Google accounts with the name Gabriel Galer)

knowledge gaps
- [ ] read https://next-auth.js.org/getting-started/upgrade-v4#session strategy jwt/database
- [ ] react context: https://beta.reactjs.org/learn/passing-data-deeply-with-context