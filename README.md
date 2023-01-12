# LOERPCV Playoffs Bracket Verifer

Shamelessly cribbed from Create React App and Radix UI examples.

This app allows an individual to prove that they made a set of picks without divulging what those picks were.
The current implementation encodes the picks and a randomly generated salt as JSON and returns the first 64 bits of the SHA-256 hash of the JSON.
The individual would send the hash prefix to the group before the games were played and store the JSON for later.
After the games were played, the individual would provider the JSON to the group.
If the provided JSON produces the same hash prefix, this proves that the JSON was created before the games were played.

The hash prefix is encoded in base 36, and matched case-insensitively, for convenience.
