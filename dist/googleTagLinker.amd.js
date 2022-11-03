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

define((function () { 'use strict';

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
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
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var googleTagLinker = function googleTagLinker() {
    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "get";
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
      var _ck$split = ck.split("="),
        _ck$split2 = _slicedToArray(_ck$split, 2),
        name = _ck$split2[0],
        value = _ck$split2[1];
      var _iterator = _createForOfIteratorHelper(cookiesList),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var regex = _step.value;
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
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
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
