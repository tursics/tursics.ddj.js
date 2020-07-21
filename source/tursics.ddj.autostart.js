/* tursics.ddj.autostart.js */
/* version 0.3 */

/*jslint browser: true*/
/*global window,XMLHttpRequest*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	function getJSON(uri, successCallback) {
		var promiseObject = {
			onDone: null,
			onFail: null,
			onAlways: null,

			done: function(callback) {
				this.onDone = callback;
				return this;
			},
			fail: function(callback) {
				this.onFail = callback;
				return this;
			},
			always: function(callback) {
				this.onAlways = callback;
				return this;
			},
		};

		var request = new XMLHttpRequest();
		request.open('GET', uri, true);

		request.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					var data = JSON.parse(this.responseText);
					if (successCallback) {
						successCallback(data);
					}
					if (promiseObject.onDone) {
						promiseObject.onDone(data);
					}
					if (promiseObject.onAlways) {
						promiseObject.onAlways();
					}
				} else {
					if (promiseObject.onFail) {
						promiseObject.onFail(/*jqxhr*/null, /*textStatus*/'', /*error*/null);
					}
					if (promiseObject.onAlways) {
						promiseObject.onAlways();
					}
				}
			}
		};

		request.send();
		request = null;

		return promiseObject;
	}

	// -------------------------------------------------------------------------

	function updateMapSelectItem(data) {
		ddj.autostart.store.selectedItem = data;

		ddj.quickinfo.show(ddj.autostart.store.selectedItem);
	}

	// -------------------------------------------------------------------------

	function onPageShow() {
		var dataUri = ddj.getMetaContent('ddj:data'),
			dataIgnoreSecondLine = (ddj.getMetaContent('ddj:dataIgnoreSecondLine') || '') === 'true',
			dataIgnoreLastLine = (ddj.getMetaContent('ddj:dataIgnoreLastLine') || '') === 'true',
			dataUniqueIdentifier = ddj.getMetaContent('ddj:dataUniqueIdentifier') || '';

		ddj.autostart.store.selectedItem = null;
		ddj.setSelectionValue('[data-search="textinput"]', '');

		ddj.map.autostart();

		if (dataUri) {
			dataUri = dataUri + '?nocache=' + (new Date().getTime());

			getJSON(dataUri, function (jsonObject) {
				var data = jsonObject;

				if (dataIgnoreSecondLine) {
					data.shift();
				}
				if (dataIgnoreLastLine) {
					data.pop();
				}

				ddj.init(data);

				if (dataUniqueIdentifier !== '') {
					ddj.setUniqueIdentifier(dataUniqueIdentifier);
				}
			}).done(function() {
				ddj.marker.autostart({
					onClick: function (latlng, data) {
						updateMapSelectItem(data);
					},
				});

				ddj.quickinfo.autostart();
				ddj.search.autostart();

				ddj.showSelection('.visibleWithoutData', false);
				ddj.showSelection('.visibleWithData', true);
			}).fail(function() {
				ddj.showSelection('.visibleWithoutErrors', false);
				ddj.showSelection('.visibleWithErrors', true);
			}).always(function() {
			});
		}
	}

	// -------------------------------------------------------------------------

	ddj.autostart = {

		// ---------------------------------------------------------------------

		store: {
			selectedItem: null,
		},

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

	if (!ddj.store.eventPageShowWasSet) {
		ddj.store.eventPageShowWasSet = true;

		window.addEventListener('pageshow', onPageShow);
	}

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
