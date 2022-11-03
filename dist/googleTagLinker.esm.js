const googleTagLinker = function(action = "get", settings = {}) {    
    const cookies = getCookies();    
    if(action === 'get'){
        return ["1", getFingerPrint(cookies), cookies.join('*')].join('*');
    }        
};

googleTagLinker.prototype = {};
googleTagLinker.answer = 42;

function getCookies() {
    const cookies = [];
    const cookiesList = [
        /^_ga$/,          // Main Google Analytics Cookie
        /^_ga_[A-Z,0-9]/, // Google Analytics 4 Session Cookie
        /^FPLC$/          // First Party Linker Cookie > sGTM
    ];
    let _FPLC = undefined;
    ('; ' + document.cookie).split('; ').forEach(function(ck) {
        let [name, value] = ck.split("=");
        
        for (const regex of cookiesList) {
            if (regex.test(name)) {
                // This needs to go at the end
                if(name === "FPLC") {
                    _FPLC = ["_fplc", btoa(value).replace(/=/g, '.')].join('*');
                } else {
                    if(name.match(/^_ga/)) {
                        value = value.match(/G[A-Z]1\.[0-9]\.(.+)/)[1];
                        console.log(name, value);

                        cookies.push([name, btoa(value).replace(/=/g, '.')].join('*'));
                    }                    
                }                               
            }
        }
        
    });
    if(_FPLC) cookies.push(_FPLC);
    return cookies;
}

function getFingerPrint(cookies = "") {

    // Build Finger Print String
    const fingerPrintString = [window.navigator.userAgent, (new Date).getTimezoneOffset(), window.navigator.userLanguage || window.navigator.language, Math.floor((new Date).getTime() / 60 / 1E3) - 0, cookies ? cookies.join('*') : ""].join("*");

    // make a CRC Table
    let c;
    const crcTable = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    // Create a CRC32 Hash
    let crc = 0 ^ (-1);
    for (let i = 0; i < fingerPrintString.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ fingerPrintString.charCodeAt(i)) & 0xFF];
    }
    // Convert the CRC32 Hash to Base36 and return the value    
    crc = ((crc ^ (-1)) >>> 0).toString(36);
    return crc;
}

export { googleTagLinker as default };
