//http://www.alistapart.com/articles/alternate/

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(deviceObject) {
    deviceObject == deviceObject || device;
    var deviceStyleToEnable = getDeviceStyle(deviceObject);

    applyStyle(deviceStyleToEnable);  
}

var getDeviceStyle = function (deviceObject) {
    if (!deviceObject) return 'unknown';
    if (!deviceObject.platform) return 'unknown';

    var thePlatform = deviceObject.platform.toLowerCase();
    if (thePlatform.indexOf("iphone") > -1 ||
        thePlatform.indexOf("ipad") > -1) {
        return 'ios';
    } else {
        return 'unknown';
    }
};

var applyStyle = function(styleName) {
    var i, a;
    for (i = 0; (a = document.getElementsByTagName("link")[i]) ; i++) {
        if (a.getAttribute("rel").toLowerCase().indexOf("style") != -1 && a.getAttribute("title")) {
            a.disabled = a.getAttribute('title').toLowerCase() !== styleName.toLowerCase();
        }
    }
};
