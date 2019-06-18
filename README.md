# spoke-fly

A fly.io repository that proxies texter requests to lambda, admin requests to Heroku, and caches static assets

## Usage

Clone the repository

```
git clone https://github.com/politics-rewired/spoke-fly.git
cd spoke-fly/
```

Install dependences (assume you have `yarn` installed globally). I set things up using Node v8.12.0.

```
yarn install
```

Rather than running commands such as `fly server`, `fly deploy`, `fly login`, use `yarn fly server`, or `yarn fly x`, to ensure we're running the same fly version as installed by `yarn.lock`.

So `yarn start` or `yarn fly server` will get it going on `localhost:3000`.

To deploy, modify your `.fly.yml` to refer to a unique app. The current one, `spoke-fly`, is owned by us.
