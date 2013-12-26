define([
    "Underscore"
    ,"tau/components/component.creator"
    ,"tau/views/view.container"
    ,"tau/components/extensions/component.creator.extension"

    ,"tau/ui/extensions/layout/ui.extension.layout"
    ,"tau/ui/extensions/spinner/ui.extension.spinner"
], function(_,
            Creator,
            ViewType,
            ComponentCreatorExtension,
            LayoutExtension,
            SpinnerExtension
    ) {

    return {
        create:function(config) {

            var creatorConfig = {
                extensions:_.concat([
                    config.extensions,
                    ComponentCreatorExtension,
                    LayoutExtension,
                    SpinnerExtension
                ]),
                ViewType: config.ViewType || ViewType
            };

            return Creator.create(creatorConfig, config);
        }
    };
});
