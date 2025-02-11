window.addEventListener('message', async (event) => {
	if (event.source !== window) return;
	const data = event.data;

	let workingSet;
	await chrome.storage.session.get({"workingSet": ""}).then(r => workingSet = r.workingSet);
	if (data.command) {
		switch (data.command) {
			case "ADD_TIMESTAMP":
				console.log("workingSet", workingSet)
				if (workingSet === "") return;
				switch (data.type) {
					case "start.json t":
						if (workingSet.length === 0) return;
						workingSet.push(data.time);
						workingSet.push(data.time2);
						chrome.storage.session.set({ "workingSet": workingSet });
						break;
					case "normal_attack t":
						if (workingSet.length < 4) {
							workingSet.push(data.time);
							chrome.storage.session.set({ "workingSet": workingSet });
							if (workingSet.length === 4) {
								let sets;
								await chrome.storage.local.get({ "sets": [] }).then(r => sets = r.sets);
								sets.push(workingSet);
								chrome.storage.local.set({ "sets": sets });

								chrome.storage.session.remove("workingSet");
							}
						}
						break;
				}
				break;
			case "CREATE_NEW_SET":
				console.log("new set");
				chrome.storage.session.set({ "workingSet": [] })
				break;
		}
	}
});