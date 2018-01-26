
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

function getRequestParams(uri, eq,sep) {
    if (!eq) eq = "=";
    if (!sep) sep = "&";
    console.log("Extract requests params from ", uri);
    var vars_parts = uri.split(sep);
    var vars = [];
    for (var i = 0; i < vars_parts.length; i++) {
        var p = vars_parts[i].split(eq);
        var k = p[0];
        var v = p.length > 1 ? p[1] : true;
        console.log("Found ", k, "=", v);
        vars[k] = v;
    }   
    return vars;
}

function isSane(tx) {
    var regex = new RegExp("[^a-z0-9!$#?=\\-_ @:]","gi");
    var res=regex.test(tx);
    if (res) console.log(tx, " is not sane");
    else console.log(tx, "is sane");
    return !res;
}

function loadQr() {
    if (!document.location.hash.startsWith("#qr:")) {
        document.getElementById("qr").classList.remove( "target");
        return;
    }
    document.getElementById("qr").getElementsByClassName("disclaimer")[0].style.display = "none";
    document.getElementById("qr").getElementsByClassName("qrcode_info")[0].innerHTML = "... Loading ...";
    
  

    var jquery = document.createElement("script"); 
    jquery.src = "https://code.jquery.com/jquery-3.3.1.min.js"; 
    //jquery.integrity = "sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="; 
    jquery.crossorigin = "anonymous";     
    document.head.appendChild(jquery);
    jquery.onload = function () {
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js";
        //script.integrity = "sha256-9MzwK2kJKBmsJFdccXoIDDtsbWFh8bjYK/C7UjB1Ay0=";
        script.crossorigin = "anonymous";
        document.head.appendChild(script);
        script.onload=function () {
            $("#qr").addClass("target");
            console.log("Generate QR");

            if (!isSane( document.location.hash)) {
                $("#qr .qrcode_info").html("Error, wrong request");
                return;
            }

            var vars = document.location.hash.substring("#qr:".length);
            vars=getRequestParams(vars,"$","!");

            var text = vars["text"];
            var who = vars["who"];

            if (!who) who = "Someone";

            if (text == undefined) {
                console.log("text is undefined");
                $("#qr .qrcode_info").html("Error, wrong request");

            } else {
                
                var coin="coins"
                var amount = "some";
                var address = text;
                var t = text.indexOf("?");
                if ( t!= -1) {
                    var payment_params = getRequestParams(text.substring(t+1));    
                    amount = payment_params["amount"];
                }
                t = text.indexOf(":");
                if (t!=-1) {
                    coin = text.substring(0,t);
                }
                if (t != -1) {
                    address = text.substring(t + 1);
                    t = address.indexOf("?");
                    if(t!=-1)   address=address.substring(0,t);
                }

                
           

                console.log("who", who, "text", text);

                $("#qr .qrcode_info").html(who+" wants you to send "+amount+" "+coin+" to "+address);
                var qrcode = $("#qr .qrcode");
                $("#qr .disclaimer").show();

                qrcode.empty().qrcode({
                    render: 'div',
                    "text": text,
                    fill: '#182028'
                });
           
            }
        };
    }    
}

function main() {
    console.log("Start");
    if (location.hash === '') {
        location.hash = 'About'
    } else {
        loadQr();
        window.scrollTo(0, 0);   
    }
    updateStatus();
    setInterval(updateStatus, 6000);   
    window.onhashchange = function () {
        window.scrollTo(0, 0);
        loadQr();
    };
}