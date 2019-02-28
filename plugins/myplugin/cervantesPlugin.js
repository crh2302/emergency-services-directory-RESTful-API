(function($) {
    // here it goes!
    var states = {
        "All States":"",
        "Alabama"	:	"AL"	,
        "Alaska"	:	"AK"	,
        "Arizona"	:	"AZ"	,
        "Arkansas":	"AR"	,
        "California"	:	"CA"	,
        "Colorado"	:	"CO"	,
        "Connecticut"	:	"CT"	,
        "Delaware"	:	"DE"	,
        "Florida"	:	"FL"	,
        "Georgia"	:	"GA"	,
        "Hawaii"	:	"HI"	,
        "Idaho"	:	"ID"	,
        "Illinois"	:	"IL"	,
        "Indiana"	:	"IN"	,
        "Iowa"	:	"IA"	,
        "Kansas"	:	"KS"	,
        "Kentucky"	:	"KY"	,
        "Louisiana"	:	"LA"	,
        "Maine"	:	"ME"	,
        "Maryland"	:	"MD"	,
        "Massachusetts"	:	"MA"	,
        "Michigan"	:	"MI"	,
        "Minnesota"	:	"MN"	,
        "Mississippi"	:	"MS"	,
        "Missouri"	:	"MO"	,
        "Montana"	:	"MT"	,
        "Nebraska"	:	"NE"	,
        "Nevada"	:	"NV"	,
        "New Hampshire"	:	"NH"	,
        "New Jersey"	:	"NJ"	,
        "New Mexico"	:	"NM"	,
        "New York"	:	"NY"	,
        "North Carolina"	:	"NC"	,
        "North Dakota"	:	"ND"	,
        "Ohio"	:	"OH"	,
        "Oklahoma"	:	"OK"	,
        "Oregon"	:	"OR"	,
        "Pennsylvania"	:	"PA"	,
        "Rhode Island"	:	"RI"	,
        "South Carolina"	:	"SC"	,
        "South Dakota"	:	"SD"	,
        "Tennessee"	:	"TN"	,
        "Texas"	:	"TX"	,
        "Utah"	:	"UT"	,
        "Vermont"	:	"VT"	,
        "Virginia"	:	"VA"	,
        "Washington"	:	"WA"	,
        "West Virginia"	:	"WV"	,
        "Wisconsin"	:	"WI"	,
        "Wyoming"	:	"WY"
    };

    $.fn.usStateSelector = function(method) {
        // plugin's default options
        var defaults = {
          selected:""
        };
        var settings = {};

        var methods = {

            init: function(options) {
                settings = $.extend({}, defaults, options);

                return this.each(function() {
                    var $obj = $(this);
                    $obj.children().remove();
                    for (var key in states) {
                        // check if the property/key is defined in the object itself, not in parent
                        if (states.hasOwnProperty(key)) {
                          $obj.append($("<option></option>").attr("value",states[key]).text(key));
                        }
                    }
                    $obj.val(settings.selected).prop('selected', true);

                });
            },

        };

        // if a method as the given argument exists
        if (methods[method]) {
            // call the respective method
            return methods[method].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );

            // if an object is given as method OR nothing is given as argument
        } else if (typeof method === "object" || !method) {
            // call the initialization method
            return methods.init.apply(this, arguments);

            // otherwise
        } else {
            // trigger an error
            $.error(
                "Method \"" + method + "\" does not exist in pluginName plugin!"
            );
        }
    };
    console.log("usStateSelector plugin loaded. By Cervantes");
})(jQuery);
