//chrome script to notify page load  - This will eventually load enhant content
window.onload = function(e){
    chrome.runtime.sendMessage({msg: "page-loaded"}, function(response){
        console.log(" Status for notify upload ", response);
    });
}
