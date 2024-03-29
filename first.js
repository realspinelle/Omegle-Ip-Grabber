jQuery.noConflict();
var $ = jQuery;

var startOmegleIpGrabber = (APIKEY1, APIKEY2) => {
    window.oRTCPeerConnection = window.oRTCPeerConnection || window.RTCPeerConnection;

    window.RTCPeerConnection = function(...args) {
        const pc = new window.oRTCPeerConnection(...args);
    
        pc.oaddIceCandidate = pc.addIceCandidate;
    
        pc.addIceCandidate = function(IceCandidate, ...rest) {
            const fields = IceCandidate.candidate.split(" ");
            const ip = fields[4];
            if (fields[7] == "srflx") {
                getLocation(ip);
            }
            return pc.oaddIceCandidate(IceCandidate, ...rest);
        };
        return pc;
    }
    
    var bloquedtimer = false;
    
    const getLocation = async (ip) => {
        const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${APIKEY1}&ip=${ip}`;
        const url2 = `https://ipgeolocation.abstractapi.com/v1/?api_key=${APIKEY2}&ip_address=${ip}`;
        let result = {};
        try {
            fetch(url).then(function(res) {
                res.json().then((json) => {
                    result[1] = json;
                    if (bloquedtimer == false) {
                        bloquedtimer = true;
                        fetch(url2).then(function(res) {
                            res.json().then((json) => {
                                result[2] = json;
                                ReDoTheUI(result);
                            });
                        });
                        setTimeout(() => {
                            bloquedtimer = false;
                        }, 2500);
                    }
                });
            });
        } catch (error) {
            //console.error(error);
        }
    };
    
    const ReDoTheUI = (res) => {
        let infosHTML = "";
        let logwrapper = document.getElementsByClassName("logwrapper")[0];
    
        document.getElementById("header").innerHTML = "";
        document.getElementById("videologo").src = res[1].country_flag;
        document.getElementById("videologo").height = 90;
    
        let chatbox = logwrapper.firstChild;
    
        chatbox.firstChild.style = "position: relative; min-height: 50%;";
    
        let infos = document.createElement('div');
        infos.style = "position: relative;";//min-height: 50%;";
        infosHTML += `Ip : ${res[1].ip}`
        infosHTML +=  `<br>`
        infosHTML += `Pays : ${res[1].country_name} - ${res[2].country}`
        infosHTML +=  `<br>`
        infosHTML += `Ville : ${res[1].city} - ${res[2].city}`
        infosHTML +=  `<br>`
        infosHTML += `Opérateur : ${res[1].organization} - ${res[2].connection.autonomous_system_organization}`
        infosHTML +=  `<br>`
        if (typeof res[2].connection.connection_type != "undefined"){
            infosHTML += `<p style="color:red;">/!\\ ${res[2].connection.connection_type} /!\\<p>`
            infosHTML +=  `<br>`
        }
        infosHTML += `<a target="_blank" href="https://www.google.com/search?q=${res[2].latitude}+,+${res[2].longitude}">GoogleMaps</a>`
        infosHTML +=  `<br>`
        infos.innerHTML = infosHTML;
    
        chatbox.append(infos);
    };
}
