//chrome script to notify page load  - This will eventually load enhant content
chrome.runtime.sendMessage({msg: "page-loaded"}, function(response){
    console.log(" Status for notify upload ", response);
});