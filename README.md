# Google Tag Linker Brigde

Hola! This is a **JavaScript** library that provided the needed functionality for creating a linkParam for Google analytics 4 ( ***`Google Tag`*** , ***`GTAG`*** ) . I started this work back in 2019 when I first saw the new `_gl` parameter.

At the time of publishing this library Google doesn't offer any "documented" way of generating this value, making really hard to work with custom implementations, for example when needing to deal with iFrames or forms/links generated dynamically. 

The library is provided in the `AMD`, `UMD`, `IIFE` and `ESM` formats, all of them available in the `dist` folder

# How does Google Tag cross-domain work

Google Tag cross-domain works pretty similarly to how previous Google Analytics worked. It's basically based on 2 different parts. 

1. A Fingerprint (Browser/Time)
2. The List of Cookies to be passed to the new domain

The finger printing is done using the following values:

 - Navigator User Agent
 - User Timezone
 - Navigator Language
 - Current Time ( current inute index from EPOC TimeStamp Rounded )
 - A list of cookies passed on the linker

The usage for this fingerprinting is not identifying the user but making the current link only to work on the current user browser and making it valid only for the current minute ( since many users may share the same browser specs )

The Linker Paramter will look like this:

    1*dm649n*[_ga*MTM2MDM4NDg1MS4xNjYxODIxMjQy]*[_ga_THYNGSTER*XXXXXXXXXXXXXXX]

   
Which follows the following definition
    
    {{FIXED_NUMBER}}*{{FINGERPRINT_HASH}}*[COOKIE_KEY*COOKIE_VALUE]^n

Note that Google Tag allow allows to do an AdWords / DoubleClick cookies. Which are not currently supported by this tool, yet ...

This tool will read and pass the following cookies by default:

|Cookie Name|Description|
|--|--|
|_ga|Universal and Google Analytics 4 Cookie|
|_ga_XXXXXX|Google Analytics 4 Session Cookie|
|FPLC|First Party Linker Cookie . SGMT COOKIE|

# Notes
This is a beta version, while it should work fine for doing a GA4 cross-domain tracking, some features needs to in a future, check next section.

Cross Domain has not been properly checked when there're multiple GA4 Session cookies

# To-Do

 - Add Adwords / Double Click Support
 - QA environments with multiple cookies
 - Add the chance to manually defined the cookies to be passed
 - Add a "read" method to decode the linkerParam to the real cookie values
 - Add a "decorate" method
 - Add tests
 - Refactoring / TypeScript

# Build
> $ npm install
> $ npm run build
  

# How to use
After loading the script just run the following. 

Using Import:


    import googleTagLinker from '@analytics-debugger/google-tag-linker'
    const linkerParam  = googleTagLinker("get");

or loading the IIFE version:

    <script src="https://cdn.jsdelivr.net/npm/@analytics-debugger/google-tag-linker@latest/dist/googleTagLinker.iife.min.js"><script>
    <script>
    const linkerParam  = googleTagLinker("get");
    </script>

