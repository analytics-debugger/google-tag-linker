import {
    generateLinkerValuesFromCookies,
    getLinkerValuesFromUrl,
    decorateAnchorTagWithLinker,
    decorateFormTagWithLinker,
    decorateURLWithLinker,
    getFingerPrint
} from "./utils.js";

export function getLinker({ cookiesNamesList, gaCookiesPrefix } = {}) {
    // Grab current GA4 and Google Ads / Campaign Manager Related cookies
    const linkerCookiesValues = generateLinkerValuesFromCookies({
        cookiesNamesList,
        gaCookiesPrefix
    });

    return ["1", getFingerPrint(linkerCookiesValues), linkerCookiesValues.join("*")].join("*");
}

export function readLinker({ linkerQueryParameterName, cookiesNamesList, checkFingerPrint } = {}) {
    return getLinkerValuesFromUrl({
        linkerQueryParameterName,
        checkFingerPrint
    });
}

export function decorateWithLinker({
    linkerQueryParameterName,
    cookiesNamesList,
    entity,
    useFragment
} = {}) {
    const linkerParameter = getLinker({
        cookiesNamesList
    });

    if (entity.tagName) {
        if ("A" === entity.tagName)
            return decorateAnchorTagWithLinker(
                linkerQueryParameterName,
                linkerParameter,
                entity,
                useFragment
            );
        if ("FORM" === entity.tagName)
            return decorateFormTagWithLinker(linkerQueryParameterName, linkerParameter, entity);
    }

    if ("string" === typeof entity)
        return decorateURLWithLinker(
            linkerQueryParameterName,
            linkerParameter,
            entity,
            useFragment
        );
}
