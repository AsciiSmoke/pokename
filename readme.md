# A Wild Version Namer Appears

## Intro

We’re looking for a single-page Web application that will generate unique version names ([à la Ubuntu][ubuntu-code-names]) with an interesting twist; we’d like you to use the [Pokemon API][pokemon-api] for the animal names. The expected outcome should be something like “Bloated Bulbasaur” or “Charming Charizard”.

We’ve put together a little skeleton project to start you off, but offer no opinion on layout, style, or processors. There are a few things we’d like to see on the page, namely a button to roll a new name (incrementing alphabetically from the last stored name), a button to store the name, and a table of stored names. Beyond that, you’re free to implement what you’d like.

## Requirements

- [x] Generates unique version names
- [x] Reads data from the Pokemon API
- [ ] Displays table of previously generated version names
- [x] Can remove generated version names
- [-] Uses AngularJs, or Backbone JS frameworks

## Bonus Points

- [-] Uses our preprocessor suite, CoffeeScript, Jade, and SASS(scss)
- [x] Doesn’t use Bootstrap or similar
- [ ] Stored names are persisted after page reload
- [ ] Offers option to copy generated name to clipboard
- [ ] A runnable unit test suite

## Finally

We’re looking for developers with great coding skills, have an eye for good visual design and an understanding of user interaction requirements. We hope this task is sufficiently open-ended to allow any additional scope for creativity and uniqueness.

It’d be great if it was returned to us in a compressed archive, with a clear Git history, and without the NPM, or bower dependencies.

[ubuntu-code-names]: https://wiki.ubuntu.com/DevelopmentCodeNames
[pokemon-api]: http://pokeapi.co/