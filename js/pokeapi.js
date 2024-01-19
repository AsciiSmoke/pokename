/**
 * Created by Craig on 18/06/2015.
 */

// Helpers
var loggingLevels = {
    None: 0,
    Alerts: 1,
    Verbose: 2
};

function LogToConsole(message, level) {
    if (window.loggingLevel >= level) {
        console.log(message);
    }
}

String.prototype.capFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
// End of helpers


// Set logging level to desired amount of console output
window.loggingLevel = loggingLevels.Alerts;


/// Enclose the plugin code to protect against potential change in jQuery scope later
(function (PokeApi, $) {

    // Use extend to attach plugin code to window.PokeApi via local variable PokeApi
    $.extend(PokeApi, {

        apiUrl: "https://pokeapi.co",
        pokeDexUri: "/api/v2/pokedex/1/",
        failedToLoadData: false,
        failedToLoadJson: false,
        _pokeData: [],
        displayedPokemon: [],
        verbFileJson: [],

        /// Init method to set up data
        init: function () {
            if (PokeApi.pokeData().length == 0) {
                LogToConsole("Initiallising...", loggingLevels.Verbose);
                PokeApi.getAllData();

                $(document).on("PokeApi.ready", function () {
                    PokeApi.ready();
                });
            }
        },


        /// Simple get / set method for pokeData
        pokeData: function (value) {

            // TODO: implement local storage cache (with expiry date) rather than using the api every time

            if (value) {
                PokeApi._pokeData = value;
            }

            return PokeApi._pokeData;
        },


        ready: function (e) {
            // placeholder for event binding
        },


        /// Gets the pokedex data from the api
        getAllData: function () {
            LogToConsole("Fetching data...", loggingLevels.Verbose);
            $.get(PokeApi.apiUrl + PokeApi.pokeDexUri, function (data) {

                // Check we actually got something usable
                LogToConsole("Verifying data...", loggingLevels.Verbose);
                if (data.pokemon_entries == undefined || data.pokemon_entries.length <= 0) {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                }

                // Sort and store the data in an object level variable for safe-keeping
                LogToConsole("Sorting and storing data...", loggingLevels.Verbose);
                PokeApi.pokeData(PokeApi.sortData(data.pokemon_entries));
            })
                .fail(function () {

                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                })
                .done(function () {

                    // Reset failedToLoadData flag in case it had previously failed
                    if (PokeApi.pokeData() != undefined) {
                        PokeApi.failedToLoadData = false;
                    }
                })
                .always(function () {

                    // Broadcast that the api is ready
                    $(document).trigger("PokeApi.ready");
                });
        },


        /// Universal ajax failed method
        ajaxFailed: function () {
            PokeApi.failedToLoadData = true;
            LogToConsole("Could not communicate with the pokemon api", loggingLevels.Alerts);
            alert("Sorry, I couldn't get the Pokemon data.\r\rPlease try again.");
        },


        /// Alphabetically sorts array
        sortData: function (data) {
            return data.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        },


        /// Pick a random character from the array beginning the given letter
        getNewPokemon: function (char) {
            LogToConsole("Finding Random Pokemon starting with '" + char + "'...", loggingLevels.Verbose);

            // Create a shortlist by filtering down to the first character and ignoring any previously returned pokemon
            var filteredShortList = PokeApi.pokeData().filter(function (poke) {
                return (
                    poke.pokemon_species.name.substr(0, 1).toLowerCase() == char
                    &&
                    PokeApi.displayedPokemon.filter(function (dispPoke) {
                        return (
                            dispPoke.name == poke.pokemon_species.name
                        )
                    }).length == 0
                );
            });

            var shortlistCount = (filteredShortList.length);
            LogToConsole("Shortlisted " + shortlistCount + " pokemon records", loggingLevels.Verbose);

            // Check there is at least one Pokemon to select
            if (shortlistCount > 0) {

                // Randomly select a Pokemon from the shortlist
                var randomSelector = Math.round(Math.random() * (shortlistCount - 1));
                var pokeToReturn = filteredShortList[randomSelector].pokemon_species;
                pokeToReturn.name = pokeToReturn.name.capFirst();

                // Retrieve a verb and an adjective
                var verbAndAdjective = PokeApi.getVerbAndAdjective(pokeToReturn.name);
                pokeToReturn.verb = verbAndAdjective.verb;
                pokeToReturn.adjective = verbAndAdjective.adjective;

                // Push the selected pokemon into a list of returned pokemon and return
                PokeApi.displayedPokemon.push(pokeToReturn);
                return pokeToReturn;
            } else {
                return null;
            }
        },


        /// Retrieves the extended details of a given pokemon record
        getDetails: function (pokemon, complete) {

            LogToConsole("Retrieving pokemon details...", loggingLevels.Verbose);

            // Check the record has the required uri
            if (!pokemon.url) {
                LogToConsole("Invalid pokemon object supplied", loggingLevels.Verbose);
                return false;
            }

            // Query the api
            $.get(pokemon.url, function (data) {

                    // Store the callback ready to fire after data is retrieved
                    var callbacks = $.Callbacks();
                    callbacks.add(complete);

                    // Check we actually got something usable
                    LogToConsole("Verifying data...", loggingLevels.Verbose);
                    if (data.id == undefined) {

                        // Call fail method to alert user
                        PokeApi.ajaxFailed();
                    }
					
					$.get("https://pokeapi.co/api/v2/pokemon/" + data.id, function (moreData){
						var spriteUrl = moreData.sprites.front_default || "question.png";
						jQuery.extend(true, pokemon, data, {sprite: spriteUrl});
						jQuery.extend(true, pokemon, data, {moreData});

						// Fire the callback method
						callbacks.fireWith(window, data);
					});
                }
            )
			.fail(function () {
				// Call fail method to alert user
				PokeApi.ajaxFailed();
			})
			.done(function () {
				// Reset failedToLoadData flag in case it had previously failed
				if (PokeApi.pokeData() != undefined) {
					PokeApi.failedToLoadData = false;
				}
			});

            // In case anything has failed, return false
            return false;
        },


        /// Load the verb and adjectives from local file
        loadVerbFile: function () {

            //$.getJSON( "verbs.json", function(json) {
            //    debugger;
            //    PokeApi.verbFileJson = json;
            //    PokeApi.failedToLoadJson = false;
            //})
            //    .done(function(json) {
            //        debugger;
            //    })
            //    .fail(function() {
            //        debugger;
            //        PokeApi.failedToLoadJson = true;
            //        alert("Verbs file is missing or corrupted");
            //    });

            LogToConsole("Loading verbs and adjectives", loggingLevels.Verbose);

            // WebStorm IDE's development web server doesn't seem to won't to serve a json file, have included below instead
            // TODO: find another way to serve json from local file system
            PokeApi.verbFileJson = verbsFileContents;
            PokeApi.failedToLoadJson = false;
        },


        /// For a given name, randomly select a verb and adjective
        getVerbAndAdjective: function (name) {

            LogToConsole("Selecting verb and adjective for " + name, loggingLevels.Verbose);

            // Load the verb file if it has not already been loaded
            if (PokeApi.verbFileJson.length == 0) {
                PokeApi.loadVerbFile();
            }

            if (PokeApi.failedToLoadJson) {
                // Data unavailable, no point continuing
                return false;
            }

            // Get first one and first two characters in name
            var firstCharInName = name.substring(0, 1).toLowerCase();
            var firstTwoCharsInName = name.substring(0, 2).toLowerCase();

            // Call sub to select name based on first one or first two characters
            var verb = getWord(firstCharInName, firstTwoCharsInName, PokeApi.verbFileJson.verbs).capFirst();
            var adjective = getWord(firstCharInName, firstTwoCharsInName, PokeApi.verbFileJson.adjectives).capFirst();

            LogToConsole("Selected [" + verb + "] and [" + adjective + "]", loggingLevels.Verbose);
            return {verb: verb, adjective: adjective};


            // Sub that filters the verb data down to a single word from the specified collection
            function getWord(firstLetter, firstTwoLetters, wordCollection) {

                // First try to find a verb / adjective that shares the first two characters as this is more alliterative.
                var returnWords = wordCollection.filter(function (word) {
                    return (
                        word.substr(0, 2).toLowerCase() == firstTwoLetters
                    )
                });

                // If no words found that start with same two chars, revert to just the first char
                if (returnWords.length == 0) {
                    returnWords = wordCollection.filter(function (word) {
                        return (
                            word.substr(0, 1).toLowerCase() == firstLetter
                        )
                    });
                }

                // Double check a word was actually found (as long as the Json has loaded correctly this should never happen)
                if (returnWords.length == 0) {
                    LogToConsole("Could not find a suitable word starting with " + firstLetter, loggingLevels.Alerts);
                    alert("No words found starting with '" + firstLetter + "'");
                    return null;
                }

                // From the array of matching words, randomly select a return word
                var randomSelector = Math.round(Math.random() * (returnWords.length - 1));
                return returnWords[randomSelector];
            }
        }
    });

})(window.PokeApi = window.PokeApi || {}, jQuery);


PokeApi.init();


verbsFileContents = {
    "verbs": [
        "acting", "aching", "admiring", "avenging",
        "boring", "bailing", "bawling", "braying",
        "coughing", "charging", "charming", "chirruping",
        "doubting", "dragging", "doubling", "dashing",
        "effacing", "erupting", "exploding", "eluding",
        "farting", "fleeing", "flapping", "fleeing",
        "giggling", "grunting", "gaping", "gnawing",
        "hurling", "heaving", "hooting", "hesitating",
        "intimidating", "impeding", "innovating", "imploding",
        "joining", "juggling", "jumping", "joking",
        "knitting", "knocking", "kicking", "kipping",
        "learning", "leaping", "laughing", "loping",
        "mocking", "moping", "marching", "mending",
        "napping", "nutting", "nibbling", "nodding",
        "ogling", "oiling", "obliging", "overexposing",
        "plucking", "pouting", "perspiring", "popping",
        "quacking", "quipping", "quaking", "quarreling",
        "resting", "rocking", "rousing", "ranting",
        "shouting", "slipping", "squatting", "scooping",
        "tripping", "ticking", "threatening", "twerking",
        "unraveling", "ushering", "upsetting", "urinating",
        "vanishing", "vacuuming", "vandalising", "vomiting",
        "working", "waiting", "whooping", "wishing",
        "x-raying", "x-ing", "x-winging", "x-ploding",
        "yearning", "yodelling", "yammering", "yoyo-ing",
        "zapping", "zipping", "zooming", "zinging"
    ],
    "adjectives": [
        "admirable", "agreeable", "aggressive", "argumentative",
        "bold", "bad-ass", "broken", "blunted",
        "clever", "calm", "callous", "cooperative",
        "daring", "dizzy", "dangerous", "dodgy",
        "eager", "ebullient", "eloquent", "erudite",
        "fearless", "flaky", "felicitous", "funny",
        "gormless", "golden", "grand", "gregarious",
        "happy", "haughty", "harmless", "hearty",
        "ignominious", "intelligent", "illustrious", "insane",
        "jumpy", "juvenile", "jaunty", "jolly",
        "kooky", "kindly", "keen", "kaleidoscopic",
        "loopy", "lovely", "learned", "lazy",
        "massive", "mature", "meek", "merciful",
        "nervous", "nasty", "naked", "natty",
        "outstanding", "opulent", "obnoxious", "obscene",
        "patient", "perky", "peaceful", "prosperous",
        "quirky", "quiet", "quarrelsome", "quixotic",
        "resplendent", "radiant", "raspy", "regal",
        "superfluous", "supreme", "shaky", "slippy",
        "terrifying", "trippy", "tenacious", "tough",
        "upbeat", "unique", "ugly", "unyielding",
        "veracious", "vagrant", "virtuous", "vigilant",
        "wobbly", "watchful", "wacky", "wondrous",
        "xenodochial", "xylotomous", "xenogenic", "xerophytic",
        "young", "yummy", "yucky", "yellowed",
        "zaftig", "zionist", "zoophagous", "zealous"
    ]
};
