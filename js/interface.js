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
                        $("#HistoryTableContainer").show();
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

            // Get extended details of pokemon from the API
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


    /// Highlight a clicked button until the data is retrieved
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


    /// Render history to table
    function renderHistoryTable() {

        // prep table and template
        var table = $("#HistoryTable");
        var template = $("#TemplateRow");


        // Get records
        var existingSavedRecords = localCardHistory();

        // Toggle visibility of message / table
        if (existingSavedRecords.pokemon.length == 0) {
            $("#HistoryTableWrapper").hide();
            $("#NoHistoryMsg").show();
        }
        else {
            $("#HistoryTableWrapper").show();
            $("#NoHistoryMsg").hide();
        }

        // Remove the old rows
        table.find("tbody tr").not("#TemplateRow").remove();

        // iterate / populate
        $(existingSavedRecords.pokemon).each(function () {

            var record = this;
            var newRow = template.clone(false).removeAttr("id");

            // Template row defines the key field in an attribute called 'data-key'
            // TODO: Use something truly unique for a key instead of just the name field
            var key = newRow.attr("data-key");
            newRow.attr("data-key", record.name);

            // Bind data-field data to the row
            $(newRow).find("[data-field]").each(function () {
                var field = $(this).attr("data-field");

                // Check record has a corresponding field
                if (record[field]) {
                    $(this).text(record[field]);
                }
            });

            // Bind composite-field data to the row
            $(newRow).find("[data-comsposite-field]").each(function () {

                var element = this;
                var outputValue = "";
                var compositeParts = $(this).attr("data-comsposite-field").split(",");

                // Iterate through the composite part values in the field to build an output value
                $(compositeParts).each(function () {
                    var part = this;

                    // Check if the part is a string literal
                    var partLength = part.length;
                    if (part.substr(0, 1) == "'" && part.substr(partLength - 1, 1) == "'") {
                        // Strip off the apostrophes
                        outputValue += part.substr(1, partLength - 2);
                    } else {
                        // Attempt to find a corresponding field in the record
                        if (record[part]) {
                            outputValue += record[part];
                        }
                    }
                });

                $(element).text(outputValue);
            });


            // Add the row to the table and un-hide it
            newRow.appendTo(table).show();
        });

        // Bind actions
        table.find("button[data-use='copy']").click(copyToClipBoard);
        table.find("button[data-use='delete']").click(deleteRowFromHistory);
    }


    /// Gets / sets local storage into array
    function localCardHistory(updatedHistory) {
        if (typeof(Storage) != "undefined") {

            // TODO: implement in-memory 'var' cache instead of returning to disk each time

            // If a value is supplied the local storage is being updated
            if (updatedHistory) {

                // Store the updated history
                localStorage.setItem("SavedPokemon", JSON.stringify(updatedHistory));

                // Redraw the table
                // TODO: Rather than re-build the entire table, just insert the new row
                renderHistoryTable();

                return updatedHistory;
            } else {

                // Get SavedPokemon from storage
                var existingSavedRecords = localStorage.getItem("SavedPokemon");

                // If there is a stored value, return it
                if (existingSavedRecords) {
                    return JSON.parse(existingSavedRecords);
                } else {
                    // If there was nothing in storage, initialise a new array
                    existingSavedRecords = JSON.parse('{"pokemon": []}');

                    // Store and return empty array
                    return localCardHistory(existingSavedRecords);
                }

            }
        }
    }


    /// Stores the given pokemon record in the local storage array
    function storeLocally(pokedata) {
        if (typeof(Storage) != "undefined") {

            // Parse the json into an array
            var existingSavedRecords = localCardHistory();

            // Find the record in the storage array
            var match = findRecordInData(pokedata.name, existingSavedRecords.pokemon);

            // Make sure that the store doesn't already have the record
            if (match.length == 0) {
                // Push the new record into the array
                existingSavedRecords.pokemon.push(pokedata);

                // Store the updated array (only if it's actually changed)
                localCardHistory(existingSavedRecords);
            }
        }
    }


    /// Copy the name from the clicked row to the clipboard
    function copyToClipBoard() {

        var button = this;

        // Remove all selection ranges before starting
        window.getSelection().removeAllRanges();

        var nameElement = $(this).closest("tr").find(".name-cell");

        if (nameElement.length == 0) {
            alert("Sorry, something went wrong and the copy failed\r\n\r\nplease highlight the name and use Ctrl+C / Command + C");
            return false;
        }

        // Create document selection range
        var range = document.createRange();
        range.selectNode(nameElement[0]);

        // Use getSelection on the range
        window.getSelection().addRange(range);

        try {
            // Execute the copy command
            if (document.execCommand('copy')) {
                // Remove all ranges before starting
                window.getSelection().removeAllRanges();

                // Reset all buttons to read 'copy'
                $("button[data-use='copy']").text("copy");

                // Update this button to read 'copied!' and flash
                $(button).delay(300).fadeOut(200, function () {
                    $(this).text("copied!");
                }).fadeIn(200);
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


    /// Removes the given pokemon record from the local storage array
    function deleteRowFromHistory() {
        if (typeof(Storage) != "undefined") {

            // Get the name of the pokemon from the clicked row
            var name = $(this).closest("tr").attr("data-key");

            // Get SavedPokemon from storage
            var existingSavedRecords = localCardHistory();

            // Find the record in the storage array
            var match = findRecordInData(name, existingSavedRecords.pokemon);

            // TODO: manually iterate over existingSavedRecords, for some reason, indexOf doesn't work with complex objects
            // Splice the new record out of the array
            var index = existingSavedRecords.pokemon.indexOf(match);
            if (index != -1) {
                existingSavedRecords.pokemon.splice(index, 1);
            }

            // Store the updated array
            localCardHistory(existingSavedRecords);
        }
    }


    /// Find the record in the  array
    function findRecordInData(name, data) {
        // INFO: Had to use a filter array.indexOf didn't match
        return data.filter(function (record) {
            return (
                record.name == name
            )
        });
    }

    renderHistoryTable();
    scaleDocument();

    $("#CardHistoryLink").click(function () {
        $("#MessageWindow").show();
    });
});