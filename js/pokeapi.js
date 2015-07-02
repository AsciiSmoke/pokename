/**
 * Created by Craig on 18/06/2015.
 */

// Helpers
var loggingLevels = {
    None: 0,
    OutputOnly: 1,
    Verbose: 2
};

function LogToConsole(message, level){
    if (window.loggingLevel >= level){
        console.log(message);
    }
}

String.prototype.capFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
// End of helpers


// Set logging level to desired amount of console output
window.loggingLevel = loggingLevels.OutputOnly;


// Enclose the plugin code to protect against potential change in jQuery scope later
(function (PokeApi, $) {

    // Use extend to attach plugin code to window.PokeApi via local variable PokeApi
    $.extend(PokeApi, {

        apiUrl: "http://pokeapi.co/api/v1/pokedex/1/",
        failedToLoadData: false,
        failedToLoadJson: false,
        pokeData: [],
        displayedPokemon: [],
        verbFileJson: [],

        // Init method to set up data
        init: function () {
            if (PokeApi.pokeData.length == 0) {
                LogToConsole("Initiallising...", loggingLevels.Verbose);
                PokeApi.getAllData();
            }
        },

        getAllData: function () {
            LogToConsole("Fetching data...", loggingLevels.Verbose);
            $.get(PokeApi.apiUrl, function (data) {

                // Check we actually got something usable
                LogToConsole("Verifying data...", loggingLevels.Verbose);
                if (data.pokemon == undefined || data.pokemon.length <= 0) {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                }

                // Sort and store the data in an object level variable for safe-keeping
                LogToConsole("Sorting and storing data...", loggingLevels.Verbose);
                PokeApi.pokeData = PokeApi.sortData(data.pokemon);
            })
                .fail(function () {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                })
                .done(function () {
                    // Reset failedToLoadData flag in case it had previously failed
                    if (PokeApi.pokeData != undefined) {
                        PokeApi.failedToLoadData = false;

                        // Test getNewPokemon
                        for (var ii = 0; ii <= 100; ii++) {
                            var newPokemon = PokeApi.getNewPokemon("c");
                            if (newPokemon) {
                                LogToConsole(newPokemon.verb + " " + newPokemon.adjective + " " + newPokemon.name, loggingLevels.OutputOnly);
                            } else {
                                break;
                            }
                        }
                    }
                })
                .always(function () {
                });
        },

        ajaxFailed: function () {
            PokeApi.failedToLoadData = true;
            alert("Sorry, I couldn't get the Pokemon data.\r\rPlease try again.");
        },

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

        getNewPokemon: function (char) {
            LogToConsole("Finding Random Pokemon that start with '" + char + "'...", loggingLevels.Verbose);

            // Create a shortlist by filtering down to the first character and ignoring any previously returned pokemon
            var filteredShortList = PokeApi.pokeData.filter(function (poke) {
                return (
                    poke.name.substr(0, 1).toLowerCase() == char
                    &&
                    PokeApi.displayedPokemon.filter(function (dispPoke) {
                        return (
                            dispPoke.name == poke.name
                        )
                    }).length == 0
                );
            });

            var shortlistCount = (filteredShortList.length);

            // Check there is at least one Pokemon to select
            if (shortlistCount > 0) {

                // Randomly select a Pokemon from the shortlist
                var randomSelector = Math.round(Math.random() * (shortlistCount - 1));
                var pokeToReturn = filteredShortList[randomSelector];
                pokeToReturn.name = pokeToReturn.name.capFirst();

                // Retrieve a verb and an adjective
                var verbAndAdjective = PokeApi.getVerbAndAdjective(pokeToReturn.name);
                pokeToReturn.verb = verbAndAdjective.verb;
                pokeToReturn.adjective = verbAndAdjective.adjective;

                // Push the selected pokemon into a list of returned pokemon and return
                PokeApi.displayedPokemon.push(pokeToReturn);
                return pokeToReturn;
            } else {
                //alert("No new Pokemon found starting with '" + char + "'");
                //debugger;
                return null;
            }
        },

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

            // WebStorm web server can't serve json file, have included (below) for now
            // TODO: find another way to serve json from local file system
            PokeApi.verbFileJson = verbsFileContents;
            PokeApi.failedToLoadJson = false;
        },

        getVerbAndAdjective: function (name) {

            // Load the verb file if it has not already been loaded
            if (PokeApi.verbFileJson.length == 0) {
                PokeApi.loadVerbFile();
            }

            if (PokeApi.failedToLoadJson) {
                // Data unavailable, no point continuing
                return false;
            }

            var firstCharInName = name.substring(0, 1).toLowerCase();
            var firstTwoCharsInName = name.substring(0, 2).toLowerCase();

            var verb = getWord(firstCharInName, firstTwoCharsInName, PokeApi.verbFileJson.verbs).capFirst();
            var adjective = getWord(firstCharInName, firstTwoCharsInName, PokeApi.verbFileJson.adjectives).capFirst();

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
                    alert("No words found starting with '" + firstLetter + "'");
                    return null;
                }

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
        "xenodochial", "xylotomous", "xenogeneic", "xerophytic",
        "young", "yummy", "yucky", "yellowed",
        "zaftig", "zionist", "zoophagous", "zealous"
    ]
};