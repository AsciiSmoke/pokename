/**
 * Created by Craig on 18/06/2015.
 */

// Enclose the plugin code to protect against potential change in jQuery scope later
(function (PokeApi, $) {

    // Use extend to attach plugin code to window.PokeApi via local variable PokeApi
    $.extend(PokeApi, {

        apiUrl: "http://pokeapi.co/api/v1/pokedex/1/",
        pokeData: [],

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


                console.log("Verifying data...");
                // Check you actually got something usable
                if (data.pokemon == undefined || data.pokemon.length <= 0) {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                }


                console.log("Sorting and storing data...");
                // Sort and store the data in an object level variable for safe-keeping
                PokeApi.pokeData = PokeApi.sortData(data.pokemon);
                console.log(PokeApi.pokeData);

                var filteredData = PokeApi.filterData("c");

                console.log(filteredData);
            })
                .fail(function () {
                    // Call fail method to alert user
                    PokeApi.ajaxFailed();
                })
                .done(function () {
                })
                .always(function () {
                });
        },

        ajaxFailed: function () {
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

        filterData: function (char) {
            console.log("Finding Pokemon that start with '"+char+"' ...");
            return PokeApi.pokeData.filter(function (poke) {
                return poke.name.substr(0, 1).toLowerCase() == char;
            });
        }

    });

})(window.PokeApi = window.PokeApi || {}, jQuery);

PokeApi.init();