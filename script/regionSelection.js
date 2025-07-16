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
