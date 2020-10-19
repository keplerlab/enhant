var settings = {
    "power_mode": CONFIG.power_mode,
    "lang": CONFIG.transcription.lang_default,
    "server_url": CONFIG.transcription.server_url,
    "urls": CONFIG.default_whitelisted_urls.map((url) => {return {default: true, url: url}})
}


var initial_settings_obj = {
    "settings": settings
}

chrome.storage.local.set(initial_settings_obj, function () {
    console.log("Loaded initial settings into local storage");
});