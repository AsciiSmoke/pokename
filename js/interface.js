/**
 * Created by Craig on 02/07/2015.
 */

$(function () {

    // Quick and simple scaling based on an ideal size of 1600px
    function scaleDocument() {
        // TODO: make items scale better for tablets and mobiles
        $("html").css("zoom", $(window).innerWidth() / 1600);
    }

    // Bind the resize function to window.resize
    $(window).on("resize", scaleDocument);

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

                        // Hide the welcome message, it is no longer needed
                        $("#WelcomeMessage").hide();

                        // Un-hide the history table ready for when the user clicks the history button
                        $("#HistoryTableWrapper").show();
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

                storeLocally(newPokemon);

                pokemonLoaded++;
                if (pokemonLoaded == 5) {
                    $alphaLinks.addClass("disabled").off("click");
                }

                ToggleHighlight($that);
            });

        });

        return true;
    }

    function storeLocally(pokedata) {
        if (typeof(Storage) != "undefined") {

            // Get SavedPokemon from storage
            var existingSavedRecords = localStorage.getItem("SavedPokemon");

            // If there was nothing in storage, initialise a new array
            if (!existingSavedRecords || existingSavedRecords == "null") {
                existingSavedRecords = '{"pokemon": []}';
            }

            // Parse the json into an array
            existingSavedRecords = JSON.parse(existingSavedRecords);

            // Find the record in the storage array
            var match = findRecordInData(pokedata.name, existingSavedRecords.pokemon);

            // Make sure that the store doesn't already have the record
            if (match.length == 0) {
                // Push the new record into the array
                existingSavedRecords.pokemon.push(pokedata);

                // Store the updated array (only if it's actually changed)
                localStorage.setItem("SavedPokemon", JSON.stringify(existingSavedRecords));
            }
        }
    }


    function deleteRowFromHistory() {
        if (typeof(Storage) != "undefined") {

            // Get SavedPokemon from storage
            var existingSavedRecords = localStorage.getItem("SavedPokemon");

            // If there was nothing in storage, initialise a new array
            if (!existingSavedRecords || existingSavedRecords == "null") {
                existingSavedRecords = '{"pokemon": []}';
            }

            // Parse the json into an array
            existingSavedRecords = JSON.parse(existingSavedRecords);

            // Find the record in the storage array
            var match = findRecordInData(pokedata.name, existingSavedRecords.pokemon);

            // splice the new record out of the array
            var index = existingSavedRecords.pokemon.indexOf(match);
            if (index != -1) {
                existingSavedRecords.pokemon.splice(index, 1);
            }

            // Store the updated array
            localStorage.setItem("SavedPokemon", JSON.stringify(existingSavedRecords));

            // Redraw the table
            // TODO: it would be more efficient to juggle the array in memory rather than return to the disk each time
            retrieveLocal();
        }
    }


    // Find the record in the storage array
    function findRecordInData(name, data) {
        // INFO: Had to use a filter array.indexOf didn't match
        return data.filter(function (record) {
            return (
                record.name == name
            )
        });
    }


    function retrieveLocal() {
        if (typeof(Storage) != "undefined") {

            // Get SavedPokemon from storage
            var existingSavedRecords = localStorage.getItem("SavedPokemon");

            // If there was nothing in storage, initialise a new array
            if (!existingSavedRecords || existingSavedRecords == "null") {
                return;
            }

            var table = $("#HistoryTable");
            var template = $("#TemplateRow");

            existingSavedRecords = JSON.parse(existingSavedRecords);
            $(existingSavedRecords.pokemon).each(function () {

                var record = this;
                var newRow = template.clone(false).removeAttr("id");

                // Bind data to the row
                $(newRow).find("[data-field]").each(function () {
                    var field = $(this).attr("data-field");
                    $(this).text(record[field]);
                });

                // Add the row to the table and un-hide it
                newRow.appendTo(table).show();
            });

            table.find("button[data-use='copy']").click(copyToClipBoard);
            table.find("button[data-use='delete']").click(deleteRowFromHistory);
        }
    }


    function copyToClipBoard() {
        // Remove all ranges before starting
        window.getSelection().removeAllRanges();

        // Create document selection range
        var range = document.createRange();
        range.selectNode($(this).closest("tr").find("td:first")[0]);

        // Use getSelection on the range
        window.getSelection().addRange(range);

        try {
            // Execute the copy command
            if (document.execCommand('copy')) {
                // Remove all ranges before starting
                window.getSelection().removeAllRanges();
                alert("Copied!")
            } else {
                reportCopyFail();
            }
        } catch (err) {
            reportCopyFail();
        }

        function reportCopyFail() {
            alert("Sorry, your browser does not seem to support the copy feature");
        }

    }


    // Highlight a clicked button until the data is retrieved
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

    retrieveLocal();
    scaleDocument();

    $("#CardHistoryLink").click(function () {
        $("#MessageWindow").show();
    });
});