/*! Widget: filter jQuery UI formatter functions - updated 7/17/2014 (v2.17.5) *//*
 * requires: tableSorter (FORK) 2.15+ and jQuery 1.4.3+
 *
 * uiSpinner (jQuery UI spinner)
 * uiSlider (jQuery UI slider)
 * uiRange (jQuery UI range slider)
 * uiDateCompare (jQuery UI datepicker; 1 input)
 * uiDatepicker (jQuery UI datepicker; 2 inputs, filter range)
 */
/*jshint browser:true, jquery:true, unused:false */
/*global jQuery: false */
;(function($) {
	'use strict';

	var ts = $.tablesorter || {},

	// compare option selector class name (jQuery selector)
	compareSelect = '.compare-select',

	tsff = ts.filterFormatter = $.extend( {}, ts.filterFormatter, {

		addCompare: function($cell, indx, options) {
			if (options.compare && $.isArray(options.compare) && options.compare.length > 1) {
				var opt = '',
					compareSelectClass = [ compareSelect.slice(1), ' ' + compareSelect.slice(1), '' ],
					txt = options.cellText ? '<label class="' + compareSelectClass.join('-label') + indx + '">' + options.cellText + '</label>' : '';
				$.each(options.compare, function(i, c) {
					opt += '<option ' + (options.selected === i ? 'selected' : '') + '>' + c + '</option>';
				});
				$cell
					.wrapInner('<div class="' + compareSelectClass.join('-wrapper') + indx + '" />')
					.prepend( txt + '<select class="' + compareSelectClass.join('') + indx + '" />' )
					.find('select')
					.append(opt);
			}
		},

		updateCompare : function($cell, $input, o) {
			var val = $input.val() || '',
				num = val.replace(/\s*?[><=]\s*?/g, ''),
				compare = val.match(/[><=]/g) || '';
			if (o.compare) {
				if ($.isArray(o.compare)) {
					compare = (compare || []).join('') || o.compare[o.selected || 0];
				}
				$cell.find(compareSelect).val( compare );
			}
			return [ val, num ];
		},

		/**********************\
		jQuery UI Spinner
		\**********************/
		uiSpinner: function($cell, indx, spinnerDef) {
			var o = $.extend({
				// filter formatter options
				delayed : true,
				addToggle : true,
				exactMatch : true,
				value : 1,
				cellText : '',
				compare : '',
				// include ANY jQuery UI spinner options below
				min : 0,
				max : 100,
				step : 1,
				disabled : false

			}, spinnerDef ),
			c = $cell.closest('table')[0].config,
			// Add a hidden input to hold the range values
			$input = $('<input class="filter" type="hidden">')
				.appendTo($cell)
				// hidden filter update namespace trigger by filter widget
				.bind('change' + c.namespace + 'filter', function() {
					updateSpinner({ value: this.value, delayed: false });
				}),
			$shcell = [],

			// this function updates the hidden input and adds the current values to the header cell text
			updateSpinner = function(ui, notrigger) {
				var chkd = true, state,
					// ui is not undefined on create
					v = ui && ui.value && ts.formatFloat((ui.value + '').replace(/[><=]/g, '')) ||
						$cell.find('.spinner').val() || o.value,
					compare = ($.isArray(o.compare) ? $cell.find(compareSelect).val() || o.compare[ o.selected || 0] : o.compare) || '',
					searchType = ui && typeof ui.delayed === 'boolean' ? ui.delayed : c.$table[0].hasInitialized ? o.delayed || '' : true;
				if (o.addToggle) {
					chkd = $cell.find('.toggle').is(':checked');
				}
				state = o.disabled || !chkd ? 'disable' : 'enable';
				if (!ts.isEmptyObject($cell.find('.spinner').data())) {
					$cell.find('.filter')
						// add equal to the beginning, so we filter exact numbers
						.val( chkd ? (compare ? compare : o.exactMatch ? '=' : '') + v : '' )
						.trigger( notrigger ? '' : 'search', searchType ).end()
						.find('.spinner').spinner(state).val(v);
					// update sticky header cell
					if ($shcell.length) {
						$shcell
							.find('.spinner').spinner(state).val(v).end()
							.find(compareSelect).val( compare );
						if (o.addToggle) {
							$shcell.find('.toggle')[0].checked = chkd;
						}
					}
				}
			};

			// add callbacks; preserve added callbacks
			o.oldcreate = o.create;
			o.oldspin = o.spin;
			o.create = function(event, ui) {
				updateSpinner(); // ui is an empty object on create
				if (typeof o.oldcreate === 'function') { o.oldcreate(event, ui); }
			};
			o.spin  = function(event, ui) {
				updateSpinner(ui);
				if (typeof o.oldspin === 'function') { o.oldspin(event, ui); }
			};
			if (o.addToggle) {
				$('<div class="button"><input id="uispinnerbutton' + indx + '" type="checkbox" class="toggle" />' +
					'<label for="uispinnerbutton' + indx + '"></label></div>')
					.appendTo($cell)
					.find('.toggle')
					.bind('change', function() {
						updateSpinner();
					});
			}
			// make sure we use parsed data
			$cell.closest('thead').find('th[data-column=' + indx + ']').addClass('filter-parsed');
			// add a jQuery UI spinner!
			$('<input class="spinner spinner' + indx + '" />')
				.val(o.value)
				.appendTo($cell)
				.spinner(o)
				.bind('change keyup', function() {
					updateSpinner();
				});

			// update spinner from hidden input, in case of saved filters
			c.$table.bind('filterFomatterUpdate' + c.namespace + 'filter', function() {
				var val = tsff.updateCompare($cell, $input, o)[0];
				$cell.find('.spinner').val( val );
				updateSpinner({ value: val }, true);
				ts.filter.formatterUpdated($cell, indx);
			});

			if (o.compare) {
				// add compare select
				tsff.addCompare($cell, indx, o);
				$cell.find(compareSelect).bind('change', function() {
					updateSpinner();
				});
			}

			// has sticky headers?
			c.$table.bind('stickyHeadersInit' + c.namespace + 'filter', function() {
				$shcell = c.widgetOptions.$sticky.find('.tablesorter-filter-row').children().eq(indx).empty();
				if (o.addToggle) {
					$('<div class="button"><input id="stickyuispinnerbutton' + indx + '" type="checkbox" class="toggle" />' +
						'<label for="stickyuispinnerbutton' + indx + '"></label></div>')
						.appendTo($shcell)
						.find('.toggle')
						.bind('change', function() {
							$cell.find('.toggle')[0].checked = this.checked;
							updateSpinner();
						});
				}
				// add a jQuery UI spinner!
				$('<input class="spinner spinner' + indx + '" />')
					.val(o.value)
					.appendTo($shcell)
					.spinner(o)
					.bind('change keyup', function() {
						$cell.find('.spinner').val( this.value );
						updateSpinner();
					});

				if (o.compare) {
					// add compare select
					tsff.addCompare($shcell, indx, o);
					$shcell.find(compareSelect).bind('change', function() {
						$cell.find(compareSelect).val( $(this).val() );
						updateSpinner();
					});
				}

			});

			// on reset
			c.$table.bind('filterReset' + c.namespace + 'filter', function() {
				if ($.isArray(o.compare)) {
					$cell.add($shcell).find(compareSelect).val( o.compare[ o.selected || 0 ] );
				}
				// turn off the toggle checkbox
				if (o.addToggle) {
					$cell.find('.toggle')[0].checked = false;
				}
				$cell.find('.spinner').spinner('value', o.value);
				setTimeout(function() {
					updateSpinner();
				}, 0);
			});

			updateSpinner();
			return $input;
		},

		/**********************\
		jQuery UI Slider
		\**********************/
		uiSlider: function($cell, indx, sliderDef) {
			var o = $.extend({
				// filter formatter options
				delayed : true,
				valueToHeader : false,
				exactMatch : true,
				cellText : '',
				compare : '',
				allText : 'all',
				// include ANY jQuery UI spinner options below
				// except values, since this is a non-range setup
				value : 0,
				min : 0,
				max : 100,
				step : 1,
				range : 'min'
			}, sliderDef ),
			c = $cell.closest('table')[0].config,
			// Add a hidden input to hold the range values
			$input = $('<input class="filter" type="hidden">')
				.appendTo($cell)
				// hidden filter update namespace trigger by filter widget
				.bind('change' + c.namespace + 'filter', function() {
					updateSlider({ value: this.value });
				}),
			$shcell = [],

			// this function updates the hidden input and adds the current values to the header cell text
			updateSlider = function(ui, notrigger) {
				// ui is not undefined on create
				var v = typeof ui !== 'undefined' ? ts.formatFloat((ui.value + '').replace(/[><=]/g, '')) || o.value : o.value,
					val = o.compare ? v : v === o.min ? o.allText : v,
					compare = ($.isArray(o.compare) ? $cell.find(compareSelect).val() || o.compare[ o.selected || 0] : o.compare) || '',
					result = compare + val,
					searchType = ui && typeof ui.delayed === 'boolean' ? ui.delayed : c.$table[0].hasInitialized ? o.delayed || '' : true;
				if (o.valueToHeader) {
					// add range indication to the header cell above!
					$cell.closest('thead').find('th[data-column=' + indx + ']').find('.curvalue').html(' (' + result + ')');
				} else {
					// add values to the handle data-value attribute so the css tooltip will work properly
					$cell.find('.ui-slider-handle').addClass('value-popup').attr('data-value', result);
				}
				// prevent JS error if "resetToLoadState" or filter widget was removed for another reason
				if (!ts.isEmptyObject($cell.find('.slider').data())) {
					// update the hidden input;
					$cell.find('.filter')
						// ****** ADD AN EQUAL SIGN TO THE BEGINNING! <- this makes the slide exactly match the number ******
						// when the value is at the minimum, clear the hidden input so all rows will be seen
						.val( ( compare ? compare + v : v === o.min ? '' : (o.exactMatch ? '=' : '') + v ) )
						.trigger( notrigger ? '' : 'search', searchType ).end()
						.find('.slider').slider('value', v);

					// update sticky header cell
					if ($shcell.length) {
						$shcell
							.find(compareSelect).val( compare ).end()
							.find('.slider').slider('value', v);
						if (o.valueToHeader) {
							$shcell.closest('thead').find('th[data-column=' + indx + ']').find('.curvalue').html(' (' + result + ')');
						} else {
							$shcell.find('.ui-slider-handle').addClass('value-popup').attr('data-value', result);
						}
					}
				}

			};
			$cell.closest('thead').find('th[data-column=' + indx + ']').addClass('filter-parsed');

			// add span to header for value - only works if the line in the updateSlider() function is also un-commented out
			if (o.valueToHeader) {
				$cell.closest('thead').find('th[data-column=' + indx + ']').find('.tablesorter-header-inner').append('<span class="curvalue" />');
			}

			// add callbacks; preserve added callbacks
			o.oldcreate = o.create;
			o.oldslide = o.slide;
			o.create = function(event, ui) {
				updateSlider(); // ui is an empty object on create
				if (typeof o.oldcreate === 'function') { o.oldcreate(event, ui); }
			};
			o.slide  = function(event, ui) {
				updateSlider(ui);
				if (typeof o.oldslide === 'function') { o.oldslide(event, ui); }
			};
			// add a jQuery UI slider!
			$('<div class="slider slider' + indx + '"/>')
				.appendTo($cell)
				.slider(o);

			// update slider from hidden input, in case of saved filters
			c.$table.bind('filterFomatterUpdate' + c.namespace + 'filter', function() {
				var val = tsff.updateCompare($cell, $input, o)[0];
				$cell.find('.slider').slider('value', val );
				updateSlider({ value: val }, false);
				ts.filter.formatterUpdated($cell, indx);
			});

			if (o.compare) {
				// add compare select
				tsff.addCompare($cell, indx, o);
				$cell.find(compareSelect).bind('change', function() {
					updateSlider({ value: $cell.find('.slider').slider('value') });
				});
			}

			// on reset
			c.$table.bind('filterReset' + c.namespace + 'filter', function() {
				if ($.isArray(o.compare)) {
					$cell.add($shcell).find(compareSelect).val( o.compare[ o.selected || 0 ] );
				}
				setTimeout(function() {
					updateSlider({ value: o.value });
				}, 0);
			});

			// has sticky headers?
			c.$table.bind('stickyHeadersInit' + c.namespace + 'filter', function() {
				$shcell = c.widgetOptions.$sticky.find('.tablesorter-filter-row').children().eq(indx).empty();

				// add a jQuery UI slider!
				$('<div class="slider slider' + indx + '"/>')
					.val(o.value)
					.appendTo($shcell)
					.slider(o)
					.bind('change keyup', function() {
						$cell.find('.slider').slider('value', this.value );
						updateSlider();
					});

				if (o.compare) {
					// add compare select
					tsff.addCompare($shcell, indx, o);
					$shcell.find(compareSelect).bind('change', function() {
						$cell.find(compareSelect).val( $(this).val() );
						updateSlider();
					});
				}

			});

			return $input;
		},

		/*************************\
		jQuery UI Range Slider (2 handles)
		\*************************/
		uiRange: function($cell, indx, rangeDef) {
			var o = $.extend({
				// filter formatter options
				delayed : true,
				valueToHeader : false,
				// include ANY jQuery UI spinner options below
				// except value, since this one is range specific)
				values : [ 0, 100 ],
				min : 0,
				max : 100,
				range : true
			}, rangeDef ),
			c = $cell.closest('table')[0].config,
			// Add a hidden input to hold the range values
			$input = $('<input class="filter" type="hidden">')
				.appendTo($cell)
				// hidden filter update namespace trigger by filter widget
				.bind('change' + c.namespace + 'filter', function() {
					getRange();
				}),
			$shcell = [],

			getRange = function() {
				var val = $input.val(),
					v = val.split(' - ');
				if (val === '') { v = [ o.min, o.max ]; }
				if (v && v[1]) {
					updateUiRange({ values: v, delay: false }, true);
				}
			},

			// this function updates the hidden input and adds the current values to the header cell text
			updateUiRange = function(ui, notrigger) {
				// ui.values are undefined for some reason on create
				var val = ui && ui.values || o.values,
					result = val[0] + ' - ' + val[1],
					// make range an empty string if entire range is covered so the filter row will hide (if set)
					range = val[0] === o.min && val[1] === o.max ? '' : result,
					searchType = ui && typeof ui.delayed === 'boolean' ? ui.delayed : c.$table[0].hasInitialized ? o.delayed || '' : true;
				if (o.valueToHeader) {
					// add range indication to the header cell above (if not using the css method)!
					$cell.closest('thead').find('th[data-column=' + indx + ']').find('.currange').html(' (' + result + ')');
				} else {
					// add values to the handle data-value attribute so the css tooltip will work properly
					$cell.find('.ui-slider-handle')
						.addClass('value-popup')
						.eq(0).attr('data-value', val[0]).end() // adding value to data attribute
						.eq(1).attr('data-value', val[1]);      // value popup shown via css
				}
				if (!ts.isEmptyObject($cell.find('.range').data())) {
					// update the hidden input
					$cell.find('.filter').val(range)
						.trigger(notrigger ? '' : 'search', searchType).end()
						.find('.range').slider('values', val);
					// update sticky header cell
					if ($shcell.length) {
						$shcell.find('.range').slider('values', val);
						if (o.valueToHeader) {
							$shcell.closest('thead').find('th[data-column=' + indx + ']').find('.currange').html(' (' + result + ')');
						} else {
							$shcell.find('.ui-slider-handle')
							.addClass('value-popup')
							.eq(0).attr('data-value', val[0]).end() // adding value to data attribute
							.eq(1).attr('data-value', val[1]);      // value popup shown via css
						}
					}
				}

			};
			$cell.closest('thead').find('th[data-column=' + indx + ']').addClass('filter-parsed');

			// add span to header for value - only works if the line in the updateUiRange() function is also un-commented out
			if (o.valueToHeader) {
				$cell.closest('thead').find('th[data-column=' + indx + ']').find('.tablesorter-header-inner').append('<span class="currange"/>');
			}

			// add callbacks; preserve added callbacks
			o.oldcreate = o.create;
			o.oldslide = o.slide;
			// add a jQuery UI range slider!
			o.create = function(event, ui) {
				updateUiRange(); // ui is an empty object on create
