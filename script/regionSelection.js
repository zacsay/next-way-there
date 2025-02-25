function updateRegion() {
    const regionDropdown = document.getElementById("region-dropdown");
    const region = regionDropdown.value;
    console.log(`Changed to ${region} region.`);
    localStorage.setItem("nwtLastUsedRegion", region);
}