const customRegionOptions = document.getElementById("custom-region-options");

function updateRegion() {
    const regionDropdown = document.getElementById("region-dropdown");
    const region = regionDropdown.value;

    console.log(`Changed to ${region} region.`);
    localStorage.setItem("nwtLastUsedRegion", region);

    if (region === "custom") {
        customRegionOptions.removeAttribute("hidden");
    } else {
        customRegionOptions.setAttribute("hidden", "");
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

updateCustomRegionUploadMode();
