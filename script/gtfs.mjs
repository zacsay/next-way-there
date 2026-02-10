/** Class for whole GTFS feeds */
class Feed {
    /** @type {Record<string, Agency>} */
    agencies;
    /** @type {Record<string, Stop>} */
    stops;
    /** @type {Record<string, Route>} */
    routes;
    /** @type {Record<string, Trip>} */
    trips;
    /** @type {StopTime[]} */
    stopTimes;
    /** @type {Record<string, Calendar>} */
    calendars;
    /** @type {CalendarDate[]} */
    calendarDates;
}

/** Class for GTFS agencies */
class Agency {
    /** @type {string} */
    name;
    /** @type {URL} */
    url;
    /** @type {string} */
    timezone;
}

/** Class for GTFS stops */
class Stop {
    /** @type {string | null} */
    code;
    /** @type {string | null} */
    name;
    /** @type {string | null} */
    ttsName;
    /** @type {number} */
    latitude;
    /** @type {number} */
    longitude;
    /** @type {string | null} */
    zone;
    /** @type {URL | null} */
    url;
    /** @type {LocationType} */
    locationType = LocationType.PLATFORM;
    /** @type {Stop | null} */
    parentStation;
    /** @type {WheelchairBoarding} */
    wheelchairBoarding = WheelchairBoarding.NO_INFORMATION;
    /** @type {string | null} */
    platformCode;
}

/**
 * Location types for stops
 * @enum {number}
 * @readonly
 */
const LocationType = {
    PLATFORM: 0,
    STATION: 1,
    ENTRANCE_EXIT: 2,
    GENERIC_NODE: 3,
    BOARDING_AREA: 4
};

/**
 * Wheelchair accessibility information for stops
 * @enum {number}
 * @readonly
 */
const WheelchairBoarding = {
    NO_INFORMATION: 0,
    WHEELCHAIR_ACCESSIBLE: 1,
    NOT_WHEELCHAIR_ACCESSIBLE: 2
};

/** Class for GTFS routes */
class Route {
    /** @type {Agency} */
    agency;
    /** @type {string | null} */
    shortName;
    /** @type {string | null} */
    longName;
    /** @type {RouteType} */
    type;
    /** @type {URL | null} */
    url;
    /** @type {string} */
    color = "#ffffff";
    /** @type {string} */
    textColor = "#000000";
    /** @type {number | null} */
    sortOrder;
}

/**
 * Route type information
 * @enum {number}
 * @readonly
 */
const RouteType = {
    TRAM: 0,
    SUBWAY: 1,
    RAIL: 2,
    BUS: 3,
    FERRY: 4,
    CABLE_TRAM: 5,
    AERIAL: 6,
    FUNICULAR: 7,
    TROLLEYBUS: 11,
    MONORAIL: 12
};

/** Class for GTFS trips */
class Trip {
    /** @type {Route} */
    route;
    /** @type {Calendar | CalendarDate} */
    service;
    /** @type {string | null} */
    headsign;
    /** @type {string | null} */
    shortName;
    /** @type {Direction | null} */
    direction;
    /** @type {string | null} */
    block;
    /** @type {WheelchairAccessible} */
    wheelchairAccessible = WheelchairAccessible.NO_INFORMATION;
    /** @type {BikesAllowed} */
    bikesAllowed = BikesAllowed.NO_INFORMATION;
}

/** 
 * Trip direction information.
 * 
 * Note: outbound and inbound chosen based on the examples in the GTFS documentation.
 * There is no obligation on feed producers to honour these directions, 
 * and thus they cannot be relied on as being correct in this sense.
 * @enum {number}
 * @readonly
 */
const Direction = {
    OUTBOUND: 0,
    INBOUND: 1
};

/**
 * Wheelchair accessibility information for trips
 * @enum {number}
 * @readonly
 */
const WheelchairAccessible = {
    NO_INFORMATION: 0,
    WHEELCHAIR_ACCESSIBLE: 1,
    NOT_WHEELCHAIR_ACCESSIBLE: 2
};

/**
 * Bike permissibility information for trips
 * @enum {number}
 * @readonly
 */
const BikesAllowed = {
    NO_INFORMATION: 0,
    BIKES_ALLOWED: 1,
    NO_BIKES_ALLOWED: 2
};

/** Class for GTFS stop times */
class StopTime {
    /** @type {Trip} */
    trip;
    /** @type {Time | null} */
    arrivalTime;
    /** @type {Time | null} */
    departureTime;
    /** @type {Stop} */
    stop;
    /** @type {number} */
    sequence;
    /** @type {string | null} */
    headsign;
    /** @type {PickUpDropOffType} */
    pickUpType = PickUpDropOffType.REGULAR;
    /** @type {PickUpDropOffType} */
    dropOffType = PickUpDropOffType.REGULAR;
    /** @type {boolean} */
    timepoint = true;
}

/** Class for times which do not depend on dates */
class Time {
    /**
     * Takes a time encompassing a relative date, as used in GTFS, 
     * and creates a more conventional time.
     * The relative date is stored in the `dateAdjustment` property.
     * All numbers will be truncated if they are non-integral.
     * @param {number} hour Must be greater than or equal to 0
     * @param {number} minute Must be in range [0, 60)
     * @param {number} second Must be in range [0, 60)
     */
    constructor(hour, minute, second) {
        if (hour < 0 || minute < 0 || second < 0 || hour === Infinity || minute >= 60 || second >= 60) {
            throw new Error(`Can't convert *${hour}:${minute}:${second} to a Time object`);
        }
        this.hour = Math.trunc(hour) % 24;
        this.minute = Math.trunc(minute);
        this.second = Math.trunc(second);
        this.dateAdjustment = Math.trunc(hour / 24);
    }
}

/** 
 * Pick up or drop off type information for stop times
 * @enum {number}
 * @readonly
 */
const PickUpDropOffType = {
    REGULAR: 0,
    NONE: 1,
    PHONE_AGENCY: 2,
    COORDINATE_WITH_DRIVER: 3
};

class Calendar {
    /** @type {boolean} */
    monday;
    /** @type {boolean} */
    tuesday;
    /** @type {boolean} */
    wednesday;
    /** @type {boolean} */
    thursday;
    /** @type {boolean} */
    friday;
    /** @type {boolean} */
    saturday;
    /** @type {boolean} */
    sunday;
    /** @type {Date} */
    startDate;
    /** @type {Date} */
    endDate;
}

class CalendarDate {
    /** @type {Calendar | string} */
    service;
    /** @type {Date} */
    date;
    /** @type {ExceptionType} */
    exceptionType;
}

/**
 * Exception types for calendar dates
 * @enum {number}
 * @readonly
 */
const ExceptionType = {
    SERVICE_ADDED: 1,
    SERVICE_REMOVED: 2
};

/**
 * Saves the data in the directory to the IndexedDB
 * @param {FileSystemDirectoryHandle} feedDir The directory containing the data to save
 * @param {string} regionName The name to use for the region to enable multiple to be used without rebuilding the database every time
 * @returns {Promise} Resolves when the database operations are complete.
 */
export async function saveToIndexedDB(feedDir, regionName) {
    return new Promise((resolve, reject) => {
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

        request.onerror = (_) => {
            reject(`Error while opening database: ${request.error.message}`);
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
                reject(`Database error: ${event.target.error?.message}`);
            };

            const fileHandles = await getGTFSFileHandles();

            const transactionCount = Object.keys(OSToGTFS).length;
            let completedTransactionCount = 0;
            let allTransactionsSent = false;

            for (const [store, fileName] of Object.entries(OSToGTFS)) {
                const file = await fileHandles[fileName].getFile();

                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    worker: true,
                    error: (err, f) => { reject(err); },
                    complete: (parsed) => {
                        const transaction = db.transaction([store], "readwrite");
                        const objectStore = transaction.objectStore(store);

                        objectStore.clear();

                        for (const obj of parsed.data) {
                            objectStore.add(obj);
                        }

                        transaction.oncomplete = (event) => {
                            completedTransactionCount++;
                            console.log(`Completed ${completedTransactionCount} transactions (${event.target.objectStoreNames[0]})`);

                            if ((transactionCount == completedTransactionCount) && allTransactionsSent) {
                                console.log("IndexedDB filled");
                                resolve();
                            }
                        };
                        transaction.onabort = (_) => {
                            reject(`Transaction aborted`);
                        };
                        transaction.onerror = (_) => {
                            reject(`Database error in transaction: ${event.target.error?.message}`);
                        };
                    },
                });
            }

            allTransactionsSent = true;
        };
    });

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
            } catch (error) {
                if (error.name === "NotFoundError") {
                    continue;
                }
            }

            fileHandles[file] = fileHandle;
        }

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
