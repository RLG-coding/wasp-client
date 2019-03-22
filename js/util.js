"use strict";

/**
 * Translates a string Map into a new Object.
 * @param {Map} strMap string Map to translate
 * @return {Object} Object containing the same data as the original Map
 */
function strMapToObj(strMap) {
    const obj = Object.create(null);
    for (const [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }

    return obj;
}

/**
 * Translates an Object into a new string Map.
 * @param {Object} obj Object to translate
 * @return {Map} Map containing the same data as the original Object
 */
function objToStrMap(obj) {
    const strMap = new Map();
    for (const k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }

    return strMap;
}

/**
 * Stringifies a string Map into a new JSON Object.
 * @param {Map} strMap Map to stringify
 * @return {JSON} JSON Object containing the same data as the original Object
 */
function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap));
}

/**
 * Parses a JSON Object into a new string Map.
 * @param {JSON} jsonStr JSON Object to parse
 * @return {Map} Map containing the same data as the original Object
 */
function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
}


/**
 * Displays the given message inside a notification banner on the web page.
 * @param {string} message message to display
 * @param {string} color color of the banner ("red" or "blue" only)
 * @returns {void}
 */
function showNotification(message, color = "red") {
    const banner = $("#notification");
    banner.text(message);
    banner.addClass(color);
    banner.slideDown(500);

    const intervalSlideUp = setInterval(() => {
        banner.slideUp(500);
        clearInterval(intervalSlideUp);
    }, 5000);
    const intervalNoColor = setInterval(() => {
        banner.removeClass(color);
        clearInterval(intervalNoColor);
    }, 5500);
}
