/*!
* 
*   @analytics-debugger/google-tag-linker 0.0.1-beta
*   https://github.com/analytics-debugger/google-tag-linker
*
*   Copyright (c) David Vallejo (https://www.thyngster.com).
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.googleTagLinker = factory());
})(this, (function () { 'use strict';

    var googleTagLinker = function googleTagLinker() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "get";
      // Check if we are on a browser
      if (typeof window === "undefined" || typeof window.document === "undefined") {
        throw 'This should be only run on a browser';
      }
      // Grab current GA4 Related cookies
      var cookies = getCookies();
      if (action === 'get') {
        return ["1", getFingerPrint(cookies), cookies.join('*')].join('*');
      }
    };
    googleTagLinker.prototype = {};
    googleTagLinker.answer = 42;
    function getCookies() {
      var cookies = [];
      var cookiesList = [/^_ga$/,
      // Main Google Analytics Cookie
      /^_ga_[A-Z,0-9]/,
      // Google Analytics 4 Session Cookie
      /^FPLC$/ // First Party Linker Cookie > sGTM
      ];

      var _FPLC = undefined;
      ('; ' + document.cookie).split('; ').forEach(function (ck) {
        var name = ck.split("=")[0];
        var value = ck.split("=")[1];
        cookiesList.forEach(function (regex) {
          if (regex.test(name)) {
            // This needs to go at the end
            if (name === "FPLC") {
              _FPLC = ["_fplc", btoa(value).replace(/=/g, '.')].join('*');
            } else {
              if (name.match(/^_ga/)) {
                value = value.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
                console.log(name, value);
                cookies.push([name, btoa(value).replace(/=/g, '.')].join('*'));
              }
            }
          }
        });
      });
      if (_FPLC) cookies.push(_FPLC);
      return cookies;
    }
    function getFingerPrint() {
      var cookies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      // Build Finger Print String
      var fingerPrintString = [window.navigator.userAgent, new Date().getTimezoneOffset(), window.navigator.userLanguage || window.navigator.language, Math.floor(new Date().getTime() / 60 / 1E3) - 0, cookies ? cookies.join('*') : ""].join("*");

      // make a CRC Table
      var c;
      var crcTable = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
        }
        crcTable[n] = c;
      }
      // Create a CRC32 Hash
      var crc = 0 ^ -1;
      for (var i = 0; i < fingerPrintString.length; i++) {
        crc = crc >>> 8 ^ crcTable[(crc ^ fingerPrintString.charCodeAt(i)) & 0xFF];
      }
      // Convert the CRC32 Hash to Base36 and return the value    
      crc = ((crc ^ -1) >>> 0).toString(36);
      return crc;
    }

    return googleTagLinker;

}));
