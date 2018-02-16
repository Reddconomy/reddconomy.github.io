function loading(v) {
    var loading=document.getElementById("loading");
    loading.style.display = v ? "table" : "none";
}

function isElementVisible(el) {
    var rect = el.getBoundingClientRect();
    return rect.height > 0&&rect.width > 0;
}


//From https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (rect.bottom >= 0 && rect.right >= 0
        && rect.top <= (window.innerHeight
            || document.documentElement.clientHeight)
        && rect.left <= (window.innerWidth || document.documentElement.clientWidth));
}

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

            var statusel = server.getElementsByClassName("status")[0];
            var descel = server.nextElementSibling;
            statusel.innerHTML = '<i class="loading fa fa-cog fa-spin fa-3x fa-fw"></i>';

            status(ip, port, function (status) {
                console.log("Status of ", ip, port, ":", status);
                var s=genStatusHtml(status);
                statusel.innerHTML = s.status;
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
    var regex = new RegExp("[^a-z0-9.!$#?=\\-_%& @:]","gi");
    var res=regex.test(tx);
    if (res) console.log(tx, " is not sane");
    else console.log(tx, "is sane");
    return !res;
}

var Dependencies = {};

function loadQrCodes() {
    console.log("Load qr codes");
    var qrcodes_s = document.getElementsByClassName("blockchain_addr");
    var qrcodes = [];
    for (var i = 0; i < qrcodes_s.length; i++) {
        if (isElementVisible(qrcodes_s[i])) {
            qrcodes.push(qrcodes_s[i]);   
        }
    }
    console.log("Found ", qrcodes_s.length, "qr codes of which ", qrcodes.length, "are visible");
    if (qrcodes.length == 0 && !document.location.hash.startsWith("#qr:")) return;
    
    
    console.log("Generate qr codes");
    
    loading(true);

    document.getElementById("qr").getElementsByClassName("disclaimer")[0].style.display = "none";
    document.getElementById("qr").getElementsByClassName("qrcode_info")[0].innerHTML = "... Loading ...";

    var _onload = function () {
        loading(true);

        Dependencies.jquery_qr = true;
        $("a.blockchain_addr").each(function () {
            var addr = $(this);
            if (addr.attr("original_content")) {
                addr.html(addr.attr("original_content"));
            }
            var href = addr.attr("href");
            var old_content = addr.html();
            addr.attr("original_content", old_content);
            console.log("Generate qr for", href);
            addr.empty().qrcode({
                render: 'div',
                text: href,
                fill: '#182028',
            });
            var tx = $("<span></span>");
          
            tx.html("<br/>" + old_content + "<hr />");
            addr.append(tx);
        });

        loading(false);
        loadQrGen();
    };

    var _on_jquery_load = function () {
        console.log("Load JQueryQR");
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js";
        //script.integrity = "sha256-9MzwK2kJKBmsJFdccXoIDDtsbWFh8bjYK/C7UjB1Ay0=";
        script.crossorigin = "anonymous";
        document.head.appendChild(script);
        script.onload = function () {
            Dependencies.jquery = true;
            _onload();
        };
    };

    if (Dependencies.jquery) {
        console.log("JQuery already loaded");
        if (Dependencies.jquery_qr) {
            console.log("JQueryQR already loaded");
            _onload();
        } else {
            _on_jquery_load();
        }
    } else {
        console.log("Load JQuery");
        var jquery = document.createElement("script");
        jquery.src = "https://code.jquery.com/jquery-3.3.1.min.js";
        //jquery.integrity = "sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="; 
        jquery.crossorigin = "anonymous";
        document.head.appendChild(jquery);
        jquery.onload = function () {
            _on_jquery_load();
        };
    };


}

function loadQrGen() {
    document.getElementById("qr").getElementsByClassName("disclaimer")[0].style.display = "none";
    document.getElementById("qr").getElementsByClassName("qrcode_info")[0].innerHTML = "... Loading ...";


    if (!document.location.hash.startsWith("#qr:")) {
        document.getElementById("qr").classList.remove("target");
        return;
    }
    loading(true);

    $("#qr").addClass("target");
    console.log("Generate QR");

    if (!isSane(document.location.hash)) {
        $("#qr .qrcode_info").html("Error, wrong request");
        loading(false);
        return;
    }

    var vars = document.location.hash.substring("#qr:".length);
    vars = getRequestParams(vars, "$", "!");

    var text = vars["text"];
    var who = vars["who"];

    if (!who) who = "Someone";

    if (text == undefined) {
        console.log("text is undefined");
        $("#qr .qrcode_info").html("Error, wrong request");
        loading(false);
    } else {
        var coin = "coins"
        var amount = "some";
        var address = text;
        var t = text.indexOf("?");
        if (t != -1) {
            var payment_params = getRequestParams(text.substring(t + 1));
            if (payment_params["amount"]) amount = payment_params["amount"];
        }
        t = text.indexOf(":");
        if (t != -1) {
            coin = text.substring(0, t);
        }
        if (t != -1) {
            address = text.substring(t + 1);
            t = address.indexOf("?");
            if (t != -1) address = address.substring(0, t);
        }




        console.log("who", who, "text", text);

        $("#qr .qrcode_info").html(who + " wants you to send " + amount + " " + coin + " to " + address);
        var qrcode = $("#qr .qrcode");
        $("#qr .disclaimer").show();

        qrcode.empty().qrcode({
            render: 'div',
            "text": text,
            fill: '#182028'
        });
        loading(false);

    }

}

var _ORIGINAL_TITLE = undefined;
function updateTitle(){
    if (!_ORIGINAL_TITLE) _ORIGINAL_TITLE = document.title;
    if (location.hash !== "#About") {
        document.title = document.title.split("~")[0] + " ~ " + location.hash.substring(1);
    } else {
        document.title = _ORIGINAL_TITLE;   
    }
}
var _VIDEOS = [];



function main() {
   
    var noscripts = document.getElementsByClassName("noscript");
    for (var i = 0; i < noscripts.length; i++)  noscripts[i].style.display = "none";

    
    /// VIDEO lazyload
    console.log("Init lazyload");
    var videos = document.getElementsByTagName("video");
    console.log("Found", videos.length, "videos");
    for (var i = 0; i < videos.length; i++) {
        console.log("Turn ", videos[i], "to lazyload");
        _VIDEOS.push({ status: false, video: videos[i] });
        videos[i].pause();
    }

    
    var onVisibilityChange = function () {
        var playing = 0;

        for (var i = 0; i < _VIDEOS.length; i++) {
            var video = _VIDEOS[i];
            var status = isElementInViewport(video.video);
            if (status != video.status) {
                video.status = status;
                var visible = video.status;
                if (visible) {
                    console.log("Play", video);
                    video.video.play();
                } else {
                    console.log("Pause", video);
                    video.video.pause();
                }
            }
            if (video.status) playing++;
        }
        console.log("Videos playing", playing);
    };

    if (window.addEventListener) {
        addEventListener('DOMContentLoaded', onVisibilityChange, false);
        addEventListener('load', onVisibilityChange, false);
        addEventListener('scroll', onVisibilityChange, false);
        addEventListener('resize', onVisibilityChange, false);
    } else if (window.attachEvent) {
        attachEvent('onDOMContentLoaded', onVisibilityChange);
        attachEvent('onload', onVisibilityChange);
        attachEvent('onscroll', onVisibilityChange);
        attachEvent('onresize', onVisibilityChange);
    }

    ///

    console.log("Start");
    if (location.hash === '') {
        location.hash = 'About'
        loading(false);
    }

    updateTitle();
    loading(false);
    loadQrCodes();
    window.scrollTo(0, 0);   
    
    updateStatus();
    setInterval(updateStatus, 6000);   
    var dij98sj=window.onhashchange;

    window.onhashchange = function () {
        updateTitle();
        loading(false);
        window.scrollTo(0, 0);
        loadQrCodes();
        if (dij98sj) dij98sj();
    };


    
}
if (document.readyState !== "loading") {
    console.log("Document ready");
    main();
}else {
    console.log("Document still loading...", document.readyState);
    document.addEventListener('DOMContentLoaded', function() {
        main();
    }, false);
}
