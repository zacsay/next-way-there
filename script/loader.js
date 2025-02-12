const knownRegions = ["victoria"];

function loadRegions() {
    knownRegions.forEach(region => {
        const request = new XMLHttpRequest();
        request.open("GET", `https://github.com/zacsay/next-way-there/data/regions/${region}.json`, true);
        request.setRequestHeader("Accept", "application/json");
        request.send();
        if (request.status !== 200) {
            alert(`Unable to retrieve region metadata for ${region}. The server responded with: ${request.status} ${request.statusText}.`)
            console.error(request)
        }
    });
}

loadRegions();