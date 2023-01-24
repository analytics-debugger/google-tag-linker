import { getLinker, readLinker, decorateWithLinker } from "./actions.js";

/**
 * Main function to create and return the linker parameter for Google Tag cross-domain tracking.
 *
 * @function
 *
 * @param {string} action - The action for the function to execute. Available options: "get", "read", "decorate".
 * @param {string} settings.gaCookiesPrefix - the prefix to use when looking for _ga cookies. Default: "".
 * @param {string} settings.conversionLinkerCookiesPrefix - the prefix to use when looking for Conversion Linker (Google Ads, Campaign Manager) cookies. Default: "_gcl".
 * @param {string} settings.linkerQueryParameterName - the query parameter name to use as the linker parameter. Default: "_gl".
 * @param {boolean} settings.checkFingerPrint - enable or disable checking the fingerprint of the linker parameter. Default: false.
 * @param {string[]|object} settings.cookiesNamesList - list of cookies names to include in the linker parameter or an object containing the cookies names and values. Default: ["_ga", /^_ga_[A-Z,0-9]/, "FPLC", "_gcl_aw", "_gcl_dc", "_gcl_gb", _"gcl_gf", "_gcl_ha"].
 * @returns {HTMLAnchorElement|HTMLFormElement|string|undefined} Returns the linker parameter, the values read from the linker parameter, the entities decorated with the linker parameter or undefined.
 */
const googleTagLinker = function (action = "get", settings = {}) {
    // Check if we are on a browser
    if (typeof window === "undefined" || typeof window.document === "undefined") {
        throw "This should be only run on a browser";
    }

    const defaultSettings = {
        gaCookiesPrefix: settings.gaCookiesPrefix || "",
        conversionLinkerCookiesPrefix: settings.conversionLinkerCookiesPrefix || "_gcl",
        linkerQueryParameterName: settings.linkerQueryParameterName || "_gl",
        checkFingerPrint: !!settings.checkFingerPrint || false,
        useFragment: !!settings.useFragment || false
    };

    if (settings.cookiesNamesList) {
        defaultSettings.cookiesNamesList = settings.cookiesNamesList;
    } else {
        defaultSettings.cookiesNamesList = [
            // Main Google Analytics Cookie
            defaultSettings.gaCookiesPrefix + "_ga",

            // Google Analytics 4 Session Cookie (e.g. Data Stream ID is G-ABC123, the cookie will be <prefix>_ga_ABC123)
            new RegExp("^" + defaultSettings.gaCookiesPrefix + "_ga_[A-Z,0-9]"),

            // First Party Linker Cookie maps to sGTM
            "FPLC"
        ];

        // Google Ads (gclid, gclsrc maps to _aw, _dc, _gf, _ha cookies)
        // Campaign Manager (dclid, gclsrc maps to _aw, _dc, _gf, _ha cookies)
        // wbraid (wbraid maps to _gb cookie)
        ["_aw", "_dc", "_gb", "_gf", "_ha"].forEach((name) => {
            defaultSettings.cookiesNamesList.push(
                defaultSettings.conversionLinkerCookiesPrefix + name
            );
        });
    }

    switch (action) {
        case "get":
            return getLinker({
                cookiesNamesList: defaultSettings.cookiesNamesList,
                gaCookiesPrefix: defaultSettings.gaCookiesPrefix
            });
        case "read":
            return readLinker({
                linkerQueryParameterName: defaultSettings.linkerQueryParameterName,
                checkFingerPrint: defaultSettings.checkFingerPrint
            });
        case "decorate":
            return decorateWithLinker({
                linkerQueryParameterName: defaultSettings.linkerQueryParameterName,
                cookiesNamesList: defaultSettings.cookiesNamesList,
                entity: settings.entity,
                useFragment: defaultSettings.useFragment
            });
        default:
            break;
    }
};

googleTagLinker.prototype = {};
googleTagLinker.answer = 42;

export default googleTagLinker;
