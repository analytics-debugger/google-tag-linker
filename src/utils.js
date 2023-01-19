const urlChecker = /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;

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

function transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue) {
    return [cookieName, window.btoa(cookieValue).replace(/=/g, ".")].join("*");
}

function untransformCookieValueFromLinkerFormat(cookieValue) {
    return window.atob(cookieValue.replace(/\./g, "="));
}

function getQueryParameterValue(parameterName) {
    const url = window.location.href;

    const reg = new RegExp("[?&]" + parameterName + "=([^&#]*)", "i");
    const result = reg.exec(url);
    return result === null ? null : decodeURIComponent(result[1]);
    // const searchParams = new URLSearchParams(url);
    // return searchParams.get(parameterName);
}

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

export function generateLinkerValuesFromCookies({ cookiesNamesList } = {}) {
    const cookiesValuesFormmatedForLinker = [];
    let _FPLC = undefined;

    cookiesNamesList.forEach(function (cookieName) {
        const cookieNameAndValue = getCookieNameAndValue(cookieName);
        cookieName = cookieNameAndValue[0];
        let cookieValue = cookieNameAndValue[1];
        if (!cookieValue) return; // Proceed to next iteration.
        if (/^_ga/.test(cookieName)) {
            cookieValue = cookieValue.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
        } else if (cookieName === "FPLC") {
            _FPLC = cookieValue;
        }
        cookiesValuesFormmatedForLinker.push(
            transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue)
        );
    });

    // This needs to go at the end
    if (_FPLC)
        cookiesValuesFormmatedForLinker.push(
            transformCookieNameAndValueToLinkerFormat("_fplc", _FPLC)
        );

    return cookiesValuesFormmatedForLinker;
}

export function decorateAnchorTagWithLinker(
    linkerQueryParameter,
    linkerParameter,
    anchorElement,
    useFragment
) {
    if (anchorElement && anchorElement.href) {
        const decoratedUrl = (linkerParameter = decorateURLWithLinker(
            linkerQueryParameter,
            linkerParameter,
            anchorElement.href,
            useFragment
        ));
        if (urlChecker.test(decoratedUrl)) anchorElement.href = decoratedUrl;
    }
}

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
        } else if ("post" === method) {
            const decoratedUrl = decorateURLWithLinker(
                linkerQueryParameter,
                linkerParameter,
                formElement.action
            );
            if (urlChecker.test(decoratedUrl)) formElement.action = decoratedUrl;
        }
    }
}

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

// linkerCookiesValues argument is an array in the following format ['<cookie name 1>*<cookie value Base-64 transformed 1>', ...]
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
