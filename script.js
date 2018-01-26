
function genStatusHtml(status) {

    var online = status.online;
    var s = "<span class='" + (online ? "bold online" : "offline") + "'>";
    
    var description = "";
    if (online) {
        var players = status.players.now + "/" + status.players.max;
        description += "<ul>";
        description+="<li class='bold'>"+status.motd+"</li>";
        description += "<li>Online players: <span class='bold'> " + players + "</span></li>";
        description+="<li>Server version: "+status.server.name+" - Protocol: "+status.server.protocol+"</li>";
        description += "</ul>";        
    }
    return {
        "status": s,
        "description":description
    };

}

function status(ip,port,callback) {
    var url="https://mcapi.us/server/status?ip="+ip+"&port="+port
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var resp = JSON.parse(this.responseText);
            callback(resp);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function updateStatus() {
    var servers = document.getElementsByClassName("server");
    for (var i = 0; i < servers.length; i++) {
        (function(){
            var server = servers[i];
            var ip = (server.getElementsByTagName("td")[0].innerHTML).split(":");
            var port = ip[1];
            ip = ip[0];
            console.log("Check status of " + ip + " " + port);
            status(ip, port, function (status) {
                console.log("Status of ", ip, port, ":", status);
                var statusel = server.getElementsByClassName("status")[0];
                var s=genStatusHtml(status);
                statusel.innerHTML = s.status;
                descel = server.nextElementSibling;
                if (s.description === "") {
                    descel.style.display = "none";
                } else {
                    descel.style.display = "table-row";
                    descel.getElementsByTagName("td")[0].innerHTML = s.description;
                }

                console.log("Update" , server);
            });
        } ());    
    }
}
function main() {
    console.log("Start");
    if(location.hash==='')location.hash='About'
    updateStatus();
    setInterval(updateStatus, 6000);   
    window.onhashchange = function () {
        window.scrollTo(0, 0);
    };
    window.scrollTo(0, 0);

}