module.exports = {
    randomChar: (size) => {
	    var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

		for (var i = 0; i < size; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	},
	randomNumber: (size) => {
	    var number = "";
		var possible = "0123456789";

		for (var i = 0; i < size; i++)
			number += possible.charAt(Math.floor(Math.random() * possible.length));

		return number;
	}     
};