$.fn.impress = function( method ) {
		function f() {
			var impressmethods = $(this).data("impressmethods");
			if ( impressmethods && impressmethods[method] ) {
				if ( method.substr(0, 1) === '_' && impressmethods.settings().test === false) {
					$.error( 'Method ' +  method + ' is protected and should only be used internally.' );
				} else {
					return impressmethods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
				}
			} else if ( methods[method] ) {
				if ( method.substr(0, 1) === '_' && defaults.test === false) {
					$.error( 'Method ' +  method + ' is protected and should only be used internally.' );
				} else {
					return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
				}
			} else if ( callbacks[method] && impressmethods ) {
				var settings = impressmethods.settings();
				var func = Array.prototype.slice.call( arguments, 1 )[0];
				if ($.isFunction( func )) {
					settings[method] = settings[method] || [];
					settings[method].push(func);
				}
			} else if ( typeof method === 'object' || ! method ) {
				return init.apply( this, arguments );
			} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.impress' );
			}
			// to allow chaining
			return this;
		}
		var args = arguments;
		var result;
		$(this).each(function(idx, element) {
			result = f.apply(element, args);
		});
		return result;
	};
	$.extend({
		impress: function( method ) {
			if ( methods[method] ) {
				if ( method.substr(0, 1) === '_' && defaults.test === false) {
					$.error( 'Method ' +  method + ' is protected and should only be used internally.' );
				} else {
					return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
				}
			} else if ( callbacks[method] ) {
				// plugin interface
				var func = Array.prototype.slice.call( arguments, 1 )[0];
				if ($.isFunction( func )) {
					defaults[method].push(func);
				} else {
					$.error( 'Second parameter should be a function: $.impress( callbackName, callbackFunction )' );
				}
			} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.impress' );
			}
		}
	});

}(jQuery, document, window));


$.impress("applyTarget", function( active, eventData ) {

		var target = eventData.target,
			props, step = eventData.stepData,
			settings = eventData.settings,
			zoomin = target.perspectiveScale * 1.3 < eventData.current.perspectiveScale,
			zoomout = target.perspectiveScale > eventData.current.perspectiveScale * 1.3;

		// extract first scale from transform
		var lastScale = -1;
		$.each(target.transform, function(idx, item) {
			if(item.length <= 1) {
				return;
			}
			if(item[0] === "rotate" &&
				item[1] % 360 === 0  &&
				item[2] % 360 === 0  &&
				item[3] % 360 === 0) {
				return;
			}
			if(item[0] === "scale") {
				lastScale = idx;
			} else {
				return false;
			}
		});

		if(lastScale !== eventData.current.oldLastScale) {
			zoomin = zoomout = false;
			eventData.current.oldLastScale = lastScale;
		}

		var extracted = [];
		if(lastScale !== -1) {
			while(lastScale >= 0) {
				if(target.transform[lastScale][0] === "scale") {
					extracted.push(target.transform[lastScale]);
					target.transform[lastScale] = ["scale"];
				}
				lastScale--;
			}
		}

		var animation = settings.animation;
		if(settings.reasonableAnimation[eventData.reason]) {
			animation = $.extend({},
				animation,
				settings.reasonableAnimation[eventData.reason]);
		}

		props = {
			// to keep the perspective look similar for different scales
			// we need to 'scale' the perspective, too
			perspective: Math.round(target.perspectiveScale * 1000) + "px"
		};
		props = $.extend({}, animation, props);
		if (!zoomin) {
			props.transitionDelay = '0s';
		}
		if (!active) {
			props.transitionDuration = '0s';
			props.transitionDelay = '0s';
		}
		$.impress("css", eventData.area, props);
		engine.transform(eventData.area, extracted);

		props = $.extend({}, animation);
		if (!zoomout) {
			props.transitionDelay = '0s';
		}
		if (!active) {
			props.transitionDuration = '0s';
			props.transitionDelay = '0s';
		}

		eventData.current.perspectiveScale = target.perspectiveScale;

		$.impress("css", eventData.canvas, props);
		engine.transform(eventData.canvas, target.transform);
	});

}(jQuery, document, window));