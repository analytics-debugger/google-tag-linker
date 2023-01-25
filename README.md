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

Using `import`:

```js
import googleTagLinker from '@analytics-debugger/google-tag-linker';
const linkerParam  = googleTagLinker("get");
```

or loading the IIFE version:

```html
<script src="https://cdn.jsdelivr.net/npm/@analytics-debugger/google-tag-linker@latest/dist/googleTagLinker.iife.min.js"></script>
<script>
    const linkerParam  = googleTagLinker("get");
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
