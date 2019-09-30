/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/blueboot/BeneficioEducacional/Inscripcion/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});