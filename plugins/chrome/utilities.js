function getCurrentTime(unix_timestamp){
    var date = new Date(unix_timestamp);

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
    var date = new Date(obj.time);
    return date.getHours().toString() + "_" + date.getMinutes().toString() + "_" + date.getSeconds().toString();
}

function getElapsedTime(start_time, end_time){

    var diff = end_time - start_time;
    var ms = diff % 1000;
    diff = (diff - ms) / 1000;
    var ss = diff % 60;
    diff = (diff - ss) / 60;
    var mm = diff % 60;
    diff = (diff - mm) / 60;
    var hh = diff % 24;
    days = (diff - hh) / 24;

    var formatted_hh = ("0" + hh).slice(-2).toString();
    var formatted_mm = ("0" + mm).slice(-2).toString();
    var formatted_ss = ("0" + ss).slice(-2).toString();
    var formatted_ms = ("0" + ms + "0").slice(-3).toString();

    return formatted_hh + ":" + formatted_mm + ":" + formatted_ss + "," + formatted_ms;
    
}

function testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
};

function wordWrap(str, maxWidth) {
    var newLineStr = "\n"; done = false; res = '';
    while (str.length > maxWidth) {                 
        found = false;
        // Inserts new line at first whitespace of the line
        for (i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(str.charAt(i))) {
                res = res + [str.slice(0, i), newLineStr].join('');
                str = str.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('');
            str = str.slice(maxWidth);
        }

    }

    return res + str;
}

function createSRTContent(arr_transcription, meeting_start_time){

    var content = "";
    var counter = 0;

    // create srt file with name origin.srt
    arr_transcription.forEach(function(td){
        content += counter + "\n";

        var start_time = td["start_time"];
        var end_time = td["end_time"];

        var transcription_start = getElapsedTime(meeting_start_time, start_time);
        var transcription_end = getElapsedTime(meeting_start_time, end_time);


        content += transcription_start + "-->" + transcription_end;
        content += "\n";

        // srt file titles need to word wrap at 32 character (we are using 30)
        var transcription = wordWrap(td["transcription"], 30);

        content += transcription;
        content += "\n\n";

        counter += 1;

    });


    return content;

}

function createInputJSON(combined_arr, meeting_start_time, meeting_id, conv_id){
    var json = {
      "meeting_id": meeting_id,
      "conv_id": conv_id,
      "start_time": meeting_start_time,
      "end_time": new Date().getTime(),
      "notes":  combined_arr.map(function(obj){
        return {
            "event_time": obj["time"],
            "content": obj["content"],
            "type": obj["type"]
        }
      })
    }

    return json;
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

    var valid_data_types = ["notes", "bookmark", "image", "transcription", "meeting_start_time", "meeting_number" , "conv_id"];

    // get the notes, bookmark and image data
    chrome.storage.local.get(valid_data_types, function(result){

        var arr_notes = result[valid_data_types[0]] || [];
        var arr_bookmark = result[valid_data_types[1]] || [];
        var arr_images = result[valid_data_types[2]] || [];
        var arr_transcription = result[valid_data_types[3]] || [];

        var meeting_start_time = result[valid_data_types[4]];
        var meeting_number = result[valid_data_types[5]];
        var conv_id = result[valid_data_types[6]];

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


        var notes_content = "";
        combined_data_arr.forEach(function(obj){

            if (obj["type"] == valid_data_types[0]){
                notes_content += getCurrentTime(obj.time) + "\n" + obj.content + "\n\n";
            }
            else if (obj["type"] == valid_data_types[1]){

                // filter for host
                var host_bookmark = obj.content.filter(function(obj){
                    return obj["origin"] == "host";
                });

                var guest_bookmark = obj.content.filter(function(obj){
                    return obj["origin"] == "guest";
                });

                if (!host_bookmark.length && !guest_bookmark.length){
                    notes_content += getCurrentTime(obj.time) + "\n" +obj.content[0].content + "\n\n";
                }
                else {
                    
                    notes_content += getCurrentTime(obj.time) + "\n";

                    if (host_bookmark.length){
                        notes_content +=  "Host :" ;
                        host_bookmark.forEach(function(d){
                            notes_content += d.content;
                        });
                    }

                    if (guest_bookmark.length){
                        notes_content += "\n";
                        notes_content += "Guest :" ;
                        guest_bookmark.forEach(function(d){
                            notes_content += d.content;
                        });
                    }

                    notes_content += "\n\n";

                }
                
            }
            else if (obj["type"] == valid_data_types[2]){
                notes_content += getCurrentTime(obj.time) + "\n" + "images/" + imageFileName(obj) +".jpeg" + "\n\n";
            }
            
        })

        var transcription_data_host = arr_transcription.filter(function(obj){ return obj["origin"] == "host"});
        var transcription_data_guest = arr_transcription.filter(function(obj){ return obj["origin"] == "guest"});


        if (transcription_data_host.length){
            var srt_content_host = createSRTContent(transcription_data_host, meeting_start_time)
            zip.file("host.srt", srt_content_host);
        }

        if (transcription_data_guest.length){
            var srt_content_guest = createSRTContent(transcription_data_guest, meeting_start_time)
            zip.file("guest.srt", srt_content_guest);
        }

        var json_data = createInputJSON(combined_data_arr, meeting_start_time , meeting_number, conv_id);

        zip.file("input.json", JSON.stringify(json_data));
       

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