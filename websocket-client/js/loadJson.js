let lang_id_map = new Map([
	[0, 'noise'],
	[1, 'en'],
	[2, 'fr'],
	[3, 'de'],
	[4, 'en'],])

let lang_id_array = ['noise','en','fr','de','en']
	
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
	document.getElementById("artist").innerHTML = json.artist ;
	document.getElementById("title").innerHTML = "> " + json.title;
	// document.getElementById("year").innerHTML = json.year;
	// document.getElementById("format").innerHTML = json.format;
	document.getElementById("material").innerHTML = json.material + ", " + json.format + ", " + json.year;
	// document.getElementById("material").innerHTML = json.material+ " (" + json.year + ")";
	document.getElementById("description").innerHTML = json.description;
}

function loadAndSet(lang_id) {

	lang = lang_id_array[lang_id]
	val_url = "assets/database/example_0/" + lang + ".json"
	console.log(lang_id);
	console.log(val_url);
	$.getJSON(val_url, function(json) {
		setValueJson(json);
	});
}

loadAndSet(2)