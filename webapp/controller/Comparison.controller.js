sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("tipstool.controller.Comparison", {
            onInit: function () {
                var oToolModel = this.getOwnerComponent().getModel("oToolModel");
                this.oToolModel = oToolModel;
                var oTableModel = this.getOwnerComponent().getModel("oTableModel");   
                this.oTableModel = oTableModel;
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            },

            onNavBack: function () {
                this.oRouter.navTo("Result");
            },
        });
    });
