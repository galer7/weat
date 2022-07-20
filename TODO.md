- [x] find how login and register works in next auth with credentials provider 😕
  - [x] register -> 3h debugging session because of superjson transformer
  - [x] login using next-auth endpoint
  - [x] find how to use next-auth session inside `getServerSideProps`
  - [ ] add google provider for fun
  - [ ] login ~~and register~~ cute forms
- [x] find how sessions work
- [ ] add next router to show unauthorized if you are not logged in
- [ ] add prisma to the WS server, so that it can read from the FoodieGroup table
- [ ] move reconnect render logic at the WS level. progress so far is still good because we also need `getServerSideProps` to get session username
- [ ] socket-io: rooms and broadcast to the sessions in the room

knowledge gaps
- [ ] read https://next-auth.js.org/getting-started/upgrade-v4#session strategy jwt/database