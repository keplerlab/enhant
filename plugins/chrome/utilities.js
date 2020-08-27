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