/**
 * Created by Craig on 02/07/2015.
 */

var pokemonLoaded = 0;
$(function () {
    $("#AlphaLinks").find("a").click(function () {

        if (window.PokeApi == undefined) {
            alert("Sorry, an error has occurred, please refresh your page and try again.");
            return false;
        }

        if (window.PokeApi.failedToLoadData == false && window.PokeApi.pokeData.length == 0) {
            alert("Sorry, I haven't finished loading the data, please wait...");
            return false;
        }

        // Take a copy of the pointer to 'this' before the scope changes
        var $that = $(this);
        var char = $that.attr("data-char");

        // If the clicked button has a char that is a letter, proceed with that letter
        if (char.match(/^[a-z]+$/)) {
            ToggleHighlight($that);
        } else {

            // Otherwise, select a letter at random.
            var randomNum = Math.round(Math.random() * (26 - 1));
            $("#AlphaLinks").find("a")[randomNum].click();

            // Prevent further processing (pass processing to the newly 'clicked' button
            return false;
        }

        // If we got past the error checking, then proceed with selecting a Pokemon
        var newPokemon = PokeApi.getNewPokemon(char);

        if (newPokemon == null) {
            alert("Sorry, there are no more Pokemon beginning with " + char);
            $that.addClass("disabled").off("click");

            // TODO: find a way to preventatively disable the link when all the Pokemon
            // beginning with [char] have been shown rather than wait for it to be clicked
            return false;
        }

        var $card = $("#Board").find("article:eq(" + pokemonLoaded + ")").addClass("visible");
        $card.find(".name-plate").text(newPokemon.name);
        $card.find(".details").text(newPokemon.adjective + " " + newPokemon.verb + " " + newPokemon.name);


        pokemonLoaded++;
        if (pokemonLoaded == 5) {
            $("#AlphaLinks").find("A").addClass("disabled").off("click");
        }

    });

    // Handle the visual representation of selecting a link
    function ToggleHighlight(which) {
        $("#AlphaLinks").find("a.highlight").removeClass("highlight");
        $(which).addClass("highlight");
    }

});