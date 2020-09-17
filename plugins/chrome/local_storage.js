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
    host: "host"
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