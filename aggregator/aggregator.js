// where iCal files are aggregated to return one unique aggregated
// iCal file

// Steps:
// 1) Convert files to jCal data (JSON format of iCal) using ical.js
// 2) Apply aggregator logic
// 3) Convert back to iCal

var ICAL = require('ical.js');

// Parameters of the merged Calendar
// TODO: check what to use
let prodid = '-//Jacob Mischka//iCal Merger//EN';
var version = '2.0'

// Intermediary Step
exports.merger = function (inputs) {
	// TODO: understand this line
	if (!Array.isArray(inputs)) {
		inputs = [...arguments];
	}

	let calendar;
	for (let input of inputs) {
		try {
			let jcal = ICAL.parse(input);
			let cal = new ICAL.Component(jcal);

			if (!calendar) {
				calendar = cal;
				calendar.updatePropertyWithValue('prodid', prodid);
				calendar.updatePropertyWithValue('version', version);
			} else {
				for (let vevent of cal.getAllSubcomponents('vevent')) {
					calendar.addSubcomponent(vevent);
				}
			}
		} catch (e) {
			console.error(`Failed to merge: ${e}\nWith input: ${input}\n`);
		}
	}

	if (!calendar) {
		console.error('ERR No icals parsed successfully');
		return;
	}

	// TODO: confirm format sent by toString()
	return calendar.toString();
}
