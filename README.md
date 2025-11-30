## How to run?

1) Copy `.env.example` to `.env`:

`cp .env.template .env`

2) Hit in console:

`docker compose up --build`

(or `docker compose up --build --watch` to dev) 

3) give it a few moments to build and wakeup then in browser:

`localhost`

## How to seed users?

Use curl or import to Postman and run:

```
curl --location --request POST 'localhost/api/seed'
```

This will return:

- Added 2 companies
- 10 user emails (added randomly to companies)
- 20 order ids

## How to log in?

After seeding users just use one of the emails. Password is same for all: `onerail`.

## Why to swagger when there is Postman collection file ready to be imported? ;)

It's in `backend/assets/postman_collection.json`

Just create Enviroment with `key : value` of:

`baseUrl : localhost/api`
`bearerToken : [your token from login]` (see `/api/auth/login`)

## But there is swagger, right?

Yes, under:

`localhost/api/swagger/`

or there is a button in menu after login.

## Running tests

On the root repository level:

`cd backend` and `npm run test`

## Close down the app

Simply remove the containers by running the following command:

```
docker compose down
```

or just stop them by Ctrl+C (Win)

## What can be done differently?

### Overall

There are few improvements we can go with:
- use Redis or some other memory DB for caching
- obviously add more tests ;)

Less obvious is about app modularization. I go with the approach which is used widely in business: split 'files' by it's functionality. That means we have dirs with `controllers`, `services`, `repositories` etc. and that fine. 

In most of my projects i use more modular approach: im splitting files by its logical purpose. So app will look more like this:
```
-- backend
    |-- src
        |-- lib (or modules)
            |-- user
            |-- organisation
            |-- order
        |-- services
        |-- utils
``` 

Where `user`, `organisation` and `order` are holding all dependant files so controller, service and repository can be easily found.

Pros of that approach:
- **easier to extract module to microservice**
- easier to maintain
- easier to add new features
- easier to test

Cons:
- hard to stay in one domain in complex projects
- not that widely used approach
- we need to add core services for e.g. utils, or shared stuff

### HiTraffic

For hi traffic I will split those into microservices per domain: user, organization, order, auth.

For even more traffic I will split every into read/write microservices so:

- auth
- user read, user write
- organization read, organization write
- order read, order write

Write services will use secondary instances or own DBs.

Read services will use caching, primary DBs or projection DBs with Views.

