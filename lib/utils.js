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
	}, 
	getFcmTokens: async (userId, userModel) => {
		try {
		  const user = await userModel.findByPk(userId);
	
		  if (!user || !user.fcm_token) {
			console.warn(`⚠️ No FCM token found for user ID: ${userId}`);
			return null;
		  }
	
		  return user.fcm_token;
		} catch (error) {
		  console.error("❌ Error while getting GCM token:", error);
		  return null;
		}
	}
};