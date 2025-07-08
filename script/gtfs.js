async function saveToIndexedDB(feedDir, regionName) {
    // Initialise the database connection
    const request = indexedDB.open(`nwtRegionDatabase-${regionName}`, 1);
    // Map object stores to corresponding GTFS files
    const OSToGTFS = {
        "agencies": "agency.txt",
        "stops": "stops.txt",
        "routes": "routes.txt",
        "trips": "trips.txt",
        "stop_times": "stop_times.txt",
        "calendar": "calendar.txt",
        "calendar_dates": "calendar_dates.txt"
    };
    let db;

    request.onerror = () => {
        console.error(request.error);
    };
    request.onupgradeneeded = (event) => {
        db = event.target.result;

        const agencyOS = db.createObjectStore("agencies", { keyPath: "agency_id" });
        const stopsOS = db.createObjectStore("stops", { keyPath: "stop_id" });
        const routesOS = db.createObjectStore("routes", { keyPath: "route_id" });
        const tripsOS = db.createObjectStore("trips", { keyPath: "trip_id" });
        const stopTimesOS = db.createObjectStore("stop_times", { keyPath: ["trip_id", "stop_sequence"] });
        const calendarOS = db.createObjectStore("calendar", { keyPath: "service_id" });
        const calendarDatesOS = db.createObjectStore("calendar_dates", { keyPath: ["service_id", "date"] });

        // Define indices for searching the database
        stopsOS.createIndex("stop_code", "stop_code");
        stopsOS.createIndex("stop_name", "stop_name");
        stopsOS.createIndex("parent_station", "parent_station");

        routesOS.createIndex("agency_id", "agency_id");
        routesOS.createIndex("route_short_name", "route_short_name");
        routesOS.createIndex("route_long_name", "route_long_name");
        routesOS.createIndex("route_type", "route_type");

        tripsOS.createIndex("route_id", "route_id");
        tripsOS.createIndex("service_id", "service_id");
        tripsOS.createIndex("direction_id", "direction_id");

        stopTimesOS.createIndex("arrival_time", "arrival_time");
        stopTimesOS.createIndex("departure_time", "departure_time");
        stopTimesOS.createIndex("stop_id", "stop_id");
        stopTimesOS.createIndex("pickup_type", "pickup_type");
        stopTimesOS.createIndex("drop_off_type", "drop_off_type");

        calendarOS.createIndex("monday", "monday");
        calendarOS.createIndex("tuesday", "tuesday");
        calendarOS.createIndex("wednesday", "wednesday");
        calendarOS.createIndex("thursday", "thursday");
        calendarOS.createIndex("friday", "friday");
        calendarOS.createIndex("saturday", "saturday");
        calendarOS.createIndex("sunday", "sunday");

        calendarDatesOS.createIndex("date", "date");
    };

    request.onsuccess = async (event) => {
        db = event.target.result;

        db.onerror = (event) => { // Catch-all error handler
            throw new Error(`Database error: ${event.target.error?.message}`);
        };

        const fileHandles = await getGTFSFileHandles();

        for (const [store, fileName] of Object.entries(OSToGTFS)) {
            const file = await fileHandles[fileName].getFile().then();

            Papa.parse(file, {
                header: true, skipEmptyLines: true, complete: (parsed) => {
                    console.log(store)
                    const transaction = db.transaction([store], "readwrite");
                    const objectStore = transaction.objectStore(store);

                    for (const obj of parsed.data) {
                        objectStore.add(obj);
                    }
                }
            });
        }
    };

    request.onerror = (event) => {
        throw new Error(`Database connection error: ${request.error}`);
    };

    async function getGTFSFileHandles() {
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
        } else if (fileHandles["stops.txt"] === undefined) {
            throw new Error("GTFS feed is valid but not supported: stops.txt does not exist");
        }

        console.log("Feed passed all validation checks");
        return fileHandles;
    }
}