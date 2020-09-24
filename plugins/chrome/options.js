class SettingsURL{
    constructor(){
        this.MESSAGES = {
            fetchSettings: "get-settings",
            addURLs: "add-urls"
        }

        this.initialURL = [
            "https://www.youtube.com"
        ]

        this.delete_icon_cls = "delete-icon";
        this.table_body_cls = "whitelisted-sites-tbody";
        this.submit_url_id = "submit-url";
        this.input_url_id = "url-to-add";

        this.notification_container_cls  = "notification";
        this.notification_msg_cls = "notification-msg";

        this.modal_id = "myModal";
        this.modal_submit_id = "modal-submit";
        this.modal_title_cls = "modal-title";

        this.entered_url = '';
        this.remove_url_obj = {};

        this.delete_action_registered = false;
    }

    getHostName(url){
        var hostname =  url.match(/^(.*:)\/\/([A-Za-z0-9\-\.]+)/)[2];
        return hostname;
    }

    cryptHostName(url) {
        var hostname = this.getHostName(url);
        return hostname.replace(/\./g,'-')
    }

    decryptHostName(id){
        return id.replace(/-/g, ".")
    }

    removeURL(obj){
        var _this = this;
        $("#" + obj.id).closest("tr").remove();

        var obj = {
            msg: "remove-url",
            data: obj.url
        }

        _this.sendMessageToBackground(obj, function(response){
            
            if (response.status){
                console.log(" removed urls : " , response);
                var text = "You can no longer use enhant on " + response.url_removed;
                _this.showNotificationMessage(text, 3);
            }
        })
    }

    registerModalEvent(){
        var _this = this;
        $('#' + _this.modal_submit_id).click(function(evt){
            _this.removeURL(_this.remove_url_obj);
        });
    }

    registerDeleteEvent(){
        var _this = this;
        $(document).on("click", "." + _this.delete_icon_cls ,function(evt){

            // remove item from the list
            var id = $(evt.target).attr('id');
            _this.remove_url_id = id;
            var url = $(evt.target).attr('url');
            var is_default = $(evt.target).attr('default') == "true" ? true : false;

            // set the remoe url info
            _this.remove_url_obj = {
                url: url,
                default: is_default,
                id: id
            }

            if (is_default){
                _this.showModalForDefaultURls(_this.remove_url_obj);
            }
            else{
                _this.removeURL(_this.remove_url_obj);
            }
            
        });
    }

    showNotificationMessage(msg, time_in_sec){
        var _this = this;
        $("." + _this.notification_msg_cls).text(msg);
        $("." + _this.notification_container_cls).show();
        setTimeout(function(){
            $("." + _this.notification_container_cls).hide();
            $("." + _this.notification_msg_cls).text("");
        }, time_in_sec * 1000);
    }

    showModalForDefaultURls(obj){

        $('#'+ this.modal_id).show();
        $('.' + this.modal_title_cls).text("Remove " + obj.url + "?");
        $('#' + this.modal_id).modal('show');
    }

    registerEvents(){
        var _this = this;

        _this.registerDeleteEvent();
        _this.registerModalEvent();

        $("#" + _this.submit_url_id).click(function(evt){

            // retreive the input value
            var url_to_add = $('#'+ _this.input_url_id).val() || "";
            if (url_to_add.length > 0){
                _this.entered_url = url_to_add;

                try{
                    _this.getHostName(_this.entered_url);
                    _this.saveUrl(url_to_add);
                }
                catch(err){
                    // notify user that url invalid
                    var text = "Not a valid URL. Correct format is http(s)://www.mysite.com or http(s)://mysite.com";
                    _this.showNotificationMessage(text, 3);
                }
                
            }
            else{
                var text = "Enter a valid URL of format http(s)://www.mysite.com or http(s)://mysite.com";
                _this.showNotificationMessage(text, 3);
            }
        })
    }

    sendMessageToBackground(obj, cb){
        chrome.runtime.sendMessage(obj, function(response){
            cb(response);
        })
    }

    updateURLList(obj, show_message){
        var _this = this;
        var html = "<tr>" + 
                "<td><img default='" + obj.default + "' url='" + obj.url + "' class='url-enabled " + 
                _this.delete_icon_cls + "'" + "id='" + _this.cryptHostName(obj.url) + "' src='static/images/delete.svg'></td>" + 
                "<td>" + obj.url + "</td>" +
                "</tr>";
        $('.' + _this.table_body_cls).prepend(html);

        if (show_message){
            var text = "Reload or open " + obj.url + " in the chrome and enhant will appear automatically.";
            _this.showNotificationMessage(text, 3);
        }
    }

    getSettings(cb){
        var _this = this;
        var obj = {msg: "get-settings"}
        this.sendMessageToBackground(obj, function(response){
            console.log(" Current Enhant Settings : " , response);
            cb(response);
        })
    }

    initialize(){
        var _this = this;
        _this.getSettings(function(data){
            var settings = data["settings"];
            if (settings.hasOwnProperty("urls")){
                var urls = settings["urls"];
                urls.forEach(function(obj){
                    _this.updateURLList(obj, false);
                })
            }
        });
    }

    saveUrl(url){
        var obj = {
            msg: "add-url",
            data: url
        }
        var _this = this;

        this.sendMessageToBackground(obj, function(response){
            // console.log(" Added urls : " , response);

            if (response.status){

                // added url as never default
                var obj  = {
                    url: response.url_added,
                    default: false
                }
                _this.updateURLList(obj, true);
            }
            else{
                var text = response.error;
                _this.showNotificationMessage(text, 3);
            }
        })
    }
}

var settingsURL_obj = new SettingsURL();
settingsURL_obj.initialize();
settingsURL_obj.registerEvents();


