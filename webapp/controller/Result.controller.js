sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("tipstool.controller.Result", {
            onInit: function () {
                var oToolModel = this.getOwnerComponent().getModel("oToolModel");
                this.oToolModel = oToolModel;
                var oTableModel = this.getOwnerComponent().getModel("oTableModel");   
                this.oTableModel = oTableModel;
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            },

            onNavBack: function () {
                this.oRouter.navTo("Home");
            },

            onPressViewDetails: function () {
                this.oRouter.navTo("Home");
            },

            formatBoxVisibility: function (productName){
                var firstProductName = this.oToolModel.getProperty("/finalProductList/sortedFinalProducts/0/productName");
                var secondProductName = this.oToolModel.getProperty("/finalProductList/sortedFinalProducts/1/productName");
                var thirdProductName = this.oToolModel.getProperty("/finalProductList/sortedFinalProducts/2/productName");
                if(productName != firstProductName || productName != secondProductName || productName != thirdProductName ){
                    return true;
                }
                return false;
            }
        });
    });
