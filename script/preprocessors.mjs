export const preprocessors = [
    unzip,
    (feed) => unzip(feed, -1)
];

export async function OPFSCleanUp() {
    console.log("Cleaning up the OPFS...");
    // Ensure that there will not be conflicts with other applications on the same host
    const getOPFSDirectory = async () => await navigator.storage.getDirectory().then((dir) => dir.getDirectoryHandle("nwt", { create: true }));
    const OPFSDirectory = await getOPFSDirectory();

    // Ensure that old files are not going to interfere by emptying the application's directory
    if ("remove" in OPFSDirectory) {
        await OPFSDirectory.remove({ recursive: true });
    } else {
        let promises = [];
        for await (const entryName of OPFSDirectory.keys()) {
            promises.push(OPFSDirectory.removeEntry(entryName, { recursive: true }));
        }
        await Promise.allSettled(promises);
    }

    return getOPFSDirectory();
}

/**
 * Unzips GTFS feeds
 * @param {Blob} feed The zipped GTFS feed
 * @param {number} maxDepth The depth to recursively unzip. Should be an integer. `-1` allows an infinite depth (until the call stack size is reached). `0` or not specified disables recursive unzipping.
 * @param {(null|FileSystemDirectoryHandle)} cwd Used internally to pass the current working directory during recursion, but could also be used to specify a different working directory.
 * @param {number} currentDepth Used internally to pass the current recursion depth.
 */
async function unzip(feed, maxDepth = 0, cwd = null, currentDepth = 0) {
    const workingOPFSDirectory = cwd ?? await OPFSCleanUp();

    let zip = new JSZip();
    zip.loadAsync(feed).then(data => {
        data.forEach(async (path, file) => {
            const splitPath = path.split("/");
            let activeOPFSDirectory = workingOPFSDirectory;

            if (!file.dir) { // We don't need to waste time on directory entries before we get to files; we can create directories as we go
                for (const [i, subPath] of splitPath.entries()) {
                    if (i < splitPath.length - 1) { // i.e. it is not the file name
                        activeOPFSDirectory = await activeOPFSDirectory.getDirectoryHandle(subPath, { create: true });
                    } else {
                        const writable = await activeOPFSDirectory.getFileHandle(subPath, { create: true }).then((handle) => handle.createWritable());
                        await writable.write(await file.internalStream("arraybuffer").accumulate()).then(async () => await writable.close());
                        if (subPath.endsWith(".zip") && (currentDepth < maxDepth || maxDepth === -1)) {
                            unzip(activeOPFSDirectory.getFileHandle(subPath).then(async (handle) => await handle.getFile()), maxDepth, activeOPFSDirectory, currentDepth);
                        }
                    }
                }
            }
        });
    });
}
