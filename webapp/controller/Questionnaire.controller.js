sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast) {
        "use strict";

        return Controller.extend("tipstool.controller.Questionnaire", {
            onInit: function () {
                var that = this;
                var oToolModel = this.getOwnerComponent().getModel("oToolModel");
                this.oToolModel = oToolModel;
                var oTableModel = this.getOwnerComponent().getModel("oTableModel");
                oTableModel.loadData("./model/resultData.json");                 
                this.oTableModel = oTableModel;
                var oi18nModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			    this.oi18nModel = oi18nModel;
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.attachRoutePatternMatched(function (oEvent) {
                    if (oEvent.getParameter("name") === "Questionnaire") {  
                        that.path = oEvent.getParameters().arguments.path;
                        that.getSelectedData();
                    }
                });
            },

            getSelectedData: function () {
                var that = this;         
                var selectedSection = this.oToolModel.getProperty("/selectedSection");
                if (!selectedSection){
                    var oToolModel = this.getOwnerComponent().getModel("oToolModel");
                    oToolModel.loadData("./model/data.json", "", true);
                    oToolModel.attachRequestCompleted(function (oEvent) {
                        var path = "/sections/" + that.path;
                        oToolModel.setProperty("/selectedSectionPath", path);
                        var selectedSection = oToolModel.getProperty(path);
                        oToolModel.setProperty("/selectedSection", selectedSection);
                    });                    
                    this.oToolModel = oToolModel;
                }
            },

            onNavBack: function () {
                this.oRouter.navTo("Home");
            },

            onPressItem: function (oEvent) {                
                var sPath = oEvent.getSource().getBindingContext("oToolModel").getPath();                
                this.oToolModel.setProperty("/selectedSection/visible", false);
                this.oToolModel.setProperty(sPath + "/visible", true);   
                var sObject = oEvent.getSource().getBindingContext("oToolModel").getObject();            
                this.oToolModel.setProperty("/selectedSection", sObject);                
                this.oToolModel.setProperty("/selectedSectionPath", sPath);
                var startVBox = this.getView().byId("startVBox");
                var qnVBox = this.getView().byId("qnVBox"); 
                startVBox.setProperty("visible", true);
                qnVBox.setProperty("visible", false);
            },

            onPressStart: function (oEvent) {
                oEvent.getSource().getParent().setProperty("visible", false);
                oEvent.getSource().getParent().getParent().getAggregation("items")[3].setProperty("visible", true);
            },           

            onSelect: function (oEvent) {              
                var selectedSectionPath = this.oToolModel.getProperty("/selectedSectionPath");
                var object = oEvent.getSource().getBindingContext("oToolModel").getObject();
                var sPath = oEvent.getSource().getBindingContext("oToolModel").getPath();
                var rootPath = sPath.split("options")[0];
                var selectedCount = this.oToolModel.getProperty(rootPath + "selected");
                var selectOne = this.oToolModel.getProperty(rootPath + "selectOne");
                var products = object.products;
                var qnNum = this.oToolModel.getProperty(rootPath + "qnNum");
                var comparisonData = this.oTableModel.getProperty("/comparisonData");
                
                var sId = oEvent.getSource().sId;
                /* Enable or disable check box */
                if(object.selected == true){                    
                    selectedCount += 1;                  
                    sap.ui.getCore().byId(sId).addStyleClass("checkboxMark checkboxColor");                    
                } else {
                    selectedCount -= 1;
                    sap.ui.getCore().byId(sId).removeStyleClass("checkboxMark checkboxColor");
                }
    
                /* Select any one property */
                if(selectOne && selectOne == true){ //selectOne == true => It is a yes/no qn.
                    var options = this.oToolModel.getProperty(rootPath + "options");
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].optionId != object.optionId) {
                            options[i].selected = false;
                            oEvent.getSource().getParent().getAggregation("items")[i].removeStyleClass("checkboxMark checkboxColor");
                        }
                    }

                    // if(selectedCount > 1){
                    //     selectedCount -= 1;
                    //     this.oToolModel.setProperty(sPath + "/selected", false);
                    //     this.oToolModel.setProperty(rootPath + "selected", selectedCount);                     
                    // }
                }
    
                /* Setting productScore */
                for (let i = 0; i < products.length; i++) {
                    var productPath = selectedSectionPath + "/productScoreDetails/"  + products[i];
                    var productScore = this.oToolModel.getProperty(productPath + "/productScore");
                    var productName = this.oToolModel.getProperty(productPath + "/productName");
                    if (object.selected == true) {
                        productScore += 1;
                        comparisonData[qnNum][productName] += 1;
                        
                    } else {
                        if (productScore >= 1) {
                            productScore -= 1;
                            comparisonData[qnNum][productName] -= 1
                        }
                    } 
                    this.oToolModel.setProperty(productPath + "/productScore", productScore);                  
                }
                this.oTableModel.setProperty("/comparisonData", comparisonData);
                this.oToolModel.setProperty(rootPath + "selected", selectedCount);                
            },

            onPressPrevious: function (oEvent) {
                var sObject = oEvent.getSource().getBindingContext("oToolModel").getObject();
                var sPath = oEvent.getSource().getBindingContext("oToolModel").getPath();
                var selectedSection = this.oToolModel.getProperty("/selectedSection");
                var progressCount = selectedSection.progressCount;

                if (progressCount != 0) {   //displaying prev question and options                
                    sObject.visible = false;
                    var splitPath = sPath.split("/");
                    var prevIndex = parseInt(splitPath.pop()) - 1;
                    splitPath.push(prevIndex);
                    var prevPath = splitPath.join("/");
                    this.oToolModel.setProperty(prevPath + "/visible", true);
                }
            },
            
            onNext: function (oEvent) {
                var sObject = oEvent.getSource().getBindingContext("oToolModel").getObject();
                var sPath = oEvent.getSource().getBindingContext("oToolModel").getPath();

                var contentLength = oEvent.getSource().getParent().getParent().getParent().getAggregation("items").length;                
                var selectedSection = this.oToolModel.getProperty("/selectedSection");
                var progressCount = selectedSection.progressCount;

                var length = 0;
                if(sObject.answer !== undefined ) {
                    length = sObject.answer.length;
                }
                
                if((sObject.nextBtnCount == 0) || length > 0) {    
                    sObject.completed = 1;                
                    progressCount += 1;
                    selectedSection.progressCount = progressCount;                    
                }

                if (progressCount != contentLength) {   //displaying next question and options                
                    sObject.visible = false;
                    var splitPath = sPath.split("/");
                    var nextIndex = parseInt(splitPath.pop()) + 1;
                    splitPath.push(nextIndex);
                    var nextPath = splitPath.join("/");
                    this.oToolModel.setProperty(nextPath + "/visible", true);
                }                
               sObject.nextBtnCount += 1;           
            },
            
            onSubmit: function (oEvent) {
                var selectedSection = this.oToolModel.getProperty("/selectedSection");
                var selectedSectionPath = this.oToolModel.getProperty("/selectedSectionPath");
                var finalProductList = this.oToolModel.getProperty("/finalProductList");      
                var sObject = oEvent.getSource().getBindingContext("oToolModel").getObject();
                var sections = this.oToolModel.getProperty("/sections");
                var products = selectedSection.productScoreDetails; 
                var length = finalProductList.length;
                var finalProducts = finalProductList.products; 

                var selectedOptionFound = sObject.options.find(function (item) {
                    if(item.selected && item.selected === true){
                        return item;
                    }
                });
                if(selectedOptionFound){
                    sObject.completed = 1;   
                } else if(sObject.completed != -1) {
                    var message = "Please select atleast one option";
                        MessageToast.show(message, {
                            at: "center center"
                        });
                    return;
                }       
                var skippedFound = selectedSection.data.find(function (item) {
                    if(item.completed == -1){
                        return item;
                    }
                });
                if(skippedFound){
                    selectedSection.completedAnswering = 0;
                } else {
                    selectedSection.completedAnswering = 1;
                }

                if(selectedSection.sectionId != 9) {
                    selectedSection.productFlag = true; 
                }                                       
                this.oToolModel.setProperty(selectedSectionPath, selectedSection);   
                
                length -= 1;
                finalProductList.length = length;
                for(let i=0; i< products.length; i++) {
                    finalProducts[i].productScore += products[i].productScore;
                }
                finalProductList.products = finalProducts;  
                
                if(length < 0 ) {
                    var notAttendedFound = sections.find(function (item) {
                        if(item.completedAnswering == -1){
                            return item;
                        }
                    });
                    if(notAttendedFound){
                        var message = "Please answer " + notAttendedFound.sectionName + " section questions";
                        MessageToast.show(message, {
                            at: "center center"
                        });
                    } else {
                        var sortedFinalProducts = finalProducts.sort((a,b) => b.productScore - a.productScore);
                        for(let i=0; i<sortedFinalProducts; i++){
                            var productScore = sortedFinalProducts[i].productScore
                            var percentage = parseInt((productScore * 100) / 63);
                            sortedFinalProducts[i].percentage = percentage;
                        }
                        finalProductList.sortedFinalProducts = sortedFinalProducts;
                        this.oToolModel.setProperty("/finalProductList", finalProductList);
                        this.oRouter.navTo("Result");
                        return;
                    }
                }     
                
                var startVBox = this.getView().byId("startVBox");
                var qnVBox = this.getView().byId("qnVBox");
                startVBox.setProperty("visible", true);
                qnVBox.setProperty("visible", false);

                var splitPath = selectedSectionPath.split("/");                
                var nextSectionIndex = parseInt(splitPath.pop()) + 1;
                splitPath.push(nextSectionIndex);
                var nextSectionPath = splitPath.join("/");
                var nextSelectedSection = this.oToolModel.getProperty(nextSectionPath);
                
                this.oToolModel.setProperty("/selectedSection/visible", false);
                this.oToolModel.setProperty(nextSectionPath + "/visible", true);                           
                this.oToolModel.setProperty("/selectedSection", nextSelectedSection);                
                this.oToolModel.setProperty("/selectedSectionPath", nextSectionPath);
                var startVBox = this.getView().byId("startVBox");
                var qnVBox = this.getView().byId("qnVBox"); 
                startVBox.setProperty("visible", true);
                qnVBox.setProperty("visible", false);
            },

            onSkipQuestion: function (oEvent) {
                var sObject = oEvent.getSource().getBindingContext("oToolModel").getObject();
                var sPath = oEvent.getSource().getBindingContext("oToolModel").getPath();
                var qnId = oEvent.getSource().getParent().getBindingContext("oToolModel").getObject().qnId;
                
                sObject.completed = -1;                
                var splitPath = sPath.split("/");
                var nextIndex = parseInt(splitPath.pop()) + 1;
                var length = this.oToolModel.getProperty(splitPath.join("/")).length;
                if(qnId < length){
                    sObject.visible = false;
                    splitPath.push(nextIndex);
                    var nextPath = splitPath.join("/");
                    this.oToolModel.setProperty(nextPath + "/visible", true);
                }                
            },

            onSkipSection: function (oEvent) {
                var startVBox = this.getView().byId("startVBox");
                var qnVBox = this.getView().byId("qnVBox");
                var selectedSectionPath = this.oToolModel.getProperty("/selectedSectionPath");
                var finalProductList = this.oToolModel.getProperty("/finalProductList"); 
                var selectedSection = this.oToolModel.getProperty(selectedSectionPath);
                var sections = this.oToolModel.getProperty("/sections");
                selectedSection.completedAnswering = 0;
                var finalProducts = finalProductList.products;
                finalProductList.length -= 1;
                
                if(selectedSection.sectionId < (sections.length -1)) {
                    var data = selectedSection.data;
                    data.forEach(function (item) {
                        	item.completed = -1;
                    });
                    var splitPath = selectedSectionPath.split("/");
                    var nextSectionIndex = parseInt(splitPath.pop()) + 1;
                    splitPath.push(nextSectionIndex);
                    var nextSectionPath = splitPath.join("/");
                    var nextSelectedSection = this.oToolModel.getProperty(nextSectionPath);
                    this.oToolModel.setProperty("/selectedSection/visible", false);
                    this.oToolModel.setProperty(nextSectionPath + "/visible", true);                           
                    this.oToolModel.setProperty("/selectedSection", nextSelectedSection);                
                    this.oToolModel.setProperty("/selectedSectionPath", nextSectionPath);
                    var startVBox = this.getView().byId("startVBox");
                    var qnVBox = this.getView().byId("qnVBox"); 
                    startVBox.setProperty("visible", true);
                    qnVBox.setProperty("visible", false);
                } else {
                    var notAttendedFound = sections.find(function (item) {
                        if(item.completedAnswering == -1){
                            return item;
                        }
                    });
                    if(notAttendedFound){
                        var message = "Please attempt missed category";
                        MessageToast.show(message, {
                            at: "center center"
                        });
                    } else {
                        var sortedFinalProducts = finalProducts.sort((a,b) => b.productScore - a.productScore);
                        for(let i=0; i<sortedFinalProducts; i++){
                            var productScore = sortedFinalProducts[i].productScore
                            var percentage = parseInt((productScore * 100) / 63);
                            sortedFinalProducts[i].percentage = percentage;
                        }
                        finalProductList.sortedFinalProducts = sortedFinalProducts;
                        this.oToolModel.setProperty("/finalProductList", finalProductList);
                        this.oRouter.navTo("Result");
                    }
                }          
            },

            onLiveChangeText: function (oEvent) {
                var answer = oEvent.getSource().getValue();
                var sObject = oEvent.getSource().getBindingContext("oToolModel").getObject();
                var sPath = oEvent.getSource().getBindingContext("oToolModel").getPath();
                if(answer.length > 0){
                    if(sObject.selected < 1){
                        sObject.selected = 1;
                    }
                } else {
                    sObject.selected = 0;
                }
            },

            formatPrevBtnVisibility: function (qnId) {
                return ((qnId == 1) ? false : true);
            },

            formatNextBtnVisibility: function (qnId, sSection) {
                if(sSection){
                    var length = sSection.data.length;
                return ((qnId != length) ? true : false );
                }
                return true;                
            },

            formatSubmitBtnVisibility: function (qnId, sSection) {
                if(sSection) {
                    var length =sSection.data.length;
                    return ((qnId != length) ? false : true );
                }
                return false;
            },

            formatProgressBar: function (value) {
                if(value == 0) {
                    return "None";
                } else if(value == -1){
                    return "Information";
                }
                return "Success";
            },

            formatProgressBarWidth: function (data) {
                if(data){
                    var width = parseInt(70/data.length);
                    width = width + "vw";
                    return width;
                }
                return "100%";
            },

            formatBtnEnable: function (selected) {
                return ((selected > 0) ? true : false );
            },

            formatIconSrc: function (value) {
                var circle = "sap-icon://circle-task";
                var success = "sap-icon://message-success";
                var unfinished = "sap-icon://incident";
                if(value == -1){
                    return circle;
                } else if (value == 0){
                    return unfinished;
                }
                return success;
            },

            formatIconStatus: function (value) {
                if(value == -1){
                    return "None";
                } else if (value == 0){
                    return "Secondary";
                }
                return "Success";
            },

            formatCheckBoxClass: function (value) {
                var className = "checkboxSize checkboxTick checkboxLabel checkboxBorder";
                if(value == true){
                    className += " checkboxMark checkboxColor";
                    return className;
                }
                return className;
            }
        });
    });
