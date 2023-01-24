import {
    generateLinkerValuesFromCookies,
    getLinkerValuesFromUrl,
    decorateAnchorTagWithLinker,
    decorateFormTagWithLinker,
    decorateURLWithLinker,
    getFingerPrint
} from "./utils.js";

/**
 * @function getLinker
 * @param {string[]|object} cookiesNamesList - an array with the cookies names to be passed on the linker, or an object with the cookies names and values
 * @param {string} gaCookiesPrefix - prefix for the Google Analytics cookies
 * @returns {string} - the linker parameter. Example: 1*dm649n*_ga*MTM2MDM4NDg1MS4xNjYxODIxMjQy*_ga_THYNGSTER*XXXXXXXXXXXXXXX*_gcl_aw*AAAAAAAAAAAA*_gcl_dc*BBBBBBBBBBB*_gcl_gb*CCCCCCCCCCCC*_gcl_gf*DDDDDDDDDDD*_gcl_ha*EEEEEEEEEEEE*_fplc*MTExMTExMTExMTExMTExMTExMTEx
 */
export function getLinker({ cookiesNamesList, gaCookiesPrefix } = {}) {
    const linkerCookiesValues = generateLinkerValuesFromCookies({
        cookiesNamesList,
        gaCookiesPrefix
    });

    return ["1", getFingerPrint(linkerCookiesValues), linkerCookiesValues.join("*")].join("*");
}

/**
 * @function readLinker
 * @param {string} linkerQueryParameterName - the parameter name of the linker in the URL
 * @param {boolean} checkFingerPrint - if the function should check for the fingerprint validation before returning the cookies
 * @returns {object|undefined} - an object with the cookies values, or undefined if the linker parameter is not found or the fingerprint check failed
 */
export function readLinker({ linkerQueryParameterName, checkFingerPrint } = {}) {
    return getLinkerValuesFromUrl({
        linkerQueryParameterName,
        checkFingerPrint
    });
}

/**
 * @function decorateWithLinker
 * @param {string} linkerQueryParameterName - the parameter name of the linker in the URL
 * @param {string[]|object} cookiesNamesList - an array with the cookies names to be passed on the linker, or an object with the cookies names and values
 * @param {string} gaCookiesPrefix - prefix for the Google Analytics cookies
 * @param {HTMLAnchorElement|HTMLFormElement|string} entity - the entity (<a>, <form> or an URL) to be decorated
 * @param {boolean} useFragment - whether to place the linker parameter in the fragment part of the URL or in the query string
 * @returns {HTMLAnchorElement|HTMLFormElement|string} - the entity (<a>, <form> or an URL) decorated with the linker parameter
*/
export function decorateWithLinker({
    linkerQueryParameterName,
    cookiesNamesList,
    gaCookiesPrefix,
    entity,
    useFragment
} = {}) {
    const linkerParameter = getLinker({
        cookiesNamesList,
        gaCookiesPrefix
    });

    if (entity.tagName) {
        if ("A" === entity.tagName) {
            return decorateAnchorTagWithLinker(
                linkerQueryParameterName,
                linkerParameter,
                entity,
                useFragment
            );
        }
        if ("FORM" === entity.tagName) {
            return decorateFormTagWithLinker(linkerQueryParameterName, linkerParameter, entity);
        }
    }

    if ("string" === typeof entity) {
        return decorateURLWithLinker(
            linkerQueryParameterName,
            linkerParameter,
            entity,
            useFragment
        );
    }
}
