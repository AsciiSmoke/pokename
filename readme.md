# A Wild Version Namer Appears



## Developer feedback

I'm submitting this application code for review. I've completed as many of the requirements as I can in a reasonable period of time (I actually had a lot of fun coding this and probably spent far more time on it than I should, especially the interface).

To download and review, please use the 'Download Zip' button on the Git Hub [repository home page](https://github.com/AsciiSmoke/pokename). The application should run perfectly directly form the file-system.

##### I'd like to draw the reviewer's attention to the following: #####
* I developed and tested exclusively using Chrome. I believe everything that I've written will work on all modern browsers but I have not installed Firefox, IE, Opera, etc. I also do not have access to a Mac to test on.
* I added some very basic scaling in to ensure that the app fitted different resolutions. Clearly, this does not constitute making the app fully responsive but I wanted to concentrate on the functionality as a priority. 
* Anything that I did not complete but would have liked to given more time has been marked with a 'TODO' comment.
* I've not made use of Angular. I spent an entire evening falling out with node trying to get Angular to install. For some reason npm just wouldn't play ball. If this is really crucial I'll either find a way to install it manually or create a VM to complete the development rather than mess up my gaming machine.
* Likewise I've not used CoffeeScript or Jade. This was a pragmatic choice. I wanted to get a functioning application to you in a format I am fully familiar with. I've not yet used CoffeeScript or Jade so I didn't want to mire the outcome by falling foul of inexperience in these tools. Again, if this is absolutely necessary I'll return to the code to do so.
* I chose to interpret the requirement to remove generated names as meaning "don't allow the user to get the same character twice in one session'. If this is meant to span multiple sessions, let me know and I'll extend.
* Though some elements required me to revise or research techniques, everything in this application is hand-written by my (apart from the use of the jQuery library). I didn't think it appropriate to lean on plugins or third-party libraries, especially as Bootstrap was explicitly forbidden.
* Lastly, I really wanted to get some unit tests in using something like [Jasmine](http://jasmine.github.io/). Unfortunately, it's taken me so long to produce the code as-is that I feel that spending any longer on it would cause an unfavorable delay to delivery.



## Intro

We’re looking for a single-page Web application that will generate unique version names ([à la Ubuntu][ubuntu-code-names]) with an interesting twist; we’d like you to use the [Pokemon API][pokemon-api] for the animal names. The expected outcome should be something like “Bloated Bulbasaur” or “Charming Charizard”.

We’ve put together a little skeleton project to start you off, but offer no opinion on layout, style, or processors. There are a few things we’d like to see on the page, namely a button to roll a new name (incrementing alphabetically from the last stored name), a button to store the name, and a table of stored names. Beyond that, you’re free to implement what you’d like.

## Requirements

- [x] Generates unique version names
- [x] Reads data from the Pokemon API
- [x] Displays table of previously generated version names
- [x] Can remove generated version names (as in wont repeat?) **You will not get the same card twice in a single load** 
- [ ] ~~Uses AngularJs, or Backbone JS frameworks~~ **(I'm having problems getting node running on my machine. As a substitute I've written some basic data-binding into the code to show an understanding of the concept. If this step is an absolutely crucial requirement, I'll create a VM to complete this step)**

## Bonus Points

- [ ] ~~Uses our preprocessor suite, CoffeeScript, Jade,~~ and SASS(scss) **(I've used scss only)**
- [x] Doesn’t use Bootstrap or similar **(Absolutely everything is hand written, no libraries, plugins or frameworks have been used except jQuery)**
- [x] Stored names are persisted after page reload
- [x] Offers option to copy generated name to clipboard
- [ ] ~~A runnable unit test suite~~

## Finally

We’re looking for developers with great coding skills, have an eye for good visual design and an understanding of user interaction requirements. We hope this task is sufficiently open-ended to allow any additional scope for creativity and uniqueness.

It’d be great if it was returned to us in a compressed archive, with a clear Git history, and without the NPM, or bower dependencies.

[ubuntu-code-names]: https://wiki.ubuntu.com/DevelopmentCodeNames
[pokemon-api]: http://pokeapi.co/