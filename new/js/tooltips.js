var tags = [
{
	"severity": 0,
	"legends": ['ASSAULT', 'ROBBERY', 'WEAPONS OFFENSE', 'MISSING PERSON', 'SEX CRIME', 'ARSON', 'KIDNAPPING', 'HOMICIDE']
},
{
	"severity": 1,
	"legends": ['LARCENY','LARCENY - FROM VEHICLE','BURGLARY - VEHICLE','BURGLARY - RESIDENTIAL','BURGLARY - COMMERCIAL','MOTOR VEHICLE THEFT']
},
{
	"severity": 2,
	"legends": ['VANDALISM', 'FRAUD']
},
{
	"severity": 3,
	"legends": ['DISORDERLY CONDUCT', 'DRUG VIOLATION', 'LIQUOR LAW VIOLATION', 'NOISE VIOLATION', 'SUSPICIOUS', 'RECOVERED VEHICLE', 'FAMILY OFFENSE', 'ALL OTHER OFFENSES']
}];

/*var severities = ["['ASSAULT','WEAPONS OFFENSE','MISSING PERSON','SEX CRIME','ARSON','KIDNAPPING','HOMICIDE']","['LARCENY','LARCENY - FROM VEHICLE','BURGLARY - VEHICLE','BURGLARY - RESIDENTIAL','BURGLARY - COMMERCIAL',
'MOTOR VEHICLE THEFT']","['VANDALISM','FRAUD']","['DISORDERLY CONDUCT','DRUG VIOLATION','LIQUOR LAW VIOLATION',
'NOISE VIOLATION','SUSPICIOUS','RECOVERED VEHICLE','FAMILY OFFENSE','ALL OTHER OFFENSES']"];*/

for (tag in tags) {
	var legends = tags[tag].legends;

	var html = "<form>"
	for (i = 0; i < legends.length; i++) {
		if (legends[i] == 'ALL') {
			html = html + "<input type='checkbox' checked onclick='toggleLayers(" + severities[tags[tag].severity] + ")'> ALL<br>";
		} else {
			if (activeTypes[legends[i]]) {
				html = html + "<input type='checkbox' checked onclick='toggleLayers([&quot;" + legends[i] + "&quot])'> &nbsp;" + legends[i] + "<br>";
			} else {
				html = html + "<input type='checkbox' onclick='toggleLayers([&quot;" + legends[i] + "&quot])'> &nbsp;" + legends[i] + "<br>";
			}
		}
	}
	html = html + "</form>";

	Tipped.create('#swatch-holder-' + tags[tag].severity.toString(), html, { position: "left" }); 
}

