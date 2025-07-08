// showDirectoryPicker -> input webkitdirectory
if (!("showDirectoryPicker" in window)) {
    const buttonLocation = document.getElementById("custom-region-select-button-container");
    const standardButton = buttonLocation.childNodes[0];
    const buttonText = standardButton.innerText;

    standardButton.remove();

    const alternativeButton = document.createElement("input");
    alternativeButton.setAttribute("type", "file");
    alternativeButton.setAttribute("webkitdirectory", "true");

    const alternativeButtonLabel = document.createElement("label");
    alternativeButtonLabel.innerText = `${buttonText}: `;

    alternativeButtonLabel.appendChild(alternativeButton);
    buttonLocation.appendChild(alternativeButtonLabel);

    alternativeButton.addEventListener("change", validateRequiredFileExistence);
}