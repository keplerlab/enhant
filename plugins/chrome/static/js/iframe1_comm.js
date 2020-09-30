window.addEventListener("message", function(m){
    console.log(" received message from frame 2 ", m);
});

// sends message to frame 2 using id
window.parent.postMessage(
    {
        "id": "frame2", 
        "message": "This is the message from enhant frame to"
    }, "*")