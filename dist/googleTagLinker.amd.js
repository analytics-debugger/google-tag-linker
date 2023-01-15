/*!
* 
*   @analytics-debugger/google-tag-linker 0.0.1
*   https://github.com/analytics-debugger/google-tag-linker
*
*   Copyright (c) David Vallejo (https://www.thyngster.com).
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/

define((function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

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

  var googleTagLinker = function googleTagLinker() {
    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "get";
    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      conversionLinkerCookiesPrefix: "_gcl",
      gaCookiesPrefix: "",
      linkerQueryParameterName: "_gl",
      checkFingerPrint: false
    };
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
      case "read":
        return readLinker({
          gaCookiesPrefix: settings.gaCookiesPrefix,
          conversionLinkerCookiesPrefix: settings.conversionLinkerCookiesPrefix,
          linkerQueryParameterName: settings.linkerQueryParameterName,
          cookiesNamesList: settings.cookiesNamesList,
          checkFingerPrint: settings.checkFingerPrint
        });
      case "decorate":
        return decorateWithLinker();
    }
  };
  googleTagLinker.prototype = {};
  googleTagLinker.answer = 42;
  function getCookieNameAndValue(cookieName) {
    var cookiesNamesAndValues = ("; " + document.cookie).split("; ");
    for (var i = cookiesNamesAndValues.length - 1; i >= 0; i--) {
      var cookieNameAndValue = cookiesNamesAndValues[i].split("=");
      var cookieFound = cookieName instanceof RegExp ? cookieName.test(cookieNameAndValue[0]) : cookieName === cookieNameAndValue[0];
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
  function getCookies() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      gaCookiesPrefix = _ref.gaCookiesPrefix,
      conversionLinkerCookiesPrefix = _ref.conversionLinkerCookiesPrefix,
      cookiesNamesList = _ref.cookiesNamesList;
    cookiesNamesList = cookiesNamesList || [gaCookiesPrefix + "_ga",
    // Main Google Analytics Cookie
    new RegExp("^" + gaCookiesPrefix + "_ga_[A-Z,0-9]")].concat(_toConsumableArray(["_aw", "_dc", "_gb", "_gf", "_ha"].map(function (name) {
      return conversionLinkerCookiesPrefix + name;
    })), [
    // Google Ads (gclid, gclsrc -> _aw, _dc, _gf, _ha), Campaign Manager (dclid, gclsrc -> _aw, _dc, _gf, _ha), wbraid (wbraid -> _gb) cookies
    "FPLC" // First Party Linker Cookie > sGTM
    ]);

    var cookiesFormmatedForLinker = [];
    var _FPLC = undefined;
    cookiesNamesList.forEach(function (cookieName) {
      var cookieValue;
      var _getCookieNameAndValu = getCookieNameAndValue(cookieName);
      var _getCookieNameAndValu2 = _slicedToArray(_getCookieNameAndValu, 2);
      cookieName = _getCookieNameAndValu2[0];
      cookieValue = _getCookieNameAndValu2[1];
      if (!cookieValue) return; // Proceed to next iteration.
      if (/^_ga/.test(cookieName)) {
        cookieValue = cookieValue.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
      } else if (cookieName === "FPLC") {
        _FPLC = cookieValue;
      }
      cookiesFormmatedForLinker.push(transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue));
    });

    // This needs to go at the end
    if (_FPLC) cookiesFormmatedForLinker.push(transformCookieNameAndValueToLinkerFormat("_fplc", _FPLC));
    return cookiesFormmatedForLinker;
  }
  function getLinker() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      gaCookiesPrefix = _ref2.gaCookiesPrefix,
      conversionLinkerCookiesPrefix = _ref2.conversionLinkerCookiesPrefix,
      cookiesNamesList = _ref2.cookiesNamesList;
    // Grab current GA4 and Google Ads / Campaign Manager Related cookies
    var cookies = getCookies({
      gaCookiesPrefix: gaCookiesPrefix,
      conversionLinkerCookiesPrefix: conversionLinkerCookiesPrefix,
      cookiesNamesList: cookiesNamesList
    });
    return ["1", getFingerPrint(cookies), cookies.join("*")].join("*");
  }
  function readLinker() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      gaCookiesPrefix = _ref3.gaCookiesPrefix,
      conversionLinkerCookiesPrefix = _ref3.conversionLinkerCookiesPrefix,
      linkerQueryParameterName = _ref3.linkerQueryParameterName,
      cookiesNamesList = _ref3.cookiesNamesList,
      checkFingerPrint = _ref3.checkFingerPrint;
    function getQueryParameterValue(parameterName) {
      var url = window.location.href;
      var reg = new RegExp("[?&]" + parameterName + "=([^&#]*)", "i");
      var result = reg.exec(url);
      return result === null ? null : decodeURIComponent(result[1]);
    }
    var cookiesDecoded = {};
    var linkerParameterValue = getQueryParameterValue(linkerQueryParameterName);
    if (!linkerParameterValue) return;
    if (checkFingerPrint) {
      var linkerFingerprint = linkerParameterValue.split("*")[1];
      var cookies = getCookies({
        gaCookiesPrefix: gaCookiesPrefix,
        conversionLinkerCookiesPrefix: conversionLinkerCookiesPrefix,
        cookiesNamesList: cookiesNamesList // Must be the same as the ones used to generate the Linker parameter
      });

      var currentFingerprint = getFingerPrint(cookies);
      if (linkerFingerprint !== currentFingerprint) return;
    }
    var cookiesEncodedFromLinkerParameter = linkerParameterValue.split("*").slice(2);
    for (var i = 0; i < cookiesEncodedFromLinkerParameter.length; i += 2) {
      var cookieName = cookiesEncodedFromLinkerParameter[i];
      var cookieValue = cookiesEncodedFromLinkerParameter[i + 1];
      cookiesDecoded[cookieName] = untransformCookieValueFromLinkerFormat(cookieValue);
    }
    return cookiesDecoded;
  }
  function decorateWithLinker() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      gaCookiesPrefix = _ref4.gaCookiesPrefix,
      conversionLinkerCookiesPrefix = _ref4.conversionLinkerCookiesPrefix,
      cookiesNamesList = _ref4.cookiesNamesList,
      linkerQueryParameterName = _ref4.linkerQueryParameterName,
      entity = _ref4.entity,
      useFragment = _ref4.useFragment;
    function decorateAnchorTagWithLinker(a, b, c, d) {
      entity.href && (a = decorateURLWithLinker(a, b, c.href, void 0 === d ? !1 : d), t.test(a) && (c.href = a));
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
          e || (d = z.createElement("input"), d.setAttribute("type", "hidden"), d.setAttribute("name", a), d.setAttribute("value", b), c.appendChild(d));
        } else "post" === d && (a = decorateURLWithLinker(a, b, c.action), t.test(a) && (c.action = a));
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
      d ? f = "#" + e(f.substring(1)) : h = "?" + e(h.substring(1));
      return "" + c + h + f;
    }
    var linkerParameter = getLinker({
      gaCookiesPrefix: gaCookiesPrefix,
      conversionLinkerCookiesPrefix: conversionLinkerCookiesPrefix,
      cookiesNamesList: cookiesNamesList
    });
    if (entity.tagName) {
      if ("a" === entity.tagName.toLowerCase()) return decorateAnchorTagWithLinker(linkerQueryParameterName, linkerParameter, entity, useFragment);
      if ("form" === entity.tagName.toLowerCase()) return decorateFormTagWithLinker(linkerQueryParameterName, linkerParameter, entity);
    }
    if ("string" === typeof entity) return decorateURLWithLinker(linkerQueryParameterName, linkerParameter, entity, useFragment);
  }
  function getFingerPrint() {
    var cookies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    // Build Finger Print String
    var fingerPrintString = [window.navigator.userAgent, new Date().getTimezoneOffset(), window.navigator.userLanguage || window.navigator.language, Math.floor(new Date().getTime() / 60 / 1e3) - 0, cookies ? cookies.join("*") : ""].join("*");

    // make a CRC Table
    var c;
    var crcTable = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
      }
      crcTable[n] = c;
    }
    // Create a CRC32 Hash
    var crc = 0 ^ -1;
    for (var i = 0; i < fingerPrintString.length; i++) {
      crc = crc >>> 8 ^ crcTable[(crc ^ fingerPrintString.charCodeAt(i)) & 0xff];
    }
    // Convert the CRC32 Hash to Base36 and return the value
    crc = ((crc ^ -1) >>> 0).toString(36);
    return crc;
  }

  return googleTagLinker;

}));
