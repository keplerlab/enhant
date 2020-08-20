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
class EnhantLocalStorage{

    constructor(){
        this.time = "time";
        this.content = "content";
        this.type = "type";
    }

    generateUnixTimestamp(){
        return Math.round(new Date().getTime()/1000);
    }

    generate_data_obj(data){
        var storage_obj = {};
        storage_obj[this.time] = this.generateUnixTimestamp();
        storage_obj[this.content] = data;

        return storage_obj;
    }

    save_basic(obj){
        chrome.storage.local.set(obj, function(){
            console.log("Object saved into local storage: ", obj);
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

    read(d_type, cb){

        var get_type = {};
        get_type[d_type] = [];

         // by passing an object you can define default values e.g.: []
         chrome.storage.local.get(get_type, function (result) {
            cb(result[d_type]);
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
        chrome.storage.local.clear(function(){
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
        })
    }
}

var enhant_local_storage_obj = new EnhantLocalStorage();

function getCurrentTime(unix_timestamp){
    var date = new Date(unix_timestamp * 1000);

    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var yy = date.getFullYear();

    var HH = date.getHours();
    var MM = date.getMinutes();
    var SS = date.getSeconds();
    return [yy.toString(), mm.toString(), dd.toString()].join("/") + " " + 
    [HH.toString(), MM.toString(), SS.toString()].join(":")
}

function imageFileName(obj){
    var date = new Date(obj.time * 1000);
    return date.getHours().toString() + "_" + date.getMinutes().toString() + "_" + date.getSeconds().toString();
}

function zipFileName(){
    var date = new Date();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var yy = date.getFullYear();

    var HH = date.getHours();
    var MM = date.getMinutes();
    var SS = date.getSeconds();

    return "enhant_" + [yy.toString(), mm.toString(), dd.toString()].join("") + "_" + 
    [HH.toString(), MM.toString(), SS.toString()].join("")
}

function urlToPromise(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function downloadZip(cb){
    var zip = new JSZip();

    var valid_data_types = ["notes", "bookmark", "image"];

    // get the notes, bookmark and image data
    chrome.storage.local.get(valid_data_types, function(result){

        var arr_notes = result[valid_data_types[0]] || [];
        var arr_bookmark = result[valid_data_types[1]] || [];
        var arr_images = result[valid_data_types[2]] || [];

        var combined_data_arr = [];

        var arr_notes = result[valid_data_types[0]] || [];
        arr_notes.forEach(function(obj){
            obj["type"] = valid_data_types[0];
            combined_data_arr.push(obj);
        })

        var arr_bookmark =  result[valid_data_types[1]] || [];
        arr_bookmark.forEach(function(obj){
            obj["type"] = valid_data_types[1];
            combined_data_arr.push(obj);
        })

        var arr_images = result[valid_data_types[2]] || [];
        arr_images.forEach(function(obj){
            obj["type"] = valid_data_types[2];
            combined_data_arr.push(obj);
        })

        // sort combined array in descending order
        combined_data_arr.sort(function(a, b){
            var keyA = new Date(a.time*1000);
            var keyB = new Date(b.time*1000);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        })


        var notes_content = "Datetime\t\t\t" + "Notes\n\n";
        combined_data_arr.forEach(function(obj){

            if (obj["type"] == valid_data_types[0]){
                notes_content += getCurrentTime(obj.time) + "\t\t" + obj.content + "\n";
            }
            else if (obj["type"] == valid_data_types[1]){
                notes_content += getCurrentTime(obj.time) + "\t\t" + "Bookmarked Moment" + "\n";
            }
            else if (obj["type"] == valid_data_types[2]){
                notes_content += getCurrentTime(obj.time) + "\t\t" + "images/" + imageFileName(obj) +".jpeg" + "\n";
            }
            
        })

        // create text file for notes
        zip.file("notes.txt", notes_content);

        var img = zip.folder("images");

        arr_images.forEach(function(obj){
            img.file(imageFileName(obj) + ".jpeg", urlToPromise(obj.content), {binary:true});
        })

        var zipfilename = zipFileName() + ".zip";

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            saveAs(content, zipfilename);

            // run the callback function
            cb();
        });

    })

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        
        if (request.msg == "capture_tab"){
            
            chrome.tabs.captureVisibleTab(
                null,
                {},
                function(dataUrl)
                {
                    var d_type = "image";

                    // save message to local storage 
                    var obj_to_add = enhant_local_storage_obj.generate_data_obj(dataUrl);
                    enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                        console.log("Local storage updated with obj : ", obj_to_add);
                    })

                    // add to local storage
                    sendResponse({data:obj_to_add});
                }
            );
        }

        if (request.msg == "save_bookmark"){
            var d_type = "bookmark";

            var obj_to_add = enhant_local_storage_obj.generate_data_obj(request.data);
            enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                console.log("Local storage updated with obj : ", obj_to_add);
                
                // add to local storage
                sendResponse({data:obj_to_add});
            });

        }

        if (request.msg == "save_notes"){
            var d_type = "notes";

            var obj_to_add = enhant_local_storage_obj.generate_data_obj(request.data);
            enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                console.log("Local storage updated with obj : ", obj_to_add);

                // add to local storage
                sendResponse({data:obj_to_add});
            });

        }

        if (request.msg == "start"){
            var obj = {"tab_id": request.data};

            enhant_local_storage_obj.save_basic(obj)
        }

        if (request.msg == "stop"){
            downloadZip(function(){
                enhant_local_storage_obj.deleteAll();
            });
        }
        
        return true;
    }
);

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    
    // chrome.runtime.sendMessage({msg: "download_zip", data: null}, function(response) {
    // });

    chrome.storage.local.get(["tab_id"], function(result){

        console.log(" tab id matching ", result["tab_id"], tabId);

        if (result["tab_id"]){

            if (result["tab_id"] == tabId){
                downloadZip(function(){
                
                    // clear all the data
                    enhant_local_storage_obj.deleteAll();
                });
            }

        }
        else {
            // clear all the data
            enhant_local_storage_obj.deleteAll();
        }

    })

});