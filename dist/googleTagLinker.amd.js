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

    var urlChecker = /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;
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
    function getQueryParameterValue(parameterName) {
      var url = window.location.href;
      var reg = new RegExp("[?&]" + parameterName + "=([^&#]*)", "i");
      var result = reg.exec(url);
      return result === null ? null : decodeURIComponent(result[1]);
    }
    function getLinkerValuesFromUrl() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        linkerQueryParameterName = _ref.linkerQueryParameterName,
        checkFingerPrint = _ref.checkFingerPrint;
      var linkerParameterValue = getQueryParameterValue(linkerQueryParameterName);
      if (!linkerParameterValue) return;
      var cookiesEncodedFromLinkerParameter = linkerParameterValue.split("*").slice(2);
      var cookiesDecodedFromUrl = {};
      var valuesToCalculateFingerprintFrom = [];
      for (var i = 0; i < cookiesEncodedFromLinkerParameter.length; i += 2) {
        var cookieName = cookiesEncodedFromLinkerParameter[i];
        var cookieValue = cookiesEncodedFromLinkerParameter[i + 1];
        valuesToCalculateFingerprintFrom.push(cookieName + "*" + cookieValue);
        cookiesDecodedFromUrl[cookieName] = untransformCookieValueFromLinkerFormat(cookieValue);
      }
      if (checkFingerPrint) {
        var currentFingerprint = getFingerPrint(valuesToCalculateFingerprintFrom);
        var linkerFingerprint = linkerParameterValue.split("*")[1];
        if (linkerFingerprint !== currentFingerprint) return;
      }
      return cookiesDecodedFromUrl;
    }
    function generateLinkerValuesFromCookies() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        cookiesNamesList = _ref2.cookiesNamesList,
        gaCookiesPrefix = _ref2.gaCookiesPrefix;
      var gaCookiesRegex = new RegExp("^" + gaCookiesPrefix + "_ga");
      var cookiesValuesFormmatedForLinker = [];
      var _FPLC = undefined;

      // If it's not an array, then it's an object containing the cookies name and values. We don't have to read them.
      if (!Array.isArray(cookiesNamesList)) {
        Object.keys(cookiesNamesList).forEach(function (cookieName) {
          var cookieValue = cookiesNamesList[cookieName];
          if (cookieName === "FPLC") {
            _FPLC = cookieValue;
            return;
          }
          cookiesValuesFormmatedForLinker.push(transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue));
        });
      } else {
        cookiesNamesList.forEach(function (cookieName) {
          var cookieNameAndValue = getCookieNameAndValue(cookieName);
          cookieName = cookieNameAndValue[0];
          var cookieValue = cookieNameAndValue[1];
          if (!cookieValue) return;
          if (gaCookiesRegex.test(cookieName)) {
            cookieValue = cookieValue.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
          } else if (cookieName === "FPLC") {
            _FPLC = cookieValue;
            return;
          }
          cookiesValuesFormmatedForLinker.push(transformCookieNameAndValueToLinkerFormat(cookieName, cookieValue));
        });
      }

      // This needs to go at the end
      if (_FPLC) {
        cookiesValuesFormmatedForLinker.push(transformCookieNameAndValueToLinkerFormat("_fplc", _FPLC));
      }
      return cookiesValuesFormmatedForLinker;
    }
    function decorateAnchorTagWithLinker(linkerQueryParameter, linkerParameter, anchorElement, useFragment) {
      if (anchorElement && anchorElement.href) {
        var decoratedUrl = linkerParameter = decorateURLWithLinker(linkerQueryParameter, linkerParameter, anchorElement.href, useFragment);
        if (urlChecker.test(decoratedUrl)) anchorElement.href = decoratedUrl;
      }
    }
    function decorateFormTagWithLinker(linkerQueryParameter, linkerParameter, formElement) {
      if (formElement && formElement.action) {
        var method = (formElement.method || "").toLowerCase();
        if ("get" === method) {
          var childNodes = formElement.childNodes || [];
          var found = false;
          for (var i = 0; i < childNodes.length; i++) {
            var childNode = childNodes[i];
            if (childNode.name === linkerQueryParameter) {
              childNode.setAttribute("value", linkerParameter);
              found = true;
              break;
            }
          }
          if (!found) {
            var _childNode = document.createElement("input");
            _childNode.setAttribute("type", "hidden");
            _childNode.setAttribute("name", linkerQueryParameter);
            _childNode.setAttribute("value", linkerParameter);
            formElement.appendChild(_childNode);
          }
        } else if ("post" === method) {
          var decoratedUrl = decorateURLWithLinker(linkerQueryParameter, linkerParameter, formElement.action);
          if (urlChecker.test(decoratedUrl)) formElement.action = decoratedUrl;
        }
      }
    }
    function decorateURLWithLinker(linkerQueryParameter, linkerParameter, url, useFragment) {
      function Q(a) {
        return new RegExp("(.*?)(^|&)" + a + "=([^&]*)&?(.*)");
      }
      function U(a, b) {
        if (a = Q(a).exec(b)) {
          var c = a[2],
            d = a[4];
          b = a[1];
          d && (b = b + c + d);
        }
        return b;
      }
      function e(k) {
        k = U(linkerQueryParameter, k);
        var m = k.charAt(k.length - 1);
        k && "&" !== m && (k += "&");
        return k + linkerParameterKeyValueQuery;
      }
      useFragment = !!useFragment;
      var urlParsedIntoParts = /([^?#]+)(\?[^#]*)?(#.*)?/.exec(url);
      if (!urlParsedIntoParts) return "";
      var hostname = urlParsedIntoParts[1];
      var queryString = urlParsedIntoParts[2] || "";
      var fragment = urlParsedIntoParts[3] || "";
      var linkerParameterKeyValueQuery = linkerQueryParameter + "=" + linkerParameter;
      if (useFragment) fragment = "#" + e(fragment.substring(1));else queryString = "?" + e(queryString.substring(1));
      return "" + hostname + queryString + fragment;
    }

    // linkerCookiesValues argument is an array in the following format ['<cookie name 1>*<cookie value Base-64 transformed 1>', ...]
    function getFingerPrint() {
      var linkerCookiesValues = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      // Build Finger Print String
      var fingerPrintString = [window.navigator.userAgent, new Date().getTimezoneOffset(), window.navigator.userLanguage || window.navigator.language, Math.floor(new Date().getTime() / 60 / 1e3) - 0, linkerCookiesValues ? linkerCookiesValues.join("*") : ""].join("*");

      // Make a CRC Table
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

    function getLinker() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        cookiesNamesList = _ref.cookiesNamesList,
        gaCookiesPrefix = _ref.gaCookiesPrefix;
      // Grab current GA4 and Google Ads / Campaign Manager Related cookies
      var linkerCookiesValues = generateLinkerValuesFromCookies({
        cookiesNamesList: cookiesNamesList,
        gaCookiesPrefix: gaCookiesPrefix
      });
      return ["1", getFingerPrint(linkerCookiesValues), linkerCookiesValues.join("*")].join("*");
    }
    function readLinker() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        linkerQueryParameterName = _ref2.linkerQueryParameterName;
        _ref2.cookiesNamesList;
        var checkFingerPrint = _ref2.checkFingerPrint;
      return getLinkerValuesFromUrl({
        linkerQueryParameterName: linkerQueryParameterName,
        checkFingerPrint: checkFingerPrint
      });
    }
    function decorateWithLinker() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        linkerQueryParameterName = _ref3.linkerQueryParameterName,
        cookiesNamesList = _ref3.cookiesNamesList,
        entity = _ref3.entity,
        useFragment = _ref3.useFragment;
      var linkerParameter = getLinker({
        cookiesNamesList: cookiesNamesList
      });
      if (entity.tagName) {
        if ("A" === entity.tagName) return decorateAnchorTagWithLinker(linkerQueryParameterName, linkerParameter, entity, useFragment);
        if ("FORM" === entity.tagName) return decorateFormTagWithLinker(linkerQueryParameterName, linkerParameter, entity);
      }
      if ("string" === typeof entity) return decorateURLWithLinker(linkerQueryParameterName, linkerParameter, entity, useFragment);
    }

    /*


    [] Enviar para o Chat GPT
        [] Pedir para arrumar o readme.
        [] Solicitar que documente apenas 2 funções por vez. Assim dará para pegar todas.
        [] Pedir para gerar testes.

    */
    var googleTagLinker = function googleTagLinker() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "get";
      var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // Check if we are on a browser
      if (typeof window === "undefined" || typeof window.document === "undefined") {
        throw "This should be only run on a browser";
      }
      var defaultSettings = {
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
        "FPLC"];

        // Google Ads (gclid, gclsrc maps to _aw, _dc, _gf, _ha cookies)
        // Campaign Manager (dclid, gclsrc maps to _aw, _dc, _gf, _ha cookies)
        // wbraid (wbraid maps to _gb cookie)
        ["_aw", "_dc", "_gb", "_gf", "_ha"].forEach(function (name) {
          defaultSettings.cookiesNamesList.push(defaultSettings.conversionLinkerCookiesPrefix + name);
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
      }
    };
    googleTagLinker.prototype = {};
    googleTagLinker.answer = 42;

    return googleTagLinker;

}));
