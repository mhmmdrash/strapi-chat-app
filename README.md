# Strapi chat app

Built a chat app using Strapi as backend over websocket

the project consists of 2 folder:
1. the /chatapp folder representing the backend Strapi server on PostGres
2. the /next-chat filer representing a next front end client for interacting with the echo server

## Steps to run Strapi echo server
```bash
cd chatapp
npm ci
npm run develop
```

## Steps to run Client
```bash
cd next-chat
npm ci
npm run dev
```

the Strapi admin portal can be found on http://localhost:1337/admin
the Client at http://localhost:3000

On opening the Client page users will need to login with name and email, after which they will be redirected to the chat interface
