- [x] find how login and register works in next auth with credentials provider 😕
- [x] register -> 3h debugging session because of superjson transformer
- [x] login using next-auth endpoint
- [x] find how to use next-auth session inside `getServerSideProps`
- [ ] add google provider for fun
- [x] find how sessions work
- [x] add next router to show unauthorized if you are not logged in
- [x] move reconnect render logic at the WS level. progress so far is still good because we also need `getServerSideProps` to get session username
- [x] socket-io: rooms and broadcast to the sessions in the room
- [ ] implement logout button
- [ ] find solutions for a on-typing-updating list for users + add online/offline green dot. will probably need to use next-auth's `Session` model
- [ ] make use of CSRF tokens from next-auth. first learn where they are helpful
- [ ] design selector component

knowledge gaps
- [ ] read https://next-auth.js.org/getting-started/upgrade-v4#session strategy jwt/database
- [ ] react context: https://beta.reactjs.org/learn/passing-data-deeply-with-context