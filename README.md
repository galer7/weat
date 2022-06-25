This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---
weat

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