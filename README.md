# Optolith Database Downgrader
This project is made to downgrade the database for the [Optolith Client](https://github.com/elyukai/optolith-client) from 
the V2 schema back to the V1.

> [!WARNING]
> This project is currently very much work in progress and only the ground work has been layed out.

## How to run
> [!WARNING]
> You need the new database to be able to downgrade it.

The script compiles into a js-cli-app, which you can then use to downgrade it.
Currently the only way to use is to compile it yourself.

### Compling
For that, have `npm` and `node` installed.

Clone this repo and open your terminal, then you can run the following:
```shell
npm install --include=dev && npm run build
```

Now there should be a file under `dist` called `main.js`. Just run it and that should display the help.

```shell
node ./dist/main.js
```

## Vision
I know it sound pretentious, but...

Basically my goal is, that we can convert the new database as perfectly as possible to the old schema.
Its not 100% possible, since the old schema doesn't support specific features from the newer database and vice versa, but
it should be as close as possible.

## Why even do this?
> Wouldn't it be more intelligent to wait for the V2 to come out?

Yes, imaginary questioneer.

But since the development takes very long, I decided to at least try to convert the newer (and more up to date version)
to the older app.

## How can we help?
I'd love help. Sadly, I don't have documentation written yet and so on. 
So even creating new "translations" is gonna be challenging.

*But* if you believe, there could be an improvement or even help somewhere, feel free to open a PR. 
The earlier we can complete this project the better.