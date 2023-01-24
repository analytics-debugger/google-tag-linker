const urlChecker = /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;

/**
 * @function getCookieNameAndValue
 * @param {string} cookieName - The name of the cookie to search for
 * @return {string[]} - An array containing the name of the cookie, and its value.
 * @description - The function searches for the cookie with the name passed as parameter and returns an array with the name of the cookie and its value.  If the cookie is not found, an empty array is returned
 */
function getCookieNameAndValue(cookieName) {
    const cookiesNamesAndValues = ("; " + document.cookie).split("; ");
    for (let i = cookiesNamesAndValues.length - 1; i >= 0; i--) {
        const cookieNameAndValue = cookiesNamesAndValues[i].split("=");
        const cookieFound =
            cookieName instanceof RegExp
                ? cookieName.test(cookieNameAndValue[0])
                : cookieName === cookieNameAndValue[0];
        if (cookieFound) return [cookieNameAndValue[0], cookieNameAndValue[1]];
    }
    return [];
}

/**
 * @function transformCookieNameAndValueToLinkerFormat
 * @param {string} cookieName - The name of the cookie
 * @param {string} cookieValue - The value of the cookie
 * @return {string} - The cookie name and value transformed to linker format
 * @description - This function transforms the cookie name and value passed as parameter to the linker format. Example: _ga*MTM2MDM4NDg1MS4xNjYxODIxMjQy
 */
function transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue) {
    return [cookieName, window.btoa(cookieValue).replace(/=/g, ".")].join("*");
}

/**
 * @function untransformCookieValueFromLinkerFormat
 * @param {string} cookieValue - The value of the cookie in linker format
 * @return {string} - The cookie value in its original format
 * @description - This function takes the value of a cookie in linker format and returns the value in its original format. Example: MTM2MDM4NDg1MS4xNjYxODIxMjQy -> 1360384851.1661821242
 */
function untransformCookieValueFromLinkerFormat(cookieValue) {
    return window.atob(cookieValue.replace(/\./g, "="));
}

/**
 * @function getQueryParameterValue
 * @param {string} parameterName - the name of the query parameter you want to get the value of
 * @returns {string|null} - the value of the query parameter or null if it's not present
 */
function getQueryParameterValue(parameterName) {
    const url = window.location.href;
    const reg = new RegExp("[?&]" + parameterName + "=([^&#]*)", "i");
    const result = reg.exec(url);
    return result === null ? null : decodeURIComponent(result[1]);
}

/**
 * @function getLinkerValuesFromUrl
 * @param {string} linkerQueryParameterName - the parameter name of the linker in the URL
 * @param {boolean} checkFingerPrint - if the function should check for the fingerprint validation before returning the cookies
 * @returns {object|undefined} - an object with the cookies values, or undefined if the linker parameter is not found or the fingerprint check failed
 */
export function getLinkerValuesFromUrl({ linkerQueryParameterName, checkFingerPrint } = {}) {
    const linkerParameterValue = getQueryParameterValue(linkerQueryParameterName);
    if (!linkerParameterValue) return;

    const cookiesEncodedFromLinkerParameter = linkerParameterValue.split("*").slice(2);
    const cookiesDecodedFromUrl = {};
    const valuesToCalculateFingerprintFrom = [];
    for (let i = 0; i < cookiesEncodedFromLinkerParameter.length; i += 2) {
        const cookieName = cookiesEncodedFromLinkerParameter[i];
        const cookieValue = cookiesEncodedFromLinkerParameter[i + 1];
        valuesToCalculateFingerprintFrom.push(cookieName + "*" + cookieValue);
        cookiesDecodedFromUrl[cookieName] = untransformCookieValueFromLinkerFormat(cookieValue);
    }

    if (checkFingerPrint) {
        const currentFingerprint = getFingerPrint(valuesToCalculateFingerprintFrom);
        const linkerFingerprint = linkerParameterValue.split("*")[1];
        if (linkerFingerprint !== currentFingerprint) return;
    }

    return cookiesDecodedFromUrl;
}

/**
 * @function generateLinkerValuesFromCookies
 * @param {string[]|object} cookiesNamesList - an array with the cookies names to be passed on the linker, or an object with the cookies names and values
 * @param {string} gaCookiesPrefix - prefix for the Google Analytics cookies
 * @returns {string[]} - an array containing the linker value for each cookie. Example: ['_ga_THYNGSTER*XXXXXXXXXXXXXXX', '_gcl_aw*AAAAAAAAAAAA', '_gcl_dc*BBBBBBBBBBB', '_gcl_gb*CCCCCCCCCCCC', '_gcl_gf*DDDDDDDDDDD', '_gcl_ha*EEEEEEEEEEEE', '_fplc*MTExMTExMTExMTExMTExMTExMTEx']
 */
export function generateLinkerValuesFromCookies({ cookiesNamesList, gaCookiesPrefix } = {}) {
    const gaCookiesRegex = new RegExp("^" + gaCookiesPrefix + "_ga");
    const cookiesValuesFormattedForLinker = [];
    let _FPLC = undefined;

    // If it's not an array, then it's an object containing the cookies name and values. We don't have to read them.
    if (!Array.isArray(cookiesNamesList)) {
        Object.keys(cookiesNamesList).forEach((cookieName) => {
            const cookieValue = cookiesNamesList[cookieName];
            if (cookieName === "FPLC") {
                _FPLC = cookieValue;
                return;
            }
            cookiesValuesFormattedForLinker.push(
                transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue)
            );
        });
    } else {
        cookiesNamesList.forEach((cookieName) => {
            const cookieNameAndValue = getCookieNameAndValue(cookieName);
            cookieName = cookieNameAndValue[0];
            let cookieValue = cookieNameAndValue[1];
            if (!cookieValue) return;
            if (gaCookiesRegex.test(cookieName)) {
                cookieValue = cookieValue.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
            } else if (cookieName === "FPLC") {
                _FPLC = cookieValue;
                return;
            }
            cookiesValuesFormattedForLinker.push(
                transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue)
            );
        });
    }

    // This needs to go at the end
    if (_FPLC) {
        cookiesValuesFormattedForLinker.push(
            transformCookieNameAndValueToLinkerFormat("_fplc", _FPLC)
        );
    }

    return cookiesValuesFormattedForLinker;
}

/**
 * [From GAUA analytics.js]{@link https://www.google-analytics.com/analytics.js}
 * @function decorateAnchorTagWithLinker
 * @param {string} linkerQueryParameterName - the name of the linker query parameter
 * @param {string} linkerParameter - the linker parameter value
 * @param {HTMLAnchorElement} anchorTag - the anchor tag to be decorated
 * @param {boolean} useFragment - whether to place the linker parameter in the fragment part of the URL or in the query string
 */
export function decorateAnchorTagWithLinker(
    linkerQueryParameter,
    linkerParameter,
    anchorElement,
    useFragment
) {
    if (anchorElement && anchorElement.href) {
        const decoratedUrl = decorateURLWithLinker(
            linkerQueryParameter,
            linkerParameter,
            anchorElement.href,
            useFragment
        );
        if (urlChecker.test(decoratedUrl)) {
            anchorElement.href = decoratedUrl;
            return anchorElement;
        }
    }
}

/**
 * [From GAUA analytics.js]{@link https://www.google-analytics.com/analytics.js}
 * @function decorateFormTagWithLinker
 * @param {string} linkerQueryParameterName - the name of the linker query parameter
 * @param {string} linkerParameter - the linker parameter value
 * @param {HTMLFormElement} form - the form tag to decorate.
 */
export function decorateFormTagWithLinker(linkerQueryParameter, linkerParameter, formElement) {
    if (formElement && formElement.action) {
        const method = (formElement.method || "").toLowerCase();
        if ("get" === method) {
            const childNodes = formElement.childNodes || [];
            let found = false;
            for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                if (childNode.name === linkerQueryParameter) {
                    childNode.setAttribute("value", linkerParameter);
                    found = true;
                    break;
                }
            }
            if (!found) {
                const childNode = document.createElement("input");
                childNode.setAttribute("type", "hidden");
                childNode.setAttribute("name", linkerQueryParameter);
                childNode.setAttribute("value", linkerParameter);
                formElement.appendChild(childNode);
            }
            return formElement;
        } else if ("post" === method) {
            const decoratedUrl = decorateURLWithLinker(
                linkerQueryParameter,
                linkerParameter,
                formElement.action
            );
            if (urlChecker.test(decoratedUrl)) {
                formElement.action = decoratedUrl;
                return formElement;
            };
        }
    }
}

/**
 * [From GAUA analytics.js]{@link https://www.google-analytics.com/analytics.js}
 * @function decorateURLWithLinker
 * @param {string} linkerQueryParameterName - the name of the linker query parameter
 * @param {string} linkerParameter - the linker parameter value
 * @param {string} url - the URL to decorate.
 * @param {boolean} useFragment - whether to place the linker parameter in the fragment part of the URL or in the query string
 * @returns {string} - the decorated URL
 */
export function decorateURLWithLinker(linkerQueryParameter, linkerParameter, url, useFragment) {
    function Q(a) {
        return new RegExp("(.*?)(^|&)" + a + "=([^&]*)&?(.*)");
    }

    function U(a, b) {
        if ((a = Q(a).exec(b))) {
            const c = a[2],
                d = a[4];
            b = a[1];
            d && (b = b + c + d);
        }
        return b;
    }

    function e(k) {
        k = U(linkerQueryParameter, k);
        const m = k.charAt(k.length - 1);
        k && "&" !== m && (k += "&");
        return k + linkerParameterKeyValueQuery;
    }

    useFragment = !!useFragment;
    const urlParsedIntoParts = /([^?#]+)(\?[^#]*)?(#.*)?/.exec(url);
    if (!urlParsedIntoParts) return "";
    const hostname = urlParsedIntoParts[1];
    let queryString = urlParsedIntoParts[2] || "";
    let fragment = urlParsedIntoParts[3] || "";
    const linkerParameterKeyValueQuery = linkerQueryParameter + "=" + linkerParameter;
    if (useFragment) fragment = "#" + e(fragment.substring(1), linkerParameterKeyValueQuery);
    else queryString = "?" + e(queryString.substring(1), linkerParameterKeyValueQuery);
    return "" + hostname + queryString + fragment;
}

/**
 * @function getFingerPrint
 * @param {string[]} linkerCookiesValues - list of values to calculate the fingerprint from. It's an array in the following format ['<cookie name 1>*<cookie value Base-64 transformed 1>', ...]
 * @returns {string} - the calculated fingerprint
 */
export function getFingerPrint(linkerCookiesValues = undefined) {
    // Build Finger Print String
    const fingerPrintString = [
        window.navigator.userAgent,
        new Date().getTimezoneOffset(),
        window.navigator.userLanguage || window.navigator.language,
        Math.floor(new Date().getTime() / 60 / 1e3) - 0,
        linkerCookiesValues ? linkerCookiesValues.join("*") : ""
    ].join("*");

    // Make a CRC Table
    let c;
    const crcTable = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        crcTable[n] = c;
    }
    // Create a CRC32 Hash
    let crc = 0 ^ -1;
    for (let i = 0; i < fingerPrintString.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ fingerPrintString.charCodeAt(i)) & 0xff];
    }
    // Convert the CRC32 Hash to Base36 and return the value
    crc = ((crc ^ -1) >>> 0).toString(36);
    return crc;
}
