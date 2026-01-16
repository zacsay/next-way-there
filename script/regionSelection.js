const customRegionOptions = document.getElementById("custom-region-options");
const customRegionDropdown = document.getElementById("existing-custom-region-select");

function updateRegionUI() {
    const regionDropdown = document.getElementById("region-dropdown");
    const region = regionDropdown.value;

    const regionNameTextSpan = document.getElementById("selected-region-name");
    const customRegion = customRegionDropdown.value || localStorage.getItem("nwtLastUsedCustomRegion");

    localStorage.setItem("nwtLastUsedRegion", region);

    if (region === "custom") {
        customRegionOptions.removeAttribute("hidden");
        regionNameTextSpan.innerHTML = "Custom &mdash; ";
        regionNameTextSpan.innerText += customRegion.slice(25) || "Not selected";
        if (customRegion) {
            localStorage.setItem("nwtLastUsedCustomRegion", customRegion);
        }
    } else {
        customRegionOptions.setAttribute("hidden", "");
        regionNameTextSpan.innerText = region;
    }
}

function updateCustomRegionUploadMode() {
    const useExistingRadio = document.getElementById("use-existing-custom-region-radio");
    const createNewRadio = document.getElementById("create-new-custom-region-radio");

    const useExistingOptionsDiv = document.getElementById("use-existing-custom-region-options");
    const createNewOptionsDiv = document.getElementById("create-new-custom-region-options");

    if (useExistingRadio.checked) {
        useExistingOptionsDiv.removeAttribute("disabled");
        createNewOptionsDiv.setAttribute("disabled", "");
        showHideCustomRegionUpload();
    }

    if (createNewRadio.checked) {
        createNewOptionsDiv.removeAttribute("disabled");
        useExistingOptionsDiv.setAttribute("disabled", "");
        showHideCustomRegionUpload(true);
    }
}

function showHideCustomRegionUpload(forceShow = false) {
    const readOnlyRadio = document.getElementById("existing-custom-region-read-only");
    const hideableContainer = document.getElementById("custom-region-select-button-container");

    if (forceShow || !readOnlyRadio.checked) {
        hideableContainer.removeAttribute("hidden");
    } else {
        hideableContainer.setAttribute("hidden", "");
    }
}

function showHideRegionOptions() {
    const regionOptionsDiv = document.getElementById("region-options");
    const toggleRegionOptionsButton = document.getElementById("toggle-region-options-button");

    if (regionOptionsDiv.getAttribute("hidden") === null) {
        regionOptionsDiv.setAttribute("hidden", "");
        toggleRegionOptionsButton.innerText = "Show region options";
    } else {
        regionOptionsDiv.removeAttribute("hidden");
        toggleRegionOptionsButton.innerText = "Hide region options";
    }
}

updateCustomRegionUploadMode();
