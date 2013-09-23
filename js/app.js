var fb_url = 'https://rsk-livestream.firebaseio.com/';

function getFirebase(name) {
	var firebaseRef;
	if(name) {
		var firebaseRef = new Firebase(fb_url + name + '/');
	}
	else {
		var firebaseRef = new Firebase(fb_url);
	}
	return firebaseRef;
};

var App = Ember.Application.create({
	username: '',
	password: '',
	rootElement: '#app',
	t12Countdown: 0,
	delay: 60000,
	updater: function() {
		releaseDate = new Date(2013, 9, 1, 0, 0);
		today = new Date();
		countdown = releaseDate - today;
		countdown = countdown/1000/3600;
		countdown = Math.floor(countdown);
		this.set('t12Countdown', countdown);
		Ember.run.later(this, this.updater, this.delay);
	}
});

App.Stream = Ember.Object.extend({
	title: '',
	goal: '',
	desc: '',
	game: '',
	duration: 0,
	t12Countdown: 0,
	fbUpdate: [
		'title',
		'goal',
		'desc',
		'duration'
	],
	streamDurationH: function() {
		return totalHours(this.get('duration'));
	}.property('duration'),
	streamDurationM: function() {
		return totalMinutes(this.get('duration'));
	}.property('duration')
});

App.Game = Ember.Object.extend({
	name: '',
	url: ''
});

App.TerrariaGame = App.Game.extend({
	alive: 0,
	aliveDurationH: function(){
		return totalHours(this.get('alive'))
	}.property('alive'),
	aliveDurationM: function(){
		return totalMinutes(this.get('alive'))
	}.property('alive')
});

App.Hexen2Game = App.Game.extend({
	time: 0,
	gameplayDurationH: function(){
		return totalHours(this.get('time'))
	}.property('time'),
	gameplayDurationM: function(){
		return totalMinutes(this.get('time'))
	}.property('time'),
	experienceI: function(){
		return parseInt(this.get('experience'));
	}.property('experience'),
	healthI: function(){
		return parseInt(this.get('health'));
	}.property('health'),
	max_healthI: function(){
		return parseInt(this.get('max_health'));
	}.property('max_health'),
	bluemanaI: function(){
		return parseInt(this.get('bluemana'));
	}.property('bluemana'),
	greenmanaI: function(){
		return parseInt(this.get('greenmana'));
	}.property('greenmana'),
	max_manaI: function(){
		return parseInt(this.get('max_mana'));
	}.property('max_mana'),
	dexterityI: function(){
		return parseInt(this.get('dexterity'));
	}.property('dexterity'),
	strengthI: function(){
		return parseInt(this.get('strength'));
	}.property('strength'),
	wisdomI: function(){
		return parseInt(this.get('wisdom'));
	}.property('wisdom'),
});

App.Games = Ember.Object.extend({
	terraria: App.TerrariaGame.create(),
	hexen2: App.Hexen2Game.create()
});

App.IndexRoute = Ember.Route.extend({
	setupController: function(controller) {
		if(App.get('username') && App.get('password')) {
			var fbRef = getFirebase(),
				auth = new FirebaseSimpleLogin(fbRef, function(error, user) {
					if (!error && user) {
						console.log('Logged in as ' + user.email);
					}
					else {
						console.log('Error on login ' + error);
					}
				});
			auth.login('password', {
				email: App.get('username'),
				password: App.get('password'),
			});
		}
		getFirebase('game').on('value', function(s) {
			controller.set('game', s.val());
		});
		getFirebase('stream').on('value', function(s) {
			var val = s.val();
			controller.get('stream.fbUpdate').forEach(function(name) {
				controller.set('stream.' + name, val[name]);
			});
		});
		getFirebase('games').on('value', function(s) {
			var val = s.val();
			controller.get('games.terraria').setProperties(val.terraria);
			controller.get('games.hexen2').setProperties(val.hexen2);
		});
	}
});

App.IndexController = Ember.ObjectController.extend({
	stream: App.Stream.create(),
	game: '',
	games: App.Games.create(),
	playingTerraria: function() {
		return this.get('game') == 'terraria';
	}.property('game'),
	playingHexen2: function() {
		return this.get('game') == 'hexen2';
	}.property('game'),
	currentGame: function() {
		return this.get('games.' + this.get('game'));
	}.property('game'),
	t12Countdown: function() {
		return App.get('t12Countdown');
	}.property('App.t12Countdown'),
	desc: function() {
		return markdown.toHTML(this.get('stream.desc'));
	}.property('stream.desc')
})


App.updater();
