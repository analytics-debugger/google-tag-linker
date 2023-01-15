/*

[x] Add Adwords / Double Click Support
    [x] Confirmar quais são os cookies usados para esse caso.
        '_gcl_aw', '_gcl_dc', '_gcl_gf', '_gcl_ha', '_gcl_gb'
    [x] Colocar opção para pessoa escolher o prefixo do cookie (do GA e Conversion Linker). Alterar assinatura de getCookies.

[x] QA environments with multiple cookies
    [] Ler somente o último cookie de document.cookies, pois será sempre o mais atualizado.
       O  código original pega sempre o último cookie.

[x] Add the chance to manually defined the cookies to be passed. Alterar assinatura de getCookies.
    [x] Se não passar nada, pega os default que o GA4 usa (_ga e _ga_<stream> e FPLC)

[x] Add a "read" method to decode the linkerParam to the real cookie values
    [x] Checar se fingerprint bate.
    [x] Se bater, pegar cada query e fazer atob(query.replace(/\./g, '='))

[] Add a "decorate" method
    Usar a mesma ideia de window.google_tag_data.glBridge.decorate(generateArgumentObject, element);
    Checar no código o que é que fazem para cada caso.
    [] Se for string, decora a string e retorna.
    [] Se for HTMLAnchorElement ou HTMLFormElement, decora os atributos que contém o link e retorna (o próprio elemento ou a string. Checar.)


[] Renomear getCookies e as variáveis que capturam o retorno. Alterar o nome do argumento de getFingerprint.

*/

const googleTagLinker = function (
    action = "get",
    settings = {
        conversionLinkerCookiesPrefix: "_gcl",
        gaCookiesPrefix: "",
        linkerQueryParameterName: "_gl",
        checkFingerPrint: false
    }
) {
    // Check if we are on a browser
    if (typeof window === "undefined" || typeof window.document === "undefined") {
        throw "This should be only run on a browser";
    }

    switch (action) {
        case "get":
            return getLinker({
                gaCookiesPrefix: settings.gaCookiesPrefix,
                conversionLinkerCookiesPrefix: settings.conversionLinkerCookiesPrefix,
                cookiesNamesList: settings.cookiesNamesList
            });
            break;
        case "read":
            return readLinker({
                gaCookiesPrefix: settings.gaCookiesPrefix,
                conversionLinkerCookiesPrefix: settings.conversionLinkerCookiesPrefix,
                linkerQueryParameterName: settings.linkerQueryParameterName,
                cookiesNamesList: settings.cookiesNamesList,
                checkFingerPrint: settings.checkFingerPrint
            });
            break;
        case "decorate":
            return decorateWithLinker();
            break;
        default:
            break;
    }
};

googleTagLinker.prototype = {};
googleTagLinker.answer = 42;

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

function getCookies({ gaCookiesPrefix, conversionLinkerCookiesPrefix, cookiesNamesList } = {}) {
    cookiesNamesList = cookiesNamesList || [
        gaCookiesPrefix + "_ga", // Main Google Analytics Cookie
        new RegExp("^" + gaCookiesPrefix + "_ga_[A-Z,0-9]"), // Google Analytics 4 Session Cookie
        ...["_aw", "_dc", "_gb", "_gf", "_ha"].map((name) => conversionLinkerCookiesPrefix + name), // Google Ads (gclid, gclsrc -> _aw, _dc, _gf, _ha), Campaign Manager (dclid, gclsrc -> _aw, _dc, _gf, _ha), wbraid (wbraid -> _gb) cookies
        "FPLC" // First Party Linker Cookie > sGTM
    ];
    const cookiesFormmatedForLinker = [];
    let _FPLC = undefined;

    cookiesNamesList.forEach(function (cookieName) {
        let cookieValue;
        [cookieName, cookieValue] = getCookieNameAndValue(cookieName);
        if (!cookieValue) return; // Proceed to next iteration.
        if (/^_ga/.test(cookieName)) {
            cookieValue = cookieValue.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
        } else if (cookieName === "FPLC") {
            _FPLC = cookieValue;
        }
        cookiesFormmatedForLinker.push(
            transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue)
        );
    });

    // This needs to go at the end
    if (_FPLC)
        cookiesFormmatedForLinker.push(transformCookieNameAndValueToLinkerFormat("_fplc", _FPLC));

    return cookiesFormmatedForLinker;
}

function getLinker({ gaCookiesPrefix, conversionLinkerCookiesPrefix, cookiesNamesList } = {}) {
    // Grab current GA4 and Google Ads / Campaign Manager Related cookies
    const cookies = getCookies({
        gaCookiesPrefix,
        conversionLinkerCookiesPrefix,
        cookiesNamesList
    });

    return ["1", getFingerPrint(cookies), cookies.join("*")].join("*");
}

function readLinker({
    gaCookiesPrefix,
    conversionLinkerCookiesPrefix,
    linkerQueryParameterName,
    cookiesNamesList,
    checkFingerPrint
} = {}) {
    function getQueryParameterValue(parameterName) {
        const url = window.location.href;
        const reg = new RegExp("[?&]" + parameterName + "=([^&#]*)", "i");
        const result = reg.exec(url);
        return result === null ? null : decodeURIComponent(result[1]);
    }

    const cookiesDecoded = {};
    const linkerParameterValue = getQueryParameterValue(linkerQueryParameterName);

    if (!linkerParameterValue) return;

    if (checkFingerPrint) {
        const linkerFingerprint = linkerParameterValue.split("*")[1];
        const cookies = getCookies({
            gaCookiesPrefix,
            conversionLinkerCookiesPrefix,
            cookiesNamesList // Must be the same as the ones used to generate the Linker parameter
        });
        const currentFingerprint = getFingerPrint(cookies);
        if (linkerFingerprint !== currentFingerprint) return;
    }
    const cookiesEncodedFromLinkerParameter = linkerParameterValue.split("*").slice(2);
    for (let i = 0; i < cookiesEncodedFromLinkerParameter.length; i += 2) {
        const cookieName = cookiesEncodedFromLinkerParameter[i];
        const cookieValue = cookiesEncodedFromLinkerParameter[i + 1];
        cookiesDecoded[cookieName] = untransformCookieValueFromLinkerFormat(cookieValue);
    }

    return cookiesDecoded;
}

function decorateWithLinker({
    gaCookiesPrefix,
    conversionLinkerCookiesPrefix,
    cookiesNamesList,
    linkerQueryParameterName,
    entity,
    useFragment
} = {}) {
    function decorateAnchorTagWithLinker(a, b, c, d) {
        entity.href &&
            ((a = decorateURLWithLinker(a, b, c.href, void 0 === d ? !1 : d)),
            t.test(a) && (c.href = a));
    }

    function decorateFormTagWithLinker(a, b, c) {
        if (c && c.action) {
            var d = (c.method || "").toLowerCase();
            if ("get" === d) {
                d = c.childNodes || [];
                for (var e = !1, f = 0; f < d.length; f++) {
                    var h = d[f];
                    if (h.name === a) {
                        h.setAttribute("value", b);
                        e = !0;
                        break;
                    }
                }
                e ||
                    ((d = z.createElement("input")),
                    d.setAttribute("type", "hidden"),
                    d.setAttribute("name", a),
                    d.setAttribute("value", b),
                    c.appendChild(d));
            } else
                "post" === d &&
                    ((a = decorateURLWithLinker(a, b, c.action)), t.test(a) && (c.action = a));
        }
    }

    function decorateURLWithLinker(a, b, c, d) {
        function e(k) {
            k = U(a, k);
            var m = k.charAt(k.length - 1);
            k && "&" !== m && (k += "&");
            return k + g;
        }
        d = void 0 === d ? !1 : d;
        var f = fa.exec(c);
        if (!f) return "";
        c = f[1];
        var h = f[2] || "";
        f = f[3] || "";
        var g = a + "=" + b;
        d ? (f = "#" + e(f.substring(1))) : (h = "?" + e(h.substring(1)));
        return "" + c + h + f;
    }

    const linkerParameter = getLinker({
        gaCookiesPrefix,
        conversionLinkerCookiesPrefix,
        cookiesNamesList
    });

    if (entity.tagName) {
        if ("a" === entity.tagName.toLowerCase())
            return decorateAnchorTagWithLinker(
                linkerQueryParameterName,
                linkerParameter,
                entity,
                useFragment
            );
        if ("form" === entity.tagName.toLowerCase())
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

function getFingerPrint(cookies = "") {
    // Build Finger Print String
    const fingerPrintString = [
        window.navigator.userAgent,
        new Date().getTimezoneOffset(),
        window.navigator.userLanguage || window.navigator.language,
        Math.floor(new Date().getTime() / 60 / 1e3) - 0,
        cookies ? cookies.join("*") : ""
    ].join("*");

    // make a CRC Table
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

export default googleTagLinker;
