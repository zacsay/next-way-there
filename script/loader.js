const knownRegions = ["victoria"];

function loadRegions(silent = false) {
    let regionConfigurations = {};
    if (!silent) {
        document.getElementById("downloading-updates").removeAttribute("hidden");
        document.body.style.cursor = "wait";
    }
    knownRegions.forEach(region => {
        const request = new XMLHttpRequest();
        request.open("GET", `https://zacsay.github.io/next-way-there/data/regions/${region}.json`, false);
        request.setRequestHeader("Accept", "application/json");
        request.send();
        if (request.status !== 200) {
            alert(`Unable to retrieve region metadata for ${region}. The server responded with: ${request.status} ${request.statusText}.`);
            console.error(request);
        } else {
            regionConfigurations[region] = JSON.parse(request.responseText);
        }
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
