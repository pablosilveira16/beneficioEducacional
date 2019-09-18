sap.ui.define([
	"com/blueboot/BeneficioEducacional/controller/BaseController"
], function (Controller) {
	"use strict";

	return Controller.extend("com.blueboot.BeneficioEducacional.controller.Master", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.blueboot.BeneficioEducacional.view.Master
		 */
		onInit: function () {
			this._initLocalModel();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.blueboot.BeneficioEducacional.view.Master
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.blueboot.BeneficioEducacional.view.Master
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.blueboot.BeneficioEducacional.view.Master
		 */
		//	onExit: function() {
		//
		//	}
		
		onInscripcionPressed: function() {
			this.getRouter().navTo("inscripcion");
		}

	});

});