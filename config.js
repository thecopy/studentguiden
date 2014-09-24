module.exports = {
	hostname: "mongodb://localhost:27017/studentguiden",
	eventCollectionName: "events",
	statsCollectionName: "statistics",
	appkey: process.env.STUDENTGUIDEN_APPKEY || "abc",
	disableAuthIfDevMode: true,
	isInDevMode: process.env.STUDENTGUIDEN_DEVMODE === 'true' || false
}; 