sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("tipstool.controller.Home", {
            onInit: function () {
                var oToolModel = this.getOwnerComponent().getModel("oToolModel");
                oToolModel.loadData("./model/data.json");
                this.oToolModel = oToolModel;
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            },

            onStart: function () {
                var sPath = "/sections/0";
                var sObject = this.oToolModel.getProperty(sPath);
                this.oToolModel.setProperty("/selectedSection", sObject);
                this.oToolModel.setProperty("/selectedSectionPath", sPath);
                this.oRouter.navTo("Questionnaire", {
                    "path": "0"
                });
            }
        });
    });
