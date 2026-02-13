/**
 * Opens the database corresponding to the currently-selected region and starts a transaction to read data from the given object store.
 * 
 * @param {string} objectStore - The name of the object store to open
 * @param {string} key - The key to access the data from
 * @returns {Promise<any>} - The data
 */
async function readFromDatabase(objectStore, key) {
    return new Promise((resolve, reject) => {
        let databaseName;

        if (localStorage.getItem("nwtLastUsedRegion") === "custom") {
            databaseName = localStorage.getItem("nwtLastUsedCustomRegion");
        } else {
            databaseName = `nwtRegionDatabase-${localStorage.getItem("nwtLastUsedRegion")}`;
        }

        const openRequest = indexedDB.open(databaseName);
        openRequest.addEventListener("success", (_) => {
            const transaction = openRequest.result.transaction(objectStore);
            const request = transaction.objectStore(objectStore).get(key);
            request.addEventListener("success", (_) => resolve(request.result));
            request.addEventListener("error", (_) => reject());
            transaction.addEventListener("complete", (_) => openRequest.result.close());
        });
        openRequest.addEventListener("error", (_) => reject());
    });
}

/**
 * Handles the functionality of the trip adder window,
 * including creating it through activateEditor.
 */
async function addTrip() {
    const w = await activateEditor(window, "add-trip.html");

    // Assign functionality to buttons
    w.document.getElementById("add-option-button").addEventListener("click", (_) => addOptionRow(w));
    w.document.getElementById("save-exit-button").addEventListener("click", (_) => saveTrip(w));
}

/**
 * Adds a row to the table containing the options used in the trip
 * 
 * @param {Window} tripAdderWindow - The window hosting the trip adder
 */
function addOptionRow(tripAdderWindow) {
    const optionTableBody = tripAdderWindow.document.getElementById("options-table").getElementsByTagName("tbody")[0];

    // Create table elements
    const newRowElement = tripAdderWindow.document.createElement("tr");

    const startWalkingTimeCell = tripAdderWindow.document.createElement("td");
    const firstStopCell = tripAdderWindow.document.createElement("td");
    const intermediateStopsCell = tripAdderWindow.document.createElement("td");
    const lastStopCell = tripAdderWindow.document.createElement("td");
    const endWalkingTimeCell = tripAdderWindow.document.createElement("td");
    const optionsCell = tripAdderWindow.document.createElement("td");

    // Create corresponding inputs
    const startWalkingTimeInput = tripAdderWindow.document.createElement("input");
    const firstStopIdLabel = tripAdderWindow.document.createElement("code");
    const firstStopSelectButton = tripAdderWindow.document.createElement("button");
    const intermediateStopsHiddenInput = tripAdderWindow.document.createElement("input");
    const intermediateStopsCount = tripAdderWindow.document.createTextNode("0");
    const intermediateStopsText = tripAdderWindow.document.createTextNode(" intermediate stops");
    const intermediateStopsButton = tripAdderWindow.document.createElement("button");
    const lastStopIdLabel = tripAdderWindow.document.createElement("code");
    const lastStopSelectButton = tripAdderWindow.document.createElement("button");
    const endWalkingTimeInput = tripAdderWindow.document.createElement("input");
    const deleteButton = tripAdderWindow.document.createElement("button");

    // Give inputs context and classes
    for (const walkingTimeInput of [startWalkingTimeInput, endWalkingTimeInput]) {
        walkingTimeInput.setAttribute("type", "number");
        walkingTimeInput.setAttribute("class", "walking-time-input");
    }
    for (const button of [firstStopSelectButton, intermediateStopsButton, lastStopSelectButton, deleteButton]) {
        button.setAttribute("type", "button");
    }
    for (const stopSelect of [firstStopSelectButton, lastStopSelectButton]) {
        stopSelect.innerText = "Select a stop";
        stopSelect.setAttribute("class", "stop-selector");
    }

    // Not looping these two because they will need to be updated separately eventually.
    firstStopIdLabel.innerText = "---";
    lastStopIdLabel.innerText = "---";

    intermediateStopsHiddenInput.setAttribute("type", "hidden");

    intermediateStopsButton.innerText = "Configure intermediate stops";
    intermediateStopsButton.setAttribute("class", "intermediate-stops-button");

    deleteButton.innerText = "Delete";
    deleteButton.setAttribute("class", "delete-button");

    // Assign buttons functionality
    firstStopSelectButton.addEventListener("click", (_) => {
        selectStop(tripAdderWindow).then(value => {
            if (value !== null) {
                firstStopIdLabel.innerText = value;
            }
        });
    });
    intermediateStopsButton.addEventListener("click", (_) => {
        configureIntermediateStops(tripAdderWindow, newRowElement).then(value => {
            if (value !== null) {
                intermediateStopsHiddenInput.value = JSON.stringify(value);
                intermediateStopsCount.innerText = value;
            }
        });
    });
    lastStopSelectButton.addEventListener("click", (_) => {
        selectStop(tripAdderWindow).then(value => {
            if (value !== null) {
                lastStopIdLabel.innerText = value;
            }
        });
    });

    deleteButton.addEventListener("click", (_) => deleteOptionRow(newRowElement));

    // Add inputs to cells
    startWalkingTimeCell.appendChild(startWalkingTimeInput);
    firstStopCell.appendChild(firstStopIdLabel);
    appendBRElementAsChild(firstStopCell);
    firstStopCell.appendChild(firstStopSelectButton);
    intermediateStopsCell.appendChild(intermediateStopsHiddenInput);
    intermediateStopsCell.appendChild(intermediateStopsCount);
    intermediateStopsCell.appendChild(intermediateStopsText);
    appendBRElementAsChild(intermediateStopsCell);
    intermediateStopsCell.appendChild(intermediateStopsButton);
    lastStopCell.appendChild(lastStopIdLabel);
    appendBRElementAsChild(lastStopCell);
    lastStopCell.appendChild(lastStopSelectButton);
    endWalkingTimeCell.appendChild(endWalkingTimeInput);

    optionsCell.appendChild(deleteButton);

    // Add cells to row
    newRowElement.append(startWalkingTimeCell, firstStopCell, intermediateStopsCell, lastStopCell, endWalkingTimeCell, optionsCell);

    // Add row to table
    optionTableBody.appendChild(newRowElement);

    function appendBRElementAsChild(element) {
        element.appendChild(tripAdderWindow.document.createElement("br"));
    }
}

/**
 * Handles the functionality for adding/editing intermediate stops.
 * The user can also change the start and end stops from this screen.
 * Start and end stop changes are saved directly to the main table row.
 * 
 * @param {Window} tripAdderWindow - The window hosting the trip adder
 * @param {HTMLTableRowElement} row - The table row to configure intermediate stops for
 * @returns {Promise<object>} - Intermediate stop data
 */
async function configureIntermediateStops(tripAdderWindow, row) {
    return new Promise(async (resolve, reject) => {
        try {
            const intermediateStopsWindow = await activateEditor(tripAdderWindow, "add-intermediate-stops.html");

            const startStopRow = intermediateStopsWindow.document.getElementById("start-stop-row");
            const startStopIdElementIntermediateStopsWindow = startStopRow.querySelector("td>code");
            const startStopIdElementMainWindow = row.querySelector("td:nth-of-type(2)>code");

            const endStopRow = intermediateStopsWindow.document.getElementById("end-stop-row");
            const endStopIdElementIntermediateStopsWindow = endStopRow.querySelector("td>code");
            const endStopIdElementMainWindow = row.querySelector("td:nth-of-type(4)>code");

            // Give the buttons functionality
            startStopRow.querySelector("td>button").addEventListener("click", (_) => updateStartStop());
            endStopRow.querySelector("td>button").addEventListener("click", (_) => updateEndStop());

            intermediateStopsWindow.document.getElementById("save-exit-button").addEventListener("click", (_) => saveAndExit());

            // Show the correct stop ids on load
            startStopIdElementIntermediateStopsWindow.innerText = startStopIdElementMainWindow.innerText;
            endStopIdElementIntermediateStopsWindow.innerText = endStopIdElementMainWindow.innerText;

            function updateStartStop() {
                selectStop(intermediateStopsWindow).then(value => {
                    if (value !== null) {
                        startStopIdElementIntermediateStopsWindow.innerText = value;
                        startStopIdElementMainWindow.innerText = value;
                    }
                });
            }
            function updateEndStop() {
                selectStop(intermediateStopsWindow).then(value => {
                    if (value !== null) {
                        endStopIdElementIntermediateStopsWindow.innerText = value;
                        endStopIdElementMainWindow.innerText = value;
                    }
                });
            }

            function saveAndExit() {
                // Note: this function does NOT save data yet (TODO)
                intermediateStopsWindow.close();
                resolve(null);
            }
        } catch { reject(); }
    });
}

/**
 * Deletes an option row
 * 
 * @param {HTMLTableRowElement} row - The row to delete
 */
function deleteOptionRow(row) {
    if (row.ownerDocument.defaultView.confirm("Are you sure you want to delete this option? This cannot be undone.")) {
        row.remove();
    }
}

/**
 * Displays the stop selection window and handles the input to it
 * 
 * @param {Window} parentWindow - The parent window for the stop selection window to open as a child of
 * @returns {Promise<string | null>} - A promise resolving to the stop_id of the selected stop, or null if the user cancels the operation
 */
async function selectStop(parentWindow) {
    return new Promise(async (resolve, reject) => {
        try {
            const stopSelectWindow = await activateEditor(parentWindow, "stop-select.html");

            // Give the buttons functionality
            stopSelectWindow.document.getElementById("gtfs-stop-id-submit").addEventListener("click", (_) => getStopById());
            stopSelectWindow.document.getElementById("gtfs-stop-code-submit", "click").addEventListener("click", (_) => getStopByStopCode());
            stopSelectWindow.document.getElementById("gtfs-stop-name-submit").addEventListener("click", (_) => getStopByName());

            stopSelectWindow.document.getElementById("confirm-button").addEventListener("click", (_) => confirmSelectedStop());
            stopSelectWindow.document.getElementById("cancel-button").addEventListener("click", (_) => cancel());

            function getStopById() {
                const stopId = stopSelectWindow.document.getElementById("gtfs-stop-id-input").value;

                readFromDatabase("stops", stopId).then(updateStopConfirmation);
            }
            function getStopByStopCode() { stopSelectWindow.alert("Sorry! Not implemented yet"); }
            function getStopByName() { stopSelectWindow.alert("Sorry! Not implemented yet"); }

            function updateStopConfirmation(stop) {
                const stopIdText = stopSelectWindow.document.getElementById("selected-stop-id");
                const stopNameText = stopSelectWindow.document.getElementById("selected-stop-name");
                const confirmButton = stopSelectWindow.document.getElementById("confirm-button");

                if (stop) {
                    stopIdText.innerText = stop.stop_id;
                    stopNameText.innerText = stop.stop_name;
                    confirmButton.removeAttribute("disabled");
                } else {
                    stopIdText.innerText = "---";
                    stopNameText.innerText = "Stop not found";
                    confirmButton.setAttribute("disabled", "");
                }
            }

            function confirmSelectedStop() {
                resolve(stopSelectWindow.document.getElementById("selected-stop-id").innerText);
                stopSelectWindow.close();
            }
            function cancel() {
                resolve(null);
                stopSelectWindow.close();
            };
        } catch { reject(); }
    });
}

/**
 * Saves the trip and closes the trip adder.
 * 
 * @param {Window} tripAdderWindow - The window hosting the trip adder
 */
function saveTrip(tripAdderWindow) {
    tripAdderWindow.close();
}

/**
 * Opens an editor pop-up window, and returns it
 * 
 * @param {Window} parentWindow - The parent window to make the editor window a child of
 * @param {string} editorTarget - The URL to open in the editor window
 * @returns {Promise<Window>} - A promise resolving to the opened editor window, once it has loaded
 */
async function activateEditor(parentWindow, editorTarget) {
    return new Promise((resolve, reject) => {
        const editorWindow = parentWindow.open(editorTarget, "_blank", "popup");

        editorWindow.addEventListener("load", (_) => resolve(editorWindow));

        if (editorWindow === null) {
            reject(`${editorTarget} window did not activate`);
        }
    });
}

document.getElementById("add-new-trip-button").addEventListener("click", _ => addTrip());
