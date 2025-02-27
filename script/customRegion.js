const gtfsRequired = [
    "agency.txt",
    "routes.txt",
    "trips.txt",
    "stop_times.txt"
];

async function selectCustomRegion() {
    const selectedDir = await showDirectoryPicker();
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
        selectionTextElement.innerHTML = `Selected directory "${selectedDir.name}" probably contains valid GTFS data. \u2705`;
        selectionTextElement.setAttribute("class", "success-text");
    } else {
        selectionTextElement.innerHTML = `<pre style="display: inline;">${failedOn}</pre> not found. Selected directory "${selectedDir.name}" does not contain valid GTFS data. \u274c`;
        selectionTextElement.setAttribute("class", "fail-text");
    }
}
