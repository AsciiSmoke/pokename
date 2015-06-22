/**
 * Created by Craig on 18/06/2015.
 */

// Enclose the plugin code to protect against potential change in jQuery scope later
(function (PokeApi, $) {

    // Use extend to attach plugin code to window.PokeApi via local variable PokeApi
    $.extend(PokeApi, {

        apiUrl: "http://pokeapi.co/api/v1/pokedex/1/",
        loaded: false,
        pokeData: [],
        displayedPokemon: [],

        // Init method to set up data
        init: function () {
            if (PokeApi.pokeData.length == 0) {
                console.log("Initiallising...");
                PokeApi.getAllData();
            }
        },

        getAllData: function () {
            console.log("Fetching data...");
            $.get(PokeApi.apiUrl, function (data) {

                // Check we actually got something usable
                console.log("Verifying data...");
                if (data.pokemon == undefined || data.pokemon.length <= 0) {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                }

                // Sort and store the data in an object level variable for safe-keeping
                console.log("Sorting and storing data...");
                PokeApi.pokeData = PokeApi.sortData(data.pokemon);
                console.log(PokeApi.pokeData);

            })
                .fail(function () {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                })
                .done(function () {
                    // Set loaded flag to allow the application can interact with the data
                    if (PokeApi.pokeData != undefined) {
                        PokeApi.loaded = true;

                        // Test getNewPokemon
                        for (var ii = 0; ii <= 100; ii++) {
                            var newPokemon = PokeApi.getNewPokemon("c");
                            if (newPokemon) {
                                console.log(PokeApi.getNewPokemon("c"));
                            }else{
                                break;
                            }
                        }
                    }
                })
                .always(function () {
                });
        },

        ajaxFailed: function () {
            PokeApi.loaded = false;
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
            console.log("Finding Random Pokemon that start with '" + char + "' ...");

            // Create a shortlist by filtering down to the first character and ignoring any previously returned pokemon
            var filteredShortList = PokeApi.pokeData.filter(function (poke) {
                return (
                    poke.name.substr(0, 1).toLowerCase() == char
                    &&
                    PokeApi.displayedPokemon.indexOf(poke) == -1
                )
            });

            var shortlistCount = (filteredShortList.length);

            // Pick a PokeMon from the filtered short list
            if (shortlistCount > 0) {
                var randomSelector = Math.round(Math.random() * (shortlistCount - 1));
                var pokeToReturn = filteredShortList[randomSelector];

                // Push the selected pokemon into a list of returned pokemon and return
                PokeApi.displayedPokemon.push(pokeToReturn);
                return pokeToReturn;
            } else {
                alert("No new Pokemon found starting with '" + char + "'");
                return null;
            }
        }

    });

})(window.PokeApi = window.PokeApi || {}, jQuery);

PokeApi.init();
