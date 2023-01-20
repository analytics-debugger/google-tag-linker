/*


[] Enviar para o Chat GPT
    [] Pedir para arrumar o readme.
    [] Solicitar que documente apenas 2 funções por vez. Assim dará para pegar todas.
    [] Pedir para gerar testes.

*/

import { getLinker, readLinker, decorateWithLinker } from "./actions.js";

const googleTagLinker = function (action = "get", settings = {}) {
    // Check if we are on a browser
    if (typeof window === "undefined" || typeof window.document === "undefined") {
        throw "This should be only run on a browser";
    }

    const defaultSettings = {
        gaCookiesPrefix: settings.gaCookiesPrefix || "",
        conversionLinkerCookiesPrefix: settings.conversionLinkerCookiesPrefix || "_gcl",
        linkerQueryParameterName: settings.linkerQueryParameterName || "_gl",
        checkFingerPrint: settings.checkFingerPrint || false,
        useFragment: settings.useFragment || false
    };

    if (settings.cookiesNamesList) {
        defaultSettings.cookiesNamesList = settings.cookiesNamesList;
    } else {
        defaultSettings.cookiesNamesList = [
            // Main Google Analytics Cookie
            defaultSettings.gaCookiesPrefix + "_ga",

            // Google Analytics 4 Session Cookie (e.g. Data Stream ID is G-ABC123, the cookie will be _ga_ABC123)
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
