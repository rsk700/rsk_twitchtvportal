var change_url = 'https://dl.dropboxusercontent.com/u/1234083/TwitchTVPortal/change.json';
var data_url = 'https://dl.dropboxusercontent.com/u/1234083/TwitchTVPortal/data.json';

NowPlaying = Ember.Object.extend({
		name: '',
		url: ''
});

AppData = Ember.Object.extend({
	title: '',
	streamDuration: 0,
	aliveDuration: 0,
	nowPlaying: null,
	deathCounter: 0,
	desc: ''
});

var App = Ember.Application.create({
	rootElement: '#app',
	change: 0,
	data: AppData.create({
		nowPlaying: NowPlaying.create()
	}),
	delay: 60000,
	updater: function() {
		var self = this;
		$.get(change_url).then(function(response) {
			self.set('change', response.c);
		})
		Ember.run.later(this, this.updater, this.delay);
	}
});

App.reopen({
	onChange: function(){
		var self = this;
		$.get(data_url).then(function(response) {
			var names = [
				'title',
				'streamDuration',
				'aliveDuration',
				'desc',
				'deathCounter'
			];
			names.forEach(function(name) {
				self.set('data.'+name, response[name])
			});
			self.set('data.nowPlaying.name', response.nowPlaying.name);
			self.set('data.nowPlaying.url', response.nowPlaying.url);
		});
	}.observes('change')
});

App.Router.map(function() {
	this.route('index', { path: '/' });
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
		return App.data;
	}
})

App.IndexController = Ember.ObjectController.extend({
	init: function() {
		this.get('streamDuration');
		this.get('aliveDuration');
	},
	streamDuration: function() {
		return {
			h: totalHours(this.get('model.streamDuration')),
			m: totalMinutes(this.get('model.streamDuration'))
		}
	}.property('App.data.streamDuration'),
	aliveDuration: function() {
		return {
			h: totalHours(this.get('model.aliveDuration')),
			m: totalMinutes(this.get('model.aliveDuration'))
		}
	}.property('App.data.aliveDuration'),
	desc: function() {
		return markdown.toHTML(this.get('model.desc'));
	}.property('App.data.desc')
})


App.updater();
