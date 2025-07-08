const knownRegions = ["victoria"];

var regionConfigurations = JSON.parse(localStorage.getItem("nwtRegionConfigurations"));

function loadRegions(silent = false, save = true) {
    let complete = 0;
    let success = false;
    let regionConfigurations = {};

    function responseHandler(region, request) {
        complete++;
        if (request.status !== 200) { // TODO: handle network errors
            createNotice("major-notice", `Unable to retrieve region metadata for ${region} (${complete}/${knownRegions.length}). The server responded with: ${request.status}.`);
            console.error(request);
        } else {
            success = true;
            regionConfigurations[region] = JSON.parse(request.responseText);
        }
        if (!silent && complete === knownRegions.length) {
            document.getElementById("downloading-updates").setAttribute("hidden", "");
            document.body.style.cursor = "auto";
            if (success) {
                document.getElementById("updates-downloaded").removeAttribute("hidden");
            }
        }
        if (save && complete === knownRegions.length) {
            localStorage.setItem("nwtRegionConfigurations", JSON.stringify(regionConfigurations));
            updateRegionDropdown();
        }
    }

    if (!silent) {
        document.getElementById("downloading-updates").removeAttribute("hidden");
        document.body.style.cursor = "wait";
    }

    knownRegions.forEach(region => {
        const request = new XMLHttpRequest();
        request.addEventListener("load", () => responseHandler(region, request));
        request.open("GET", `https://zacsay.github.io/next-way-there/data/regions/${region}.json`);
        request.setRequestHeader("Accept", "application/json");
        request.send();
    });
    document.getElementById("missing-all-data").setAttribute("hidden", "");
    document.getElementById("missing-some-data").setAttribute("hidden", "");
}

function updateRegionDropdown() {
    const regionDropdown = document.getElementById("region-dropdown");
    const lastUsedRegion = localStorage.getItem("nwtLastUsedRegion");
    try {
        for (const [regionName, region] of Object.entries(regionConfigurations)) {
            const newOption = document.createElement("option");
            const newOptionText = document.createTextNode(region.friendlyName);
            newOption.setAttribute("value", regionName);
            newOption.appendChild(newOptionText);
            if (lastUsedRegion === regionName) {
                newOption.setAttribute("selected", "");
            }
            regionDropdown.appendChild(newOption);
        }
    } catch (error) {
        if (error instanceof TypeError) {
            // Known to be thrown when no region configurations available
        } else {
            throw new Error(error);
        }
    }
    if (lastUsedRegion === "custom") {
        document.getElementById("custom-region-option").setAttribute("selected", "");
    }
    updateRegion();
}

if (!regionConfigurations) {
    document.getElementById("missing-all-data").removeAttribute("hidden");
} else if (Object.keys(regionConfigurations).length !== knownRegions.length) {
    document.getElementById("missing-some-data").removeAttribute("hidden");
}

updateRegionDropdown();
