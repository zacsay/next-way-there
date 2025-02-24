const knownRegions = ["victorian"];

function loadRegions(silent = false) {
    let complete = 0;

    function responseHandler(region, request) {
        complete++;
        if (request.status !== 200) { // TODO: handle network errors; stop success message from appearing when all downloads fail
            createNotice("major-notice", `Unable to retrieve region metadata for ${region} (${complete}/${knownRegions.length}). The server responded with: ${request.status}.`)
            console.error(request);
        } else {

            regionConfigurations[region] = JSON.parse(request.responseText);

        }
    }

    let regionConfigurations = {};

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
    if (!silent) {
        document.getElementById("downloading-updates").setAttribute("hidden", "");
        document.body.style.cursor = "auto";
        document.getElementById("updates-downloaded").removeAttribute("hidden");
    }
    document.getElementById("missing-all-data").setAttribute("hidden", "");
    document.getElementById("missing-some-data").setAttribute("hidden", "");
    return regionConfigurations;
}

function saveRegions() {
    localStorage.setItem("nwtRegionConfigurations", JSON.stringify(loadRegions()));
}

var regionConfigurations = JSON.parse(localStorage.getItem("nwtRegionConfigurations"));

if (!regionConfigurations) {
    document.getElementById("missing-all-data").removeAttribute("hidden");
} else if (Object.keys(regionConfigurations).length !== knownRegions.length) {
    document.getElementById("missing-some-data").removeAttribute("hidden");
}
