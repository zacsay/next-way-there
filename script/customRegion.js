const gtfsRequired = [
    "agency.txt",
    "routes.txt",
    "trips.txt",
    "stop_times.txt"
];
let selectedDir;

async function selectCustomRegion() {
    selectedDir = await showDirectoryPicker();
    let failedOn = null;
    console.log(selectedDir);

    for (const file of gtfsRequired) {
        try {
            await selectedDir.getFileHandle(file);
        } catch (NotFoundError) {
            failedOn = file;
            break;
        }
    }
    const selectionTextElement = document.getElementById("custom-region-selection");
    if (failedOn === null) {
        selectionTextElement.innerHTML = `Selected directory "${selectedDir.name}" probably contains valid GTFS data. \u2705 <button onclick="moveToIndexedDB()">Use it</button>`;
        selectionTextElement.setAttribute("class", "success-text");
    } else {
        selectionTextElement.innerHTML = `<pre style="display: inline;">${failedOn}</pre> not found. Selected directory "${selectedDir.name}" does not contain valid GTFS data. \u274c`;
        selectionTextElement.setAttribute("class", "fail-text");
    }
}

function moveToIndexedDB() {
    if (!confirm("The required data will be copied to the IndexedDB. None of the dataset which you are currently using will be modified, but it will be substantially duplicated elsewhere on your device, so large datasets may use a significant amount of your available storage space.\nIt will be safe to delete your copy of the data once the operation is complete, if you want to.\nIt may also take some time to copy and optimise, depending on your device and the size of the dataset.\nPlease confirm that you want the data copied.")) {
        return;
    }

    saveToIndexedDB(selectedDir, "custom")
}
