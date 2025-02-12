const knownRegions = ["victoria"];

function loadRegions() {
    let regionConfigurations = {};
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
    return regionConfigurations;
}

function saveRegions() {
    localStorage.setItem("nwtRegionConfigurations", JSON.stringify(loadRegions()));
}

if (!localStorage.getItem("nwtRegionConfigurations")) {
    document.getElementById("missing-all-data").removeAttribute("hidden");
}