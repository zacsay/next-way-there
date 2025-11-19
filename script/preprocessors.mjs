export const preprocessors = [
    unzip,
    (feed) => unzip(feed, -1)
];

/**
 * Creates a directory within the OPFS for the application if it does not exist and empties it if it does.
 * @returns {Promise<FileSystemDirectoryHandle>} The application's OPFS directory.
 */
export async function OPFSCleanUp() {
    console.log("Cleaning up the OPFS...");
    // Ensure that there will not be conflicts with other applications on the same host
    const getOPFSDirectory = async () => await navigator.storage.getDirectory().then((dir) => dir.getDirectoryHandle("nwt", { create: true }));
    const OPFSDirectory = await getOPFSDirectory();

    // Ensure that old files are not going to interfere by emptying the application's directory
    if ("remove" in OPFSDirectory) {
        await OPFSDirectory.remove({ recursive: true });
    } else {
        const promises = [];
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
 * @returns {Promise<FileSystemDirectoryHandle>} Handle for the directory where the feed was unzipped to
 */
async function unzip(feed, maxDepth = 0, cwd = null, currentDepth = 0) {
    const workingOPFSDirectory = cwd ?? await OPFSCleanUp();
    const IOPromises = [];

    let zip = new JSZip();
    const data = await zip.loadAsync(feed);

    for (const [path, file] of Object.entries(data.files)) {
        const splitPath = path.split("/");
        let activeOPFSDirectory = workingOPFSDirectory;

        if (!file.dir) { // Don't waste time creating directory entries in advance; they can be created as they are needed
            for (const [i, subPath] of splitPath.entries()) {
                if (i < splitPath.length - 1) { // i.e. it is not the file name
                    activeOPFSDirectory = await activeOPFSDirectory.getDirectoryHandle(subPath, { create: true });
                } else if (subPath.endsWith(".txt")) { // Only .txt files need to be saved
                    const fileHandle = await activeOPFSDirectory.getFileHandle(subPath, { create: true });
                    const writable = await fileHandle.createWritable();
                    const fileContent = await file.internalStream("arraybuffer").accumulate();
                    writable.write(fileContent);
                    IOPromises.push(writable.close());
                } else if (subPath.endsWith(".zip") && (currentDepth < maxDepth || maxDepth === -1)) { // But we should still look in .zip files if the user wants us to
                    IOPromises.push(unzip(await file.internalStream("arraybuffer").accumulate(), maxDepth, activeOPFSDirectory, currentDepth++));
                }
            }
        }
    }

    await Promise.allSettled(IOPromises);
    return workingOPFSDirectory;
}
