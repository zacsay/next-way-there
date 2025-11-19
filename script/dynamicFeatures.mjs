import { validateRequiredFileExistence } from "./customRegion.mjs";
import { preprocessors } from "./preprocessors.mjs";

// showDirectoryPicker -> input type="file" webkitdirectory
if (!("showDirectoryPicker" in window)) {
    // Extracted GTFS feeds
    const standardButton = document.getElementById("custom-region-select-extracted-button");
    const buttonText = standardButton.innerText;

    const alternativeButton = document.createElement("input");
    alternativeButton.setAttribute("type", "file");
    alternativeButton.setAttribute("webkitdirectory", "true");

    const alternativeButtonLabel = document.createElement("label");
    alternativeButtonLabel.innerText = `${buttonText}: `;

    alternativeButtonLabel.appendChild(alternativeButton);
    standardButton.replaceWith(alternativeButtonLabel);

    alternativeButton.addEventListener("change", validateRequiredFileExistence);
}

// showOpenFilePicker -> input type="file"
if (!("showOpenFilePicker" in window)) {
    // Zipped GTFS feeds
    const standardButton = document.getElementById("custom-region-select-zipped-button");
    const buttonText = standardButton.innerText;

    const alternativeButton = document.createElement("input");
    alternativeButton.setAttribute("type", "file");
    alternativeButton.setAttribute("accept", "application/zip");

    const alternativeButtonLabel = document.createElement("label");
    alternativeButtonLabel.innerText = `${buttonText}: `;

    alternativeButtonLabel.appendChild(alternativeButton);
    standardButton.replaceWith(alternativeButtonLabel);

    alternativeButton.addEventListener("change", (e) => {
        const zipFile = e.target.files[0];

        preprocessors[0](zipFile).then((handle) => validateRequiredFileExistence(handle, ` ${zipFile.name} `));
    });
}