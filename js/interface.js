/**
 * Created by Craig on 02/07/2015.
 */

$(function () {

    // Create 4 additional card elements from the template
    var $cardTemplate = $("article[data-name='template']");
    for (var i = 0; i < 4; i++) {
        $cardTemplate.clone(true).insertAfter($cardTemplate);
    }

    // Store links in var to save re-selecting them later
    var $alphaLinks = $("#AlphaLinks").find("A");
    var $continueButton = $("#MessageWindow").find("Button.message-button");

    // Disable the buttons until the api is ready
    $alphaLinks.addClass("disabled");

    // Listen for the api to be ready
    if (PokeApi && PokeApi.ready !== undefined) {
        $(document).bind("PokeApi.ready", function () {

            // Only enable the buttons if bindLinks() returns true
            if (bindLinks()) {
                $alphaLinks.removeClass("disabled");
                $continueButton.removeClass("disabled").addClass("ready").fadeOut(200, function () {
                    $(this).text("Continue").click(function () {
                        $("#MessageWindow").hide();
                    });
                }).fadeIn(200);
            }

        });
    }

    // Bind the click event for the buttons
    function bindLinks() {

        var pokemonLoaded = 0;
        var instructionsHidden = false;

        $("#AlphaLinks").find("a").click(function () {

            if (!instructionsHidden) {
                instructionsHidden = true;
                $("#Instructions").addClass("faded");
            }

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

                // TODO: find a way to disable the link when all the Pokemon beginning with [char] have been shown rather than wait for it to be clicked again
                return false;
            }

            PokeApi.getDetails(newPokemon, function () {
                var $card = $("#Board").find("article:eq(" + pokemonLoaded + ")").addClass("visible");
                $card.find(".name-plate-side").text(newPokemon.name);
                $card.find(".name-plate-main .adj-verb").text(newPokemon.adjective + " " + newPokemon.verb);
                $card.find(".name-plate-main .title").text(newPokemon.name);
                $card.find(".sprite img").attr("src", newPokemon.sprite);
                $card.find(".details dd[data-field='height']").text(newPokemon.height);
                $card.find(".details dd[data-field='weight']").text(newPokemon.weight);
                $card.find(".details dd[data-field='attack']").text(newPokemon.attack);
                $card.find(".details dd[data-field='defense']").text(newPokemon.defense);

                StoreLocally(newPokemon);

                pokemonLoaded++;
                if (pokemonLoaded == 5) {
                    $alphaLinks.addClass("disabled").off("click");
                }

                ToggleHighlight($that);
            });

        });

        return true;
    }

    function StoreLocally(pokedata) {
        if (typeof(Storage) != "undefined") {

            // Get SavedPokemon from storage
            var existingSavedRecords = localStorage.getItem("SavedPokemon");

            // If there was nothing in storage, initialise a new array
            if (!existingSavedRecords || existingSavedRecords == "null") {
                existingSavedRecords = '{"pokemon": []}';
            }

            existingSavedRecords = JSON.parse(existingSavedRecords);

            // Push the new record into the array
            existingSavedRecords.pokemon.push(pokedata);

            // Store the updated array
            localStorage.setItem("SavedPokemon", JSON.stringify(existingSavedRecords));

            //// Test
            //debugger;
            //var retrievedObject = localStorage.getItem("SavedPokemon");
        }
    }

    // Handle the visual representation of selecting a link
    function ToggleHighlight(which) {
        var highlighted = $("#AlphaLinks").find("a.highlight");
        if (highlighted[0] === which[0]) {
            $(which).removeClass("highlight");
        }
        else {
            $(highlighted).removeClass("highlight");
            $(which).addClass("highlight");
        }
    }
});