/**
 * Creates a function that exports the 'createUuid' function that utilises 'URL.createObjectURL(...)' to construct and
 * return UUIDs.
 *
 * This implementation may be very slow and is NOT intended for performant applications.
 *
 * @returns {string} the generated UUID
 */
function createUuid() {
    const url = URL.createObjectURL(new Blob());
    try {
        return url.toString().split(":").reverse()[0];
    } finally {
        URL.revokeObjectURL(url);
    }
}

export {
    createUuid
};
