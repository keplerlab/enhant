/*
Storage wll be of the format

notes: [
    {
        time: unixtimestamp
        content: "Type your notes here ..."
    },
    .
    .
]

bookmark: [
    {
        time: unixtimestamp
        content: "Bookmark here ..."
    },
    .
    .
]

image: [
    {
        time: unixtimestamp
        content: "base64 image here ..."
    },
    .
    .
]
 */

const STORAGE_KEYS = {
    meeting_number: "meeting_number",
    conv_id : "conv_id",
    notes: "notes",
    bookmart: "bookmark",
    capture : "image",
    transcription: "transcription",
    mode: "mode",
    server_url: "server_url",
    meeting_start_time: "meeting_start_time",
    tab_id: "tab_id",
    settings: "settings",
    guest: "guest",
    host: "host",
    urls: "urls"
}

class EnhantLocalStorage{

    constructor(){
        this.time = "time";
        this.content = "content";
        this.type = "type";
    }

    generateRandomConvId(){
        
        // generate a random string of 10 characters
        var random10digitnumber = Math.floor(1000000000 + Math.random() * 1000000000);
        return random10digitnumber.toString();
    }

    generateUnixTimestamp(){
        return Math.round(new Date().getTime());
    }

    getHostname(url) {
        return url.match(/^(.*:)\/\/([A-Za-z0-9\-\.]+)/)[2];
    }

    generate_data_obj(data, time){
        var storage_obj = {};

        if (time){
            storage_obj[this.time] = time;
        }
        else{
            storage_obj[this.time] = this.generateUnixTimestamp();
        }
        
        storage_obj[this.content] = data;

        return storage_obj;
    }

    save_basic(obj, cb){
        chrome.storage.local.set(obj, function(){
            console.log("Object saved into local storage: ", obj);

            if (cb){
                cb(obj);
            }
        })
    }

    save(d_type, data_obj, cb){

        var get_type = {};
        get_type[d_type] = [];

        // by passing an object you can define default values e.g.: []
        chrome.storage.local.get(get_type, function (result) {
            // the input argument is ALWAYS an object containing the queried keys
            // so we select the key we need
            var typeData = result[d_type];
            typeData.push(data_obj);

            var updated_data = {};
            updated_data[d_type] = typeData;

            // set the new array value to the same key
            chrome.storage.local.set(updated_data, function () {
                cb(data_obj);
            });
        });
    }

    remove_url(url, cb){
        var status = true;
        var error = null;
        var _this = this;

        chrome.storage.local.get([STORAGE_KEYS.settings], function(result){

            var settings = result[STORAGE_KEYS.settings];

            var urls = settings["urls"];

            var index = urls.findIndex(obj => obj.url == url);

            if (index !== -1){
                urls.splice(index, 1);
            }

            var new_obj = {};
            new_obj[STORAGE_KEYS.settings] = {};
            new_obj[STORAGE_KEYS.settings]["lang"] = settings["lang"];
            new_obj[STORAGE_KEYS.settings]["power_mode"] = settings["power_mode"];
            new_obj[STORAGE_KEYS.settings]["server_url"] = settings["server_url"];
            new_obj[STORAGE_KEYS.settings]["urls"] = urls;
            
            // set the new array value to the same key
            chrome.storage.local.set(new_obj, function () {
                cb(url, status, error);
            });

        });
    }

    add_url(url, cb){

        var status = true;
        var error = null;
        var _this = this;

        var default_urls_arr = CONFIG.default_whitelisted_urls.map(function(url){
            return {default: true, url: url}
        });
       
        chrome.storage.local.get([STORAGE_KEYS.settings], function(result){

            var settings = result[STORAGE_KEYS.settings];

            if (!settings){

                // default settings
                settings = {
                    "lang": "en-US",
                    "power_mode": false,
                    "server_url": "http://127.0.0.1",
                    "urls": [].push(...default_urls_arr),
                }
            }

            console.log(" settings ", settings);

            var valid_hostnames = settings["urls"].map(function(obj){ return _this.getHostname(obj.url)});

            var urls = [];

            if (settings.hasOwnProperty(STORAGE_KEYS.urls)){
                urls = settings[STORAGE_KEYS.urls];
            }

            var hostname_already_included = valid_hostnames.map(function (valid_host){

                if (_this.getHostname(url).length >= valid_host.length){
                    return _this.getHostname(url).includes(valid_host);
                }
                else{
                    return valid_host.includes(_this.getHostname(url));
                }
            });

            console.log(" hostname already added ", hostname_already_included);
            
            if (hostname_already_included.indexOf(true) == -1){
                // add item to beginning of array
                urls.unshift({default: false, url: url});

                var new_obj = {};
                new_obj[STORAGE_KEYS.settings] = {};
                new_obj[STORAGE_KEYS.settings]["lang"] = settings["lang"];
                new_obj[STORAGE_KEYS.settings]["power_mode"] = settings["power_mode"];
                new_obj[STORAGE_KEYS.settings]["server_url"] = settings["server_url"];
                new_obj[STORAGE_KEYS.settings]["default_urls"] = settings["default_urls"];

                new_obj[STORAGE_KEYS.settings]["urls"] = urls;

                // set the new array value to the same key
                chrome.storage.local.set(new_obj, function () {
                    cb(url, status, error);
                });
            }
            else{
                status = false;
                error = "Website is already whitelisted.";
                cb(url, status, error);
            }
        })
    }

    read_multiple(keysArr, cb){
        chrome.storage.local.get(keysArr, function(results){
            cb(results);
        })
    }

    read(d_type, cb){

        var get_type = {};
        get_type[d_type] = [];

         // by passing an object you can define default values e.g.: []
         chrome.storage.local.get(get_type, function (result) {
            cb(result[d_type]);
        });
    }

    deleteOldest(d_type, val){
        var obj = {};
        obj[d_type] = val;
        chrome.storage.local.get(obj, function(results){
            var data = results[d_type];

            // remove the item at index 0 (which is the oldest)
            data.splice(0, 1);
            chrome.storage.set(data, function(){
                console.log(" Deleted the oldest item from type ", val);
            })

        });
    }

    delete(keyArr){
        chrome.storage.local.remove(keyArr,function(){
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
        })
    }

    deleteAll(){

        var _this = this;

        // settings should persist
        chrome.storage.local.get([STORAGE_KEYS.settings], function(r){
            var settings_data = r[STORAGE_KEYS.settings];

            chrome.storage.local.clear(function(){
                var error = chrome.runtime.lastError;
                if (error) {
                    console.error(error);
                }
            });

            var obj = {};
            obj[STORAGE_KEYS.settings] = settings_data;

            _this.save_basic(obj);

        })
        
    }
}