var fs = require("fs");
var host = "127.0.0.1";
var port = 18412;
var httpPort = 17335;
var protocolVersion = 17;
var express = require("express");
var execSync = require('child_process').execSync;

var fontList = function() {
    var stdout = execSync("fc-list | cut -f1 -d: | sort | grep -e 'ttc\\|ttf' | xargs fc-scan --format '%{file} _ %{family} _ %{weight} _ %{style} _ %{postscriptname}\\n' $0");

    stdout = stdout.toString();

    var fonts = stdout.split("\n").reduce(function(acc, font) {
        if (!font) { return acc; }

	var details = font.split("_");
	var filename = details[0].trim();

        var font_item = {
            "localizedFamily": details[1].split(",", 1)[0].trim(),
            "postscript": details[4].trim(),
            "style": details[3].trim(),
            "weight": parseInt(details[2].trim()),
            "stretch": 5,
            "italic": (details[3].match(/Italic|Oblique/)? true : false),
            "family": details[1].split(",", 1)[0].trim(),
            "localizedStyle": details[3].trim()
        };

	if (acc[filename] === undefined) {
	    acc[filename] = [];
	}

	acc[filename].push(font_item);

        return acc;
    }, {});

    return fonts;
};

var app = express();
app.get("/figma/version", function(request, response) {
    response.append('Access-Control-Allow-Origin', request.get('origin'));
    response.json({ 'version' : protocolVersion });
});

app.get("/figma/font-files", function(request, response) {
    response.append('Access-Control-Allow-Origin', request.get('origin'));
    response.json(
        { 'version' : protocolVersion,
          'fontFiles': fontList()
        });
});

app.get("/figma/font-file", function(request, response) {
    var fontFile  = request.params.file;
    response.append('Access-Control-Allow-Origin', request.get('origin'));

    var fileName = request.query.file;
    response.sendFile(fileName);
});

app.get("/figma/update", function(request, response) {
    response.append('Access-Control-Allow-Origin', request.get('origin'));
    response.json(
	{ 'version' : protocolVersion,
	  'fontFiles': fontList()
	});
});

app.listen(port, host);
