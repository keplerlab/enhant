class SocketPool{
    constructor(){
        this.sockets = [];
    }

    clear(){
        this.sockets = [];
    }

    addSocketToPool(socket){
        this.sockets.push(socket);
    }

    getPool(){
        return this.sockets;
    }
    

}

class socketFactory{
    
    constructor(ip, port, name){

        this.ip = ip;
        this.port = port;
        this.name = name;
        this.socket = null;
        this.reconnectTimeInSec = 1; 
        this.should_reconnect = true;
    }

    doReconnect(state){
        this.should_reconnect = state;
        console.log(" should reconnect ? ", this.should_reconnect);
    }

    create(){
        this.socket = new WebSocket('wss://' + this.ip + ':' + this.port);
    }

    reconnect(open_cb=null, close_cb=null){
        console.log(" Socket connection closed ... reconnecting again ");
        return this.generateSocket(open_cb, close_cb, true);
    }

    setup(open_cb, close_cb, socket_got_closed){
        var _this = this;
        this.socket.onopen = function(){
            console.log("Connection established - [" + _this.name + "]");

            if (!(open_cb == null)){
                open_cb();
            }

            if (socket_got_closed){
                if (!(close_cb == null)){
                    close_cb(_this.socket);
                }
            }
            
        }

        this.socket.onclose = function(event) {

            if (_this.should_reconnect){
                
                setTimeout(function(){
                    var new_socket = _this.reconnect(open_cb=open_cb, close_cb=close_cb);
                }, _this.reconnectTimeInSec *  1000);
            }
        }

        this.socket.onerror = function(error) {
            console.log(`[error.socket.%s] ${error.message}` % _this.name);
        };
    }

    generateSocket(open_cb=null, close_cb=null, socket_got_closed=false){
        this.create();
        this.setup(open_cb, close_cb, socket_got_closed);
        return this.socket;
    }

    
}