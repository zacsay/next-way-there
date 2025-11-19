import { saveToIndexedDB } from "./gtfs.mjs";
import { OPFSCleanUp, preprocessors } from "./preprocessors.mjs";

const gtfsRequired = [
    "agency.txt",
    "routes.txt",
    "trips.txt",
    "stop_times.txt"
];

export async function validateRequiredFileExistence(selectedDir, dirDisplayNameOverride = null) {
    let failedOn = null;

    if (selectedDir instanceof Event) { // i.e. click
        selectedDir = selectedDir.target.files;

        const fileNames = [];

        for (const file of selectedDir) {
            fileNames.push(file.name);
        }

        for (const file of gtfsRequired) {
            if (fileNames.indexOf(file) === -1) {
                failedOn = file;
                break;
            }
        }
    } else if (selectedDir instanceof FileSystemDirectoryHandle) {
        console.log(selectedDir.name);
        for (const file of gtfsRequired) {
            try {
                await selectedDir.getFileHandle(file);
            } catch (e) {
                console.error(e);
                failedOn = file;
                break;
            }
        }
    } else {
        throw new TypeError("The parameter to validateRequiredFileExistence must be a click event on the input element or a directory handle.");
    }

    const dirDisplayName = dirDisplayNameOverride ?? (selectedDir.name ? ` "${selectedDir.name}" ` : " ");
    const selectionTextElement = document.getElementById("custom-region-selection");

    if (failedOn === null) {
        selectionTextElement.innerText = `Selected directory${dirDisplayName}probably contains valid GTFS data. \u2705 `;
        selectionTextElement.setAttribute("class", "success-text");

        const moveButton = document.createElement("button");
        moveButton.innerText = "Use it";
        moveButton.addEventListener("click", (_) => moveToIndexedDB(selectedDir));

        selectionTextElement.appendChild(moveButton);

        return true;
    } else {
        selectionTextElement.innerHTML = `<pre style="display: inline;">${failedOn}</pre> not found. Selected directory${dirDisplayName}does not contain valid GTFS data. \u274c`;
        selectionTextElement.setAttribute("class", "fail-text");

        return false;
    }
}

async function selectExtractedCustomRegion() {
    let selectedDir = await showDirectoryPicker({ id: "gtfs" });

    validateRequiredFileExistence(selectedDir);
}

async function selectZippedCustomRegion() {
    let selectedZip = await showOpenFilePicker({
        id: "gtfs",
        types: [
            {
                accept: {
                    "application/zip": [".zip"]
                }
            }
        ],
        excludeAcceptAllOption: true
    });
    console.log(selectedZip);

    // There are two ways that this could be done:
    // Check to see if the root of the archive passes file existence checks and then only prompt the user to go deeper if the validation fails (currently in use). More convenient for the user, but may carry a slight performance disadvantage for large zip files which are then processed twice UNLESS the state of the extracted root is maintained.
    // Ask the user straight away for permission to extract the archive recursively. Potentially annoying but means that the archive can be unzipped as necessary immediately.

    if (await validateRequiredFileExistence(await preprocessors[0](await selectedZip[0].getFile()), ` ${selectedZip[0].name} `)) {
        console.log("Valid!");
    } else {
        console.log("Not valid");
    }
}

function confirmIndexedDBCopy() {
    return !!confirm("The required data will be copied to the IndexedDB. None of the dataset which you are currently using will be modified, but it will be substantially duplicated elsewhere on your device, so large datasets may use a significant amount of your available storage space.\nIt will be safe to delete your copy of the data once the operation is complete, if you want to.\nIt may also take some time to copy and optimise, depending on your device and the size of the dataset.\nPlease confirm that you want the data copied.");
}

function moveToIndexedDB(selectedDir) {
    if (!confirmIndexedDBCopy()) {
        return;
    }
    if (selectedDir instanceof FileSystemDirectoryHandle) {
        moveDirectlyToIndexedDB(selectedDir);
    } else {
        moveToIndexedDBViaOPFS(selectedDir);
    }
}

function moveDirectlyToIndexedDB(selectedDir) {
    saveToIndexedDB(selectedDir, "custom");
}

async function moveToIndexedDBViaOPFS(selectedDir) {
    // Implementation via OPFS for browsers not supporting showDirectoryPicker
    const workingOPFSDirectory = await OPFSCleanUp();
    const uploadedFiles = selectedDir;

    for (const file of uploadedFiles) {
        const fileHandle = await workingOPFSDirectory.getFileHandle(file.name, { create: true });
        const fs = await fileHandle.createWritable();

        await fs.write(file);
        await fs.close();
    }

    saveToIndexedDB(workingOPFSDirectory, "custom");
}

document.getElementById("custom-region-select-extracted-button").addEventListener("click", selectExtractedCustomRegion);
document.getElementById("custom-region-select-zipped-button").addEventListener("click", selectZippedCustomRegion);
