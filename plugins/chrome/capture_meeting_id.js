const PLATFORMS = ["ZOOM", "TEAMS",];

// one-to-one maaping with PLATFORMS
const PLATFORM_DATA = [
    {
        "host_url_has" : "zoom.us",
    },
    {
        "host_url_has" : "teams.microsoft.com",
    }
];


class CaptureMeetingData{
    constructor(){

        // current platform index (-1 is not supported)
        this.current_platform_index = -1;

        this.meeting_number = null;

        // defult to 0 means not detected
        this.SUPPORTED_PLATFORMS = PLATFORMS
        this.PLATFORM_DATA = PLATFORM_DATA
    }

    getHostName(){
        return window.location.hostname;
    }

    getURL(){
        return window.location.href
    }

    resolve_platform(){
        var _this = this;
        var hostname = _this.getHostName();

        _this.SUPPORTED_PLATFORMS.forEach(function(platformName, index){
            if (hostname.includes(_this.PLATFORM_DATA[index]["host_url_has"])){
                _this.current_platform_index = index;
            }
        })
    }

    generateMeetingNumber(){
        var _this = this;
        console.log(" current platform index ", _this.current_platform_index, 
        _this.SUPPORTED_PLATFORMS[_this.current_platform_index])
        switch(_this.current_platform_index){
            case 0: 
                _this.generateMeetingNumberForZoom();
                break;
            case 1:
                _this.generateMeetingNumberForTeams();
                break;
            default:
                _this.generateDefaultMeetingNumber();
                break;
        }
    }

    generateDefaultMeetingNumber(){
        this.meeting_number = this.generateRandomTenDigitNumber();
        return this.meeting_number;
    }

    generateRandomTenDigitNumber(){

        // generate a random string of 10 characters
        var random10digitnumber = Math.floor(1000000000 + Math.random() * 1000000000);
        return random10digitnumber.toString();
    }

    generateMeetingNumberForTeams(){
        var url = this.getURL();

        // assumig the meeting id hash is between these 2 substrings
        var firstMatch = "meeting_";
        var secondMatch = "thread.v2";

        var match = url.match(new RegExp(firstMatch + "(.*)" + secondMatch));

        console.log(" match is : ", match);

        try {
            if (match.length == 2){
                this.meeting_number = match[1];
            }
            else{
                this.meeting_number = this.generateRandomTenDigitNumber();
            }
        }
        catch(err){
            console.log("Received error: ", err);
            this.meeting_number = this.generateRandomTenDigitNumber();
            console.log("Generatig a 10 digit random number as the meeting number : ", this.meeting_number);
        }

        return this.meeting_number;

    }

    sendMeetingNumber(){
        var _this = this;

        chrome.runtime.sendMessage({msg: "meeting_number_info", data: _this.meeting_number}, 
        function(response){
            console.log(response.status);
        })
    }

    generateMeetingNumberForZoom(){

        var url = this.getURL();

        const regex_pattern = /\d{11}|\d{10}/;
        var meeting_number_match = url.match(regex_pattern);

        try {
            if (meeting_number_match.length == 1){
                this.meeting_number = meeting_number_match[0];
            }
            else{
                this.meeting_number = this.generateRandomTenDigitNumber();
            }
        }
        catch(err){
            console.log("Received error: ", err);
            this.meeting_number = this.generateRandomTenDigitNumber();
            console.log("Generatig a 10 digit random number as the meeting number : ", this.meeting_number);
        }

        return this.meeting_number;
    }

    getInfo(){
        this.resolve_platform();
        this.generateMeetingNumber();
        this.sendMeetingNumber();
    }

}

console.log(" Loading Capturing Meeting data content script. ")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" Received message from popup script [Capturing Meeting Data] : ", message);

    if (message.msg == "start"){

        var meeting_info = new CaptureMeetingData();
        meeting_info.getInfo();

        sendResponse({status: true});
    }

    if (message.msg == "stop"){

        sendResponse({status: true});
    }

})