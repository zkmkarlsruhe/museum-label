let lang_id_array = ['noise','en','fr','de','es'];
	
function setValueJson(json){
    $('#artist').fadeOut(500, function() {
        $(this).text(json.artist).fadeIn(500);
    });
    $('#title').fadeOut(500, function() {
        $(this).text("> " + json.title).fadeIn(500);
    });
    $('#material').fadeOut(500, function() {
        $(this).text(json.material + ", " + json.format + ", " + json.year).fadeIn(500);
    });
    $('#description').fadeOut(500, function() {
        $(this).text(json.description).fadeIn(500);
    });
}

function loadAndSet(lang_id) {
	lang = lang_id_array[lang_id];
	val_url = "assets/database/example_0/" + lang + ".json";
	$.getJSON(val_url, function(json) {
		setValueJson(json);
	});
}

loadAndSet(1)