console.log(" Restrict URL background script added");
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
          new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostPrefix: 'teams.microsoft.com'},
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostContains: 'zoom.us'},
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostPrefix: 'meet.jit.si'},
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostContains: 'youtube.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
});