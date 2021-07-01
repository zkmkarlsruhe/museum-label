
function setKeyJson(json){
    const pad = ": ";
	document.getElementById("artist_key").innerHTML = json.artist + pad;
	document.getElementById("title_key").innerHTML = json.title + pad;
	document.getElementById("year_key").innerHTML = json.year + pad;
	document.getElementById("format_key").innerHTML = json.format + pad;
	document.getElementById("material_key").innerHTML = json.material + pad;
	document.getElementById("description_key").innerHTML = json.description + pad;
}

function setValueJson(json){
	document.getElementById("artist").innerHTML = json.artist;
	document.getElementById("title").innerHTML = json.title;
	document.getElementById("year").innerHTML = json.year;
	document.getElementById("format").innerHTML = json.format;
	document.getElementById("material").innerHTML = json.material;
	document.getElementById("description").innerHTML = json.description;
}

function loadAndSet(key_url, val_url) {
	$.getJSON(key_url, function(json) {
		setKeyJson(json);
	});
	$.getJSON(val_url, function(json) {
		setValueJson(json);
	});
}

test_key_url = "assets/meta-text/de.json" 
test_val_url = "assets/database/example_0/de.json" 

// test_key_url = "assets/meta-text/en.json" 
// test_val_url = "assets/database/example_0/en.json" 

loadAndSet(test_key_url, test_val_url)