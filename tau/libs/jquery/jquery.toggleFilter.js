define(['tau/libs/jquery/jquery','tau/libs/jquery/jquery.caret'], function (jQuery) {
    (function($){
        /**
         *
         * @param options
         * options.expandedClass
         * options.additionalClass
         * options.filterOnClass
         * options.defaultExpand
         * @return {*}
         */
        $.fn.toggleFilter = function(options){

            var settings = $.extend({
                expandedClass:'tau-inline-group',
                additionalClass:'',
                filterOnClass:'tau-boardsettings__filter_on',
                defaultExpand:false
            },options);

            if(options === 'refresh') {
                this.each(function(){
                    var $filter = $(this),
                        $filterInput = $filter.find('.i-role-filter-input');
                    filterToggleEmpty($filter,$filterInput);
                });
                return this;
            }




            function filterToggleExpand($element) {
                if($element.hasClass(settings.expandedClass)) {
                    $element.removeClass(settings.expandedClass);
                } else {
                    $element.addClass(settings.expandedClass);
                }
            }

            function filterToggleEmpty ($element,$input) {
                if($input.val()) {
                    $element.addClass(settings.filterOnClass + ' i-role-filter-control_on');
                } else {
                    $element.removeClass(settings.filterOnClass + ' i-role-filter-control_on');
                }
            }

            this.addClass(settings.additionalClass);

            if(settings.defaultExpand) {
                this.addClass(settings.expandedClass);
            }

            this.each(function(){
                var $filter = $(this),
                    $filterInput = $filter.find('.i-role-filter-input'),
                    $filterToggle = $filter.find('.i-role-filter-toggle');

                filterToggleEmpty ($filter,$filterInput);


                $filterInput.on("clear autocompletechange", function() {
                    filterToggleEmpty ($filter,$filterInput);
                });

                $filterToggle.click(function(){
                    $filterToggle.toggleClass('tau-checked');
                    filterToggleExpand($filter);
                    filterToggleEmpty($filter,$filterInput);
                    $filterInput.focus().caretToEnd();
                });
            });



            return this;
        }
    }(jQuery))
});
