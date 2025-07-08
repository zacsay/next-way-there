const gtfsRequired = [
    "agency.txt",
    "routes.txt",
    "trips.txt",
    "stop_times.txt"
];

async function validateRequiredFileExistence(selectedDir) {
    let failedOn = null;
    console.log(selectedDir);

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
        for (const file of gtfsRequired) {
            try {
                await selectedDir.getFileHandle(file);
            } catch (NotFoundError) {
                failedOn = file;
                break;
            }
        }
    } else {
        throw new TypeError("The parameter to validateRequiredFileExistence must be a click event on the input element or a directory handle.");
    }


    console.log(selectedDir.webkitRelativePath)
    const dirDisplayName = selectedDir.name ? ` "${selectedDir.name}" ` : " ";
    const selectionTextElement = document.getElementById("custom-region-selection");

    if (failedOn === null) {
        selectionTextElement.innerText = `Selected directory${dirDisplayName}probably contains valid GTFS data. \u2705 `;
        selectionTextElement.setAttribute("class", "success-text");

        const moveButton = document.createElement("button");
        moveButton.innerText = "Use it";
        moveButton.addEventListener("click", (_) => moveToIndexedDB(selectedDir));

        selectionTextElement.appendChild(moveButton);
    } else {
        selectionTextElement.innerHTML = `<pre style="display: inline;">${failedOn}</pre> not found. Selected directory${dirDisplayName}does not contain valid GTFS data. \u274c`;
        selectionTextElement.setAttribute("class", "fail-text");
    }
}

async function selectCustomRegion() {
    let selectedDir = await showDirectoryPicker();

    validateRequiredFileExistence(selectedDir);
}

function confirmIndexedDBCopy() {
    return !!confirm("The required data will be copied to the IndexedDB. None of the dataset which you are currently using will be modified, but it will be substantially duplicated elsewhere on your device, so large datasets may use a significant amount of your available storage space.\nIt will be safe to delete your copy of the data once the operation is complete, if you want to.\nIt may also take some time to copy and optimise, depending on your device and the size of the dataset.\nPlease confirm that you want the data copied.");
}

function moveToIndexedDB(selectedDir) {
    if (!confirmIndexedDBCopy) {
        return;
    }
    if ("showDirectoryPicker" in window) {
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
    const OPFSDirectory = await navigator.storage.getDirectory();
    let workingOPFSDirectory;

    // Ensure that old files are not going to interfere, e.g. if an optional file only exists in the previous feed, in a cross-platform way (preferably by deleting them)
    if ("remove" in FileSystemFileHandle) {
        for await (const fileHandle of OPFSDirectory.values()) {
            if (fileHandle instanceof FileSystemFileHandle) {
                await fileHandle.remove();
            }
        }
        workingOPFSDirectory = OPFSDirectory;
    } else {
        workingOPFSDirectory = await OPFSDirectory.getDirectoryHandle(Array(OPFSDirectory.values()).length, { create: true }); // Number new directories sequentially
    }

    const uploadedFiles = selectedDir;

    for (const file of uploadedFiles) {
        console.log(workingOPFSDirectory)
        const fileHandle = await workingOPFSDirectory.getFileHandle(file.name, { create: true });
        const fs = await fileHandle.createWritable();

        await fs.write(file);
        await fs.close();
    }

    saveToIndexedDB(workingOPFSDirectory, "custom");
}
