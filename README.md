# Table of contents

- [Google Tag Linker Brigde](#google-tag-linker-brigde)
- [How does Google Tag cross-domain work](#how-does-google-tag-cross-domain-work)
- [Notes](#notes)
- [To-Do](#to-do)
- [Build](#build)
- [How to use](#how-to-use)
  - [`get` method](#get-method)
    - [Example](#example)
  - [`read` method](#read-method)
    - [Example](#example)
  - [`decorate` method](#decorate-method)
    - [Example](#example)

# Google Tag Linker Brigde

Hola! Olá! This is a **JavaScript** library that provided the needed functionality for creating a `linkerParam` for Google Analytics 4 (**_`Google Tag`_** , **_`GTAG`_**). I started this work back in 2019 when I first saw the new `_gl` parameter.

At the time of publishing this library Google doesn't offer any "documented" way of generating this value, making really hard to work with custom implementations, for example when needing to deal with iFrames or forms/links generated dynamically.

The library is provided in the `AMD`, `UMD`, `IIFE` and `ESM` formats, all of them available in the `dist` folder.

# How does Google Tag cross-domain work

Google Tag cross-domain works pretty similarly to how previous Google Analytics worked. It's basically based on 2 different parts.

1. A fingerprint (Browser/Time)
2. The list of cookies to be passed to the new domain

The fingerprinting is done using the following values:

- Navigator User Agent
- User Timezone
- Navigator Language
- Current Time (current minute index from EPOC TimeStamp Rounded)
- A list of cookies passed on the linker

The usage for this fingerprinting is not identifying the user, but making the current link only to work on the current user browser and making it valid only for the current minute (since many users may share the same browser specs).

The Linker Parameter will look like this:

    1*dm649n*_ga*MTM2MDM4NDg1MS4xNjYxODIxMjQy*_ga_THYNGSTER*XXXXXXXXXXXXXXX*_gcl_aw*AAAAAAAAAAAA*_gcl_dc*BBBBBBBBBBB*_gcl_gb*CCCCCCCCCCCC*_gcl_gf*DDDDDDDDDDD*_gcl_ha*EEEEEEEEEEEE*_fplc*MTExMTExMTExMTExMTExMTExMTEx

Which follows the following definition:

    {{FIXED_NUMBER}}*{{FINGERPRINT_HASH}}*[COOKIE_KEY*COOKIE_VALUE]^n

This tool will read and pass the following cookies by default:

| Cookie Name | Description |
| ----------- | ----------- |
| `({{prefix}})?`_ga | Universal and Google Analytics 4 Cookie |
| `({{prefix}})?`_ga_XXXXXX | Google Analytics 4 Session Cookie |
| `({{prefix}}\|_gcl)`_aw | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters |
| `({{prefix}}\|_gcl)`_dc | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters |
| `({{prefix}}\|_gcl)`_gb | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc, wbraid URL parameters |
| `({{prefix}}\|_gcl)`_gf | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters  |
| `({{prefix}}\|_gcl)`_ha | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters |
| FPLC | First Party Linker Cookie from SGTM cookie |

You can also specify a list of cookie names to be read or an object containing the cookie names (as keys) and cookie values (as values).

# Notes

This is a beta version, while it should work fine for doing a GA4 cross-domain tracking, some features needs to in a future, check next section.

When there are multiple GA4 session cookies, the code reads the last one present in `document.cookie` string, if it wasn't manually passed to the `googleTagLinker` function as argument.

# To-Do

- [x] Add Adwords / Double Click Support
- [x] QA environments with multiple cookies
- [x] Add the chance to manually defined the cookies to be passed
- [x] Add a "read" method to decode the linkerParam to the real cookie values
- [x] Add a "decorate" method
- [ ] Add tests
- [ ] Refactoring / TypeScript

# Build

```bash
$ npm install
$ npm run build
```

# How to use

After loading the script just run the following.

Using `import`

```js
import googleTagLinker from '@analytics-debugger/google-tag-linker';
const linkerParam  = googleTagLinker("get");
```

or loading the IIFE version

```html
<script src="https://cdn.jsdelivr.net/npm/@analytics-debugger/google-tag-linker@latest/dist/googleTagLinker.iife.min.js"></script>
<script>
    const linkerParam  = googleTagLinker("get");
</script>
```

or self-hosting one of the compiled files inside the `dist` folder **(you will not receive updates)** - this is a viable aproach if you use GTM. Choose your preferred minified version (the ones ending with `min.js`)
```html
<!--
Inside a Custom HTML tag in GTM, add the your preferred minified version

Make sure that it fires before your product analytics or marketing analytics tool that will use the information appended in the query string (cross-domain).
To do that, add this tag as a setup tag of your tool.
-->

<script>
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):(e="undefined"!=typeof globalThis?globalThis:e||self).googleTagLinker=r()}(this,(function(){"use strict";var e=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;function r(e){for(var r=("; "+document.cookie).split("; "),i=r.length-1;i>=0;i--){var t=r[i].split("=");if(e instanceof RegExp?e.test(t[0]):e===t[0])return[t[0],t[1]]}return[]}function i(e,r){return[e,window.btoa(r).replace(/=/g,".")].join("*")}function t(e){return window.atob(e.replace(/\./g,"="))}function n(e){var r=window.location.href,i=new RegExp("[?&]"+e+"=([^&#]*)","i").exec(r);return null===i?null:decodeURIComponent(i[1])}function o(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.linkerQueryParameterName,i=e.checkFingerPrint,o=n(r);if(o){for(var a=o.split("*").slice(2),s={},u=[],f=0;f<a.length;f+=2){var g=a[f],l=a[f+1];u.push(g+"*"+l),s[g]=t(l)}if(i){var m=c(u),k=o.split("*")[1];if(k!==m)return}return s}}function a(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.cookiesNamesList,n=e.gaCookiesPrefix,o=new RegExp("^"+n+"_ga"),a=[],s=void 0;return Array.isArray(t)?t.forEach((function(e){var t=r(e);e=t[0];var n=t[1];if(n){if(o.test(e))n=n.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];else if("FPLC"===e)return void(s=n);a.push(i(e,n))}})):Object.keys(t).forEach((function(e){var r=t[e];"FPLC"!==e?a.push(i(e,r)):s=r})),s&&a.push(i("_fplc",s)),a}function s(r,i,t,n){if(t&&t.href){var o=f(r,i,t.href,n);if(e.test(o))return t.href=o,t}}function u(r,i,t){if(t&&t.action){var n=(t.method||"").toLowerCase();if("get"===n){for(var o=t.childNodes||[],a=!1,s=0;s<o.length;s++){var u=o[s];if(u.name===r){u.setAttribute("value",i),a=!0;break}}if(!a){var c=document.createElement("input");c.setAttribute("type","hidden"),c.setAttribute("name",r),c.setAttribute("value",i),t.appendChild(c)}return t}if("post"===n){var g=f(r,i,t.action);if(e.test(g))return t.action=g,t}}}function f(e,r,i,t){function n(r){var i=(r=function(e,r){if(e=function(e){return new RegExp("(.*?)(^|&)"+e+"=([^&]*)&?(.*)")}(e).exec(r)){var i=e[2],t=e[4];r=e[1],t&&(r=r+i+t)}return r}(e,r)).charAt(r.length-1);return r&&"&"!==i&&(r+="&"),r+f}t=!!t;var o=/([^?#]+)(\?[^#]*)?(#.*)?/.exec(i);if(!o)return"";var a=o[1],s=o[2]||"",u=o[3]||"",f=e+"="+r;return t?u="#"+n(u.substring(1)):s="?"+n(s.substring(1)),""+a+s+u}function c(){for(var e,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0,i=[window.navigator.userAgent,(new Date).getTimezoneOffset(),window.navigator.userLanguage||window.navigator.language,Math.floor((new Date).getTime()/60/1e3)-0,r?r.join("*"):""].join("*"),t=[],n=0;n<256;n++){e=n;for(var o=0;o<8;o++)e=1&e?3988292384^e>>>1:e>>>1;t[n]=e}for(var a=-1,s=0;s<i.length;s++)a=a>>>8^t[255&(a^i.charCodeAt(s))];return((-1^a)>>>0).toString(36)}function g(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.cookiesNamesList,i=e.gaCookiesPrefix,t=a({cookiesNamesList:r,gaCookiesPrefix:i});return["1",c(t),t.join("*")].join("*")}function l(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.linkerQueryParameterName,i=e.checkFingerPrint;return o({linkerQueryParameterName:r,checkFingerPrint:i})}function m(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.linkerQueryParameterName,i=e.cookiesNamesList,t=e.gaCookiesPrefix,n=e.entity,o=e.useFragment,a=g({cookiesNamesList:i,gaCookiesPrefix:t});if(n.tagName){if("A"===n.tagName)return s(r,a,n,o);if("FORM"===n.tagName)return u(r,a,n)}if("string"==typeof n)return f(r,a,n,o)}var k=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"get",r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if("undefined"==typeof window||void 0===window.document)throw"This should be only run on a browser";var i={gaCookiesPrefix:r.gaCookiesPrefix||"",conversionLinkerCookiesPrefix:r.conversionLinkerCookiesPrefix||"_gcl",linkerQueryParameterName:r.linkerQueryParameterName||"_gl",checkFingerPrint:!!r.checkFingerPrint||!1,useFragment:!!r.useFragment||!1};switch(r.cookiesNamesList?i.cookiesNamesList=r.cookiesNamesList:(i.cookiesNamesList=[i.gaCookiesPrefix+"_ga",new RegExp("^"+i.gaCookiesPrefix+"_ga_[A-Z,0-9]"),"FPLC"],["_aw","_dc","_gb","_gf","_ha"].forEach((function(e){i.cookiesNamesList.push(i.conversionLinkerCookiesPrefix+e)}))),e){case"get":return g({cookiesNamesList:i.cookiesNamesList,gaCookiesPrefix:i.gaCookiesPrefix});case"read":return l({linkerQueryParameterName:i.linkerQueryParameterName,checkFingerPrint:i.checkFingerPrint});case"decorate":return m({linkerQueryParameterName:i.linkerQueryParameterName,cookiesNamesList:i.cookiesNamesList,entity:r.entity,useFragment:i.useFragment})}};return k.prototype={},k.answer=42,k}));
</script>
```


## `get` method

The `get` method returns the linker.

| Argument name | Description | Type | Default |
|---|---|---|---|
| settings.gaCookiesPrefix | Prefix to use when looking for `_ga` cookies. | string\|undefined  | `''` (empty string - i.e. no prefix) |
| settings.conversionLinkerCookiesPrefix | Prefix to use when looking for Conversion Linker (Google Ads, Campaign Manager) cookies. | string\|undefined | `_gcl` |
| settings.cookiesNamesList | List of cookies names to include in the linker parameter or an object containing the cookies names and values | (string\|RegExp)[]\|object\|undefined | `["_ga", /^_ga_[A-Z,0-9]/, "FPLC", "_gcl_aw", "_gcl_dc", "_gcl_gb", _"gcl_gf", "_gcl_ha"]` |

### Example

Returns the linker using the default arguments.
```js
// ...
const linkerParam = googleTagLinker("get");
// ...
```

Returns the linker using `my_prefix` as GA4 cookies prefix and `another_prefix` as Conversion Linker cookies prefix.
```js
// ...
const linkerParam = googleTagLinker("get", {
    gaCookiesPrefix: 'my_prefix',
    conversionLinkerCookiesPrefix: 'another_prefix'
});
// ...
```

Returns the linker just for the `_my_custom_client_id_cookie`, `my_custom_stream_session_cookie` and `/^_my_custom_[0-9]/` cookies.
```js
// ...
const linkerParam = googleTagLinker("get", {
    cookiesNamesList: ['_my_custom_client_id_cookie', 'my_custom_stream_session_cookie', /^_my_custom_[0-9]/]
});
// ...
```

Returns the linker just for the `client_id`, `session_id` and `user_id` cookies and their values.
```js
// ...
const linkerParam = googleTagLinker("get", {
    cookiesNamesList: {
        client_id: '156eb98c-9fe9-4d5d-ae89-db4b3c29849d',
        session_id: '615c74df-5cb9-4dcd-bbb4-6ee4bc5d17a1',
        user_id: 'ABCDE123#@!'
    }
});
// ...
```

## `read` method

The `read` method reads the linker parameter from URL and returns an object with it's values parsed and decoded.

| Argument name | Description | Type | Default |
|---|---|---|---|
| settings.linkerQueryParameterName | The query parameter name to use as the linker parameter. | string \| undefined | `_gl` |
| settings.checkFingerPrint | Enable or disable checking the fingerprint of the linker parameter. | boolean \| undefined | `false` |


### Example

Returns the linker from URL using the default arguments and returns an object with it's values parsed and decoded.
```js
// ...
const linkerParamParsedAndDecoded = googleTagLinker("read");
// ...
```

Reads the linker from URL `my_custom_linker_parameter` query parameter and returns an object with it's values parsed and decoded.
```js
// ...
const linkerParamParsedAndDecoded = googleTagLinker("read", { linkerQueryParameterName: 'my_custom_linker_parameter' });
// ...
```

Reads the linker from URL `my_custom_linker_parameter` query parameter and returns an object with it's values parsed and decoded, only if the fingerprint is valid.
```js
// ...
const linkerParamParsedAndDecoded = googleTagLinker("read", {
    linkerQueryParameterName: 'my_custom_linker_parameter',
    checkFingerPrint: true
});
// ...
```

## `decorate` method

The `decorate` method decorates an entity with the linker value and returns the entity. Entities: URL string, `<form>` HTML element or `<a>` HTML element.

Arguments:
- The query parameter that will hold linker value.
- The entity (URL string, `<form>` HTML element or `<a>` HTML element) to be decorated;


| Argument name | Description | Type | Default |
|---|---|---|---|
| settings.linkerQueryParameterName | The query parameter name to use as the linker parameter. | string \| undefined  | `_gl` |
| settings.gaCookiesPrefix | Prefix to use when looking for `_ga` cookies. | string \| undefined  | `''` (empty string - i.e. no prefix) |
| settings.conversionLinkerCookiesPrefix | Prefix to use when looking for Conversion Linker (Google Ads, Campaign Manager) cookies. | string \| undefined | `_gcl` |
| settings.cookiesNamesList | List of cookies names to include in the linker parameter or an object containing the cookies names and values | (string \| RegExp)[] \| object \| undefined | `["_ga", /^_ga_[A-Z,0-9]/, "FPLC", "_gcl_aw", "_gcl_dc", "_gcl_gb", _"gcl_gf", "_gcl_ha"]` |
| settings.entity | The entity (URL string, `<form>` HTML element or `<a>` HTML element) to be decorated. | HTMLAnchorElement \| HTMLFormElement \| string | `false` |
| settings.useFragment | A flag indicating whether to use the fragment part of the URL or not. | boolean \| undefined | `false` |

### Example

Returns the URL string decorated with linker parameter using default arguments.
```js
// ...
const entityDecoratedWithLinkerValue = googleTagLinker("decorate", { entity: 'https://example.com' });
// ...
```

Returns the URL string decorated with linker parameter using using `my_prefix` as GA4 cookies prefix and `another_prefix` as Conversion Linker cookies prefix.
```js
// ...
const entityDecoratedWithLinkerValue = googleTagLinker("decorate", {
    entity: 'https://example.com',
    gaCookiesPrefix: 'my_prefix',
    conversionLinkerCookiesPrefix: 'another_prefix'
});
// ...
```

Returns the URL string decorated with linker parameter in the fragment part of the URL and using the `_mylinker` "query parameter".
```js
// ...
const entityDecoratedWithLinkerValue = googleTagLinker("decorate", {
    entity: 'https://example.com',
    useFragment: true,
    linkerQueryParameterName: '_mylinker'
});
// ...
```

Returns the `<form>` HTML element decorated with linker parameter using default arguments.
```js
// ...
const entityDecoratedWithLinkerValue = googleTagLinker("decorate", { entity: someFormElement });
// ...
```

Returns the `<a>` HTML element decorated with linker just for the `_my_custom_client_id_cookie`, `my_custom_stream_session_cookie` and `/^_my_custom_[0-9]/` cookies.
```js
// ...
const entityDecoratedWithLinkerValue = googleTagLinker("decorate", {
    entity: someAnchorElement,
    cookiesNamesList: ['_my_custom_client_id_cookie', 'my_custom_stream_session_cookie', /^_my_custom_[0-9]/]
});
// ...
```

Returns the `<a>` HTML element decorated with linker just for the `client_id`, `session_id` and `user_id` cookies and their values.
```js
// ...
const entityDecoratedWithLinkerValue = googleTagLinker("decorate", {
    entity: someAnchorElement,
    cookiesNamesList: {
        client_id: '156eb98c-9fe9-4d5d-ae89-db4b3c29849d',
        session_id: '615c74df-5cb9-4dcd-bbb4-6ee4bc5d17a1',
        user_id: 'ABCDE123#@!'
    }
});
// ...
```
