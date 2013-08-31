function totalHours(seconds) {
	return Math.floor(seconds/3600);
}

function totalMinutes(seconds) {
	return Math.floor((seconds % 3600) / 60);
}
