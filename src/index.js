/*

[x] Add Adwords / Double Click Support
    [x] Confirmar quais são os cookies usados para esse caso.
        '_gcl_aw', '_gcl_dc', '_gcl_gf', '_gcl_ha', '_gcl_gb'
    [x] Colocar opção para pessoa escolher o prefixo do cookie (do GA e Conversion Linker). Alterar assinatura de getCookies.

[x] QA environments with multiple cookies
    [x] Ler somente o último cookie de document.cookies, pois será sempre o mais atualizado.
       O  código original pega sempre o último cookie.

[x] Add the chance to manually defined the cookies to be passed. Alterar assinatura de getCookies.
    [x] Se não passar nada, pega os default que o GA4 usa (_ga e _ga_<stream> e FPLC)

[x] Add a "read" method to decode the linkerParam to the real cookie values
    [x] Checar se fingerprint bate.
    [x] Se bater, pegar cada query e fazer atob(query.replace(/\./g, '='))

[x] Add a "decorate" method
    Usar a mesma ideia de window.google_tag_data.glBridge.decorate(generateArgumentObject, element);
    Checar no código o que é que fazem para cada caso.
    [x] Se for string, decora a string e retorna.
    [x] Se for HTMLAnchorElement ou HTMLFormElement, decora os atributos que contém o link e retorna (o próprio elemento ou a string. Checar.)


[x] Renomear getCookies e as variáveis que capturam o retorno. Alterar o nome do argumento de getFingerprint.


[x] Gerenciar argumentos default.

[] Testar "decorate".

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
        gaCookiesPrefix: settings.gaCookiesPrefix || undefined,
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
            // Google Ads (gclid, gclsrc maps to _aw, _dc, _gf, _ha cookies)
            // Campaign Manager (dclid, gclsrc maps to _aw, _dc, _gf, _ha cookies)
            // wbraid (wbraid maps to _gb cookie)
            ...["_aw", "_dc", "_gb", "_gf", "_ha"].map(
                (name) => defaultSettings.conversionLinkerCookiesPrefix + name
            ),
            // First Party Linker Cookie maps to sGTM
            "FPLC"
        ];
    }

    switch (action) {
        case "get":
            return getLinker({
                cookiesNamesList: settings.cookiesNamesList
            });
        case "read":
            return readLinker({
                linkerQueryParameterName: settings.linkerQueryParameterName,
                cookiesNamesList: settings.cookiesNamesList,
                checkFingerPrint: settings.checkFingerPrint
            });
        case "decorate":
            return decorateWithLinker({
                linkerQueryParameterName: settings.linkerQueryParameterName,
                cookiesNamesList: settings.cookiesNamesList,
                entity: settings.entity,
                useFragment: settings.useFragment
            });
        default:
            break;
    }
};

googleTagLinker.prototype = {};
googleTagLinker.answer = 42;

export default googleTagLinker;
