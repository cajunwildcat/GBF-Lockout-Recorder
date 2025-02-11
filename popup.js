let rows = 0;
let table;
let clearButton;
window.onload = e => {
	table = document.querySelector("#data-table");
	clearButton = document.querySelector("#clear-data-button");
	clearButton.onclick = (e) => {
		chrome.storage.local.remove("sets");
		while (table.childElementCount > 1) {
			table.lastChild.remove();
		}
	}
	setTimeout(updateRows, 1000);
}

async function updateRows() {
	let sets;
	await chrome.storage.local.get("sets").then(r=>sets=r.sets);
	if (sets && sets.length !== rows) {
		for (let i = rows; i < sets.length; i++) {
			let row = document.createElement("tr");
			row.innerHTML = `<td>${sets[i][0]}</td><td>${sets[i][1]}</td><td>${sets[i][2]}</td><td>${sets[i][3]}</td>`
			table.appendChild(row);
		}
		rows = sets.length;
	}
	setTimeout(updateRows, 1000);
}