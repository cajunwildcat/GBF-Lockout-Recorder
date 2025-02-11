chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" });
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (tab.url.includes("granbluefantasy.jp")) {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			world: "MAIN",
			func: requestIntercept
		}).then(() => {
			//console.log('Script injected successfully.');
		}).catch((error) => {
			//console.error('Script injection failed:', error);
		});
	}
});
chrome.action.onClicked.addListener(function (tab) {
	chrome.windows.create({
		url: chrome.runtime.getURL("popup.html"),
		type: "popup"
	});
});

const requestIntercept = () => {
    if (window.XMLHttpRequest.LockoutMutated) return;
    window.XMLHttpRequest.LockoutMutated = true;

    const oldXHROpen = window.XMLHttpRequest.prototype.open;
    const oldXHRSend = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.open = function (method, url) {
        this._requestUrl = url; // Store the request URL inside the instance
        return oldXHROpen.apply(this, arguments);
    };

    window.XMLHttpRequest.prototype.send = function () {
        const xhr = this;
        const requestUrl = this._requestUrl || ""; // Retrieve stored URL

        const handleRequestData = (eventType, response = null) => {
            let t = "";
            if (requestUrl.includes("normal_attack_result.json?_")) {
                t = requestUrl.substring(requestUrl.indexOf("?_")).split("&")[1]?.replace("t=", "") || "";
				window.postMessage({ command: "ADD_TIMESTAMP", type: "normal_attack t", time: t }, '*');
            }
        };

        this.addEventListener("load", function () {
			const t = this.responseURL.substring(this.responseURL.indexOf("?_")).split("&")[1].replace("t=", "");
			const responseBody = JSON.parse(this.response);
			if (this.responseURL.includes("start.json")) {
				window.postMessage({ command: "ADD_TIMESTAMP", type: "start.json t", time: t, time2: responseBody.turn_waiting }, '*');
			}
			if (this.responseURL.includes("retry_trialbattle.json")) {
				window.postMessage({ command: "CREATE_NEW_SET" }, '*');
			}
			if (this.responseURL.includes("normal_attack_result")) {
				window.postMessage({ command: "ADD_TIMESTAMP", type: "normal_attack t", time: t }, '*');
			}
		});

        this.addEventListener("abort", function () {
            handleRequestData("aborted");
        });

        return oldXHRSend.apply(this, arguments);
    };
};
