# Region files
Region files contain the metadata for regions in JSON format.

- `friendlyName`: the name of the region, as displayed to the user
- `gtfsSource`: where updated GTFS files should be downloaded from. Ignored if updateFrequency is `-1`
- `updateFrequency`: how often (in days) the data should be updated. Never updates if set to `-1`
- `preprocessing`: preprocessing which needs to be done to the GTFS files (enum)
    - `0`: none, the feed is completely compliant
    - `1`: data is contained in subfolders which need to be unzipped
