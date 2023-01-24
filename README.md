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

## get

The Linker Parameter will look like this:

    1*dm649n*_ga*MTM2MDM4NDg1MS4xNjYxODIxMjQy*_ga_THYNGSTER*XXXXXXXXXXXXXXX*_gcl_aw*AAAAAAAAAAAA*_gcl_dc*BBBBBBBBBBB*_gcl_gb*CCCCCCCCCCCC*_gcl_gf*DDDDDDDDDDD*_gcl_ha*EEEEEEEEEEEE*_fplc*MTExMTExMTExMTExMTExMTExMTEx

Which follows the following definition:

    {{FIXED_NUMBER}}*{{FINGERPRINT_HASH}}*[COOKIE_KEY*COOKIE_VALUE]^n

This tool will read and pass the following cookies by default:

| Cookie Name | Description |
| ----------- | ----------- |
| `({prefix})?`_ga | Universal and Google Analytics 4 Cookie |
| `({prefix})?`_ga_XXXXXX | Google Analytics 4 Session Cookie |
| `({prefix}\|_gcl)`_aw | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters |
| `({prefix}\|_gcl)`_dc | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters |
| `({prefix}\|_gcl)`_gb | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc, wbraid URL parameters |
| `({prefix}\|_gcl)`_gf | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters  |
| `({prefix}\|_gcl)`_ha | Google Analytics Ads / Campaign Manager Cookies - gclid, dclid, gclsrc URL parameters |
| FPLC | First Party Linker Cookie from SGTM cookie |

You can also specify a list of cookie names to be read or an object containing the cookie names (as keys) and cookie values (as values).

### Example

Lorem ipsum.


## read

Lorem ipsum.

### Example

Lorem ipsum.

Lembrar do checkfingerprint.


## decorate

Lorem ipsum.

### Example

Lorem ipsum.

form, anchor e string. useFragment.


# Notes

This is a beta version, while it should work fine for doing a GA4 cross-domain tracking, some features needs to in a future, check next section.

When there are multiple GA4 session cookies, the code reads the last one present in `document.cookie` string, if it wasn't manually passed to the `googleTagLinker` function as argument.

# To-Do

- [x] Add Adwords / Double Click Support
- [x] QA environments with multiple cookies
- [x] Add the chance to manually defined the cookies to be passed
- [x] Add a "read" method to decode the linkerParam to the real cookie values
- [x] Add a "decorate" method
- [] Add tests
- [] Refactoring / TypeScript

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