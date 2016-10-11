var WebPullToRefresh = (function () {
	'use strict';

	/**
	 * Hold all of the default parameters for the module
	 * @type {object}
	 */	
	var defaults = {

		ptrContainer : 'ptr__container',

		// ID of the element holding pannable content area
		contentEl: 'content', 

		// ID of the element holding pull to refresh loading area
		ptrEl: 'ptr', 

		// Number of pixels of panning until refresh 
		maxDistance: 70, 

	};

	/**
	 * Hold all of the merged parameter and default module options
	 * @type {object}
	 */
	var options = {};

	/**
	 * Pan event parameters
	 * @type {object}
	 */
	var pan = {
		enabled: false,
		distance: 0,
		startingPositionY: 0
	};
	
	/**
	 * Easy shortener for handling adding and removing body classes.
	 */
	var containerClass = document.getElementById('ptr__container').classList;
	
	/**
	 * Initialize pull to refresh, hammer, and bind pan events.
	 * 
	 * @param {object=} params - Setup parameters for pull to refresh
	 */
	var init = function( params ) {
		params = params || {};
		options = {
			ptrContainer: params.ptrContainer || document.getElementById( defaults.ptrContainer ),
			contentEl: params.contentEl || document.getElementById( defaults.contentEl ),
			ptrEl: params.ptrEl || document.getElementById( defaults.ptrEl ),
			maxDistance: params.maxDistance || defaults.maxDistance,
		};

		if ( ! options.contentEl || ! options.ptrEl || !options.ptrContainer ) {
			return false;
		}

		var h = new Hammer( options.ptrContainer );

		h.get( 'pan' ).set( { direction: Hammer.DIRECTION_VERTICAL } );

		h.on( 'panstart', _panStart );
		h.on( 'pandown', _panDown );
		h.on( 'panend', _panEnd );
	};

	/**
	 * Determine whether pan events should apply based on scroll position on panstart
	 * 
	 * @param {object} e - Event object
	 */
	var _panStart = function(e) {
		console.log("start");
		pan.startingPositionY = options.ptrContainer.scrollTop;

		if ( pan.startingPositionY === 0 ) {
			pan.enabled = true;
		}
	};

	/**
	 * Handle element on screen movement when the pandown events is firing.
	 * 
	 * @param {object} e - Event object
	 */
	var _panDown = function(e) {
		console.log("down");
		if ( ! pan.enabled || e.distance >= options.maxDistance) {
			return;
		}

		e.preventDefault();
		pan.distance = e.distance;

		_setContentPan();
	};

	
	/**
	 * Set the CSS transform on the content element to move it on the screen.
	 */
	var _setContentPan = function() {
		// Use transforms to smoothly animate elements on desktop and mobile devices
		options.contentEl.style.transform = options.contentEl.style.webkitTransform = 'translate3d( 0, ' + pan.distance + 'px, 0 )';
		options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = 'translate3d( 0, ' + ( pan.distance - options.ptrEl.offsetHeight ) + 'px, 0 )';
	};

	/**
	 * Determine how to animate and position elements when the panend event fires.
	 * 
	 * @param {object} e - Event object
	 */
	var _panEnd = function(e) {
		console.log("end");
		if ( ! pan.enabled ) {
			return;
		}

		e.preventDefault();

		options.contentEl.style.transform = options.contentEl.style.webkitTransform = '';
		options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = '';

		_doReset();

		pan.distance = 0;
		pan.enabled = false;
		};

	/**
	 * Reset all elements to their starting positions before any paning took place.
	 */
	var _doReset = function() {
		containerClass.add( 'ptr-reset' );

		var bodyClassRemove = function() {
			containerClass.remove( 'ptr-reset' );
			options.ptrContainer.removeEventListener( 'transitionend', bodyClassRemove, false );
		};

		options.ptrContainer.addEventListener( 'transitionend', bodyClassRemove, false );
		};

	return {
		init: init
	}

})();