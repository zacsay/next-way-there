async function saveToIndexedDB(feedDir, regionName) {
    // Initialise the database connection
    const request = indexedDB.open(`nwtRegionDatabase-${regionName}`, 1);
    let db;

    request.onerror = () => {
        console.error(request.error);
    };
    request.onupgradeneeded = (event) => {
        db = event.target.result;

        db.createObjectStore("agencies", { keyPath: "agency_id" });
    };
    request.onsuccess = (event) => {
        db = event.target.result;
        db.onerror = (event) => {
            console.error(`Database error: ${event.target.error?.message}`);
        };
    };

    // Discover the required files used
    const possible = [
        "agency.txt",
        "stops.txt",
        "routes.txt",
        "trips.txt",
        "stop_times.txt",
        "calendar.txt",
        "calendar_dates.txt",
        "fare_attributes.txt",
        "fare_rules.txt",
        "timeframes.txt",
        "fare_media.txt",
        "fare_products.txt",
        "fare_leg_rules.txt",
        "fare_leg_join_rules.txt",
        "fare_transfer_rules.txt",
        "areas.txt",
        "stop_areas.txt",
        "networks.txt",
        "route_networks.txt",
        "shapes.txt",
        "frequencies.txt",
        "transfers.txt",
        "pathways.txt",
        "levels.txt",
        "location_groups.txt",
        "location_groups_stops.txt",
        "locations.geojson",
        "booking_rules.txt",
        "translations.txt",
        "feed_info.txt",
        "attributions.txt"
    ];
    let fileHandles = {};

    for (const file of possible) {
        let fileHandle;

        try {
            fileHandle = await feedDir.getFileHandle(file);
        } catch (NotFoundError) {
            continue;
        }

        fileHandles[file] = fileHandle;
    }
    console.log(fileHandles);

    // Verify that existence requirements are met
    if (fileHandles["agency.txt"] === undefined || fileHandles["routes.txt"] === undefined || fileHandles["trips.txt"] === undefined || fileHandles["stop_times.txt"] === undefined) {
        throw new Error("GTFS feed is completely invalid: missing agency.txt, routes.txt, trips.txt, and/or stop_times.txt");
    }
    if (fileHandles["calendar.txt"] === undefined && fileHandles["calendar_dates.txt"] === undefined) {
        throw new Error("GTFS feed is completely invalid: neither calendar.txt nor calendar_dates.txt exist");
    }
    if (fileHandles["translations.txt"] !== undefined && fileHandles["feed_info.txt"] === undefined) {
        throw new Error("GTFS feed is completely invalid: translations.txt exists, but feed_info.txt does not");
    }
    if (fileHandles["stops.txt"] === undefined && fileHandles["locations.geojson"] === undefined) {
        throw new Error("GTFS feed is completely invalid: neither stops.txt nor locations.geojson exist");
    } else
    if (fileHandles["stops.txt"] === undefined) {
        throw new Error("GTFS feed is valid but not supported: stops.txt does not exist")
    }

    console.log("Feed passed all validation checks")
}
