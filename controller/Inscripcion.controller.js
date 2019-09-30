sap.ui.define([
    "com/blueboot/BeneficioEducacional/Inscripcion/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/ui/core/ValueState"
], function(Controller, JSONModel, BindingMode, Message, ValueState) {
    "use strict";

    return Controller.extend("com.blueboot.BeneficioEducacional.Inscripcion.controller.Inscripcion", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.blueboot.BeneficioEducacional.Inscripcion.view.Inscripcion
         */
        onInit: function() {
            // ---- SAPUI5 MESSAGE POPOVER SAMPLE ----
            var oModel, oView;
            this._initLocalModel();

            oView = this.getView();

            // set message model
            this._messageManager = sap.ui.getCore().getMessageManager();
            oView.setModel(this._messageManager.getMessageModel(), "message");

            // or just do it for the whole view
            this._messageManager.registerObject(oView, true);

            // ---- 

            var oRouter = this.getRouter();
            oRouter.getRoute("inscripcion").attachMatched(this._onRouteMatched, this);
            oView.bindElement("/Beneficio");

            this._wizard = this.byId("wizardInscripcion");
        },

        _onRouteMatched: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = {
                    tipo: "1",
                    publica: true,
                    tipoDoc: "CPF",
                    repite: false,
                    hayMatricula: true,
                    matricula: 0,
                    hayMaterial: true,
                    material: 0,
                    hayLibros: true,
                    libros: 0
                };

            oModel.setProperty("/Beneficio", oBeneficio);
            this.cargarPeriodos();
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf com.blueboot.BeneficioEducacional.Inscripcion.view.Inscripcion
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf com.blueboot.BeneficioEducacional.Inscripcion.view.Inscripcion
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.blueboot.BeneficioEducacional.Inscripcion.view.Inscripcion
         */
        //	onExit: function() {
        //
        //	}

        /**
         * -------------- EVENTOS --------------
         */
        onMessagePopoverPress: function(oEvent) {
            //Sacado de Sample de SAPUI5
            // create popover lazily (singleton)
            if (!this._oMessagePopover) {
                this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "com.blueboot.BeneficioEducacional.Inscripcion.view.MessagePopover", this);
                this.getView().addDependent(this._oMessagePopover);
            }
            this._oMessagePopover.openBy(oEvent.getSource());
        },

        onTipoChange: function(oEvent) {
        	var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                aSeries5 = oModel.getProperty("/Series5"),
                aSeries6 = oModel.getProperty("/Series6");

            if (oBeneficio.tipo === "5") {
            	oModel.setProperty("/Series", aSeries5);
            } else {
            	oModel.setProperty("/Series", aSeries6);
            }
            oBeneficio.serie = "";
            oModel.setProperty("/Beneficio", oBeneficio);
            this.onPeriodoChange();
        },

        onPeriodoChange: function(oEvent) {
        	var oModel = this.getModel(),
        		oBeneficio = oModel.getProperty("/Beneficio"),
        		oCalendario = this.byId("calendario");
        	
            // Año valido -> Seteo el calendario
    		this.setPeriodo();
            // Borro seleccion de periodos y listado de meses
            oCalendario.destroySelectedDates();
            oBeneficio.inicioPeriodo = undefined;
            oBeneficio.finPeriodo = undefined;
        	oModel.setProperty("/Meses1", []);
            oModel.setProperty("/Meses2", []);
            this.getModel().setProperty("/Completo", false);

        	oModel.setProperty("/Beneficio", oBeneficio);
        	this.validarPaso1();
        },


        onCalendarioChange: function(oEvent) {
        	var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
        		oDateRange = oEvent.getSource().getSelectedDates()[0];
        	oBeneficio.inicioPeriodo = oDateRange.getStartDate();
        	oBeneficio.finPeriodo = oDateRange.getEndDate()? new Date(oDateRange.getEndDate().getFullYear(), oDateRange.getEndDate().getMonth() + 1, 0): null;
        	oModel.setProperty("/Beneficio", oBeneficio);

        	this.validarPaso4();

        	if (oBeneficio.inicioPeriodo && oBeneficio.finPeriodo) {
        		var aMeses1 = [],
        			aMeses2 = [],
        			iAnio = oBeneficio.periodo.split(".")[0];
        		for (var i = oBeneficio.inicioPeriodo.getMonth(); i <= oBeneficio.finPeriodo.getMonth() && i < 6; i++) {
        			aMeses1.push({
        				mes: (i + 1).toString() + " | " + iAnio.toString(),
        				valor: 0
        			});
        		}        		
        		for (var i = 6; i <= oBeneficio.finPeriodo.getMonth(); i++) {
        			aMeses2.push({
        				mes: (i + 1).toString() + " | " + iAnio.toString(),
        				valor: 0
        			});
        		}
        		oModel.setProperty("/Meses1", aMeses1);
        		oModel.setProperty("/Meses2", aMeses2);
        	}
        },

        handleCopyPressed: function(oEvent) {
            var oModel = this.getModel(),
                aMeses1 = oModel.getProperty("/Meses1"),
                aMeses2 = oModel.getProperty("/Meses2"),
                fValor = oEvent.getSource().getBindingContext().getObject().valor;
            aMeses1.forEach(function(m) {
                m.valor = fValor;
            });
            aMeses2.forEach(function(m) {
                m.valor = fValor;
            });
            oModel.setProperty("/Meses1", aMeses1);
            oModel.setProperty("/Meses2", aMeses2);
            this.validarPaso5();
        },

        handlePaso3Complete: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio");
            if (!this._correspondePaso4(oBeneficio)) {
                this._wizard.validateStep(this.byId("paso4"));
            }
        },

        handlePaso4Activate: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio");
            if (!this._correspondePaso4(oBeneficio)) {
                this._wizard.nextStep();
                this._wizard.setShowNextButton(false);    
            }
        },

        _correspondePaso4: function(oBeneficio) {
            return oBeneficio.tipo === "5" || oBeneficio.tipo === "6";
        },

        handleSelectNo: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio");
            oBeneficio.material = 0;
            oBeneficio.matricula = 0;
            oBeneficio.libros = 0;
            oModel.setProperty("/Beneficio", oBeneficio);

            var oInput = this.byId("inputMatricula");
            if (oInput) oInput.setValueState(ValueState.None);
            oInput = this.byId("inputMaterial");
            if (oInput) oInput.setValueState(ValueState.None);
            oInput = this.byId("inputLibros");
            if (oInput) oInput.setValueState(ValueState.None);

            this.validarPaso5();
        },
        
        /**
         * -------------- FIN EVENTOS --------------
         */

        setPeriodo: function(iAnio) {
        	var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oCalendario = this.byId("calendario"),
                aPartes = oBeneficio.periodo.split("."),
                iAnio = parseInt(aPartes[0]),
        		oInicio = new Date(iAnio, 0, 1);
            if (aPartes.length === 1) {
                // No hay seleccion de semestre
                oCalendario.setMaxDate(new Date(iAnio, 11, 31));
                oCalendario.setMinDate(oInicio);
                oCalendario.setStartDate(oInicio);
                oCalendario.setMonths(12);
            } else {
                // Seleccion de semestre
                var iSemestre = parseInt(aPartes[1]),
                    oFinal;
                if (iSemestre === 1) {
                    oInicio = new Date(iAnio, 0, 1);
                    oFinal = new Date(iAnio, 5, 30);
                } else {
                    oInicio = new Date(iAnio, 6, 1);
                    oFinal = new Date(iAnio, 11, 31)
                }
                oCalendario.setMonths(6);
                oCalendario.setStartDate(oInicio);
                oCalendario.setMinDate(oInicio);
                oCalendario.setMaxDate(oFinal);
            }
        },

        cargarPeriodos: function() {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                aPeriodos,
                iAnio = new Date().getFullYear();
            if (oBeneficio.tipo === "1" || oBeneficio.tipo === "2" || oBeneficio.tipo === "3" || oBeneficio.tipo === "4") {
                aPeriodos = [(iAnio - 1).toString(), iAnio.toString(), (iAnio + 1).toString()];
            } else {
                aPeriodos = [
                    (iAnio - 1).toString() + ".01", (iAnio - 1).toString() + ".02",
                    iAnio.toString() + ".01", iAnio.toString() + ".02",
                    (iAnio + 1).toString() + ".01", (iAnio + 1).toString() + ".02"
                ];
            }
            oBeneficio.periodo = aPeriodos[0];
            oModel.setProperty("/Periodos", aPeriodos);
            oModel.setProperty("/Beneficio", oBeneficio);
            this.setPeriodo();
        },

        _removeMessageFromTarget: function (sTarget) {
            this._messageManager.getMessageModel().getData().forEach(function(oMessage){
                if (oMessage.target === sTarget) {
                    this._messageManager.removeMessages(oMessage);
                }
            }.bind(this));
        },

        /**
         * -------------- VALIDACIONES --------------
         */
        validarPaso1: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio");
            if (!oBeneficio) {
                return;
            }

            if (!oBeneficio.dependiente) {
                this._wizard.invalidateStep(this.byId("paso1"));
            } else {
                this._wizard.validateStep(this.byId("paso1"));
            }
        },

        validarPaso2: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                sTarget = oEvent.getSource().getBindingContext().getPath() + "/" + oEvent.getSource().getBindingPath("value");

            this._removeMessageFromTarget(sTarget);
            if (!oBeneficio.contrato) {
                this._wizard.invalidateStep(this.byId("paso2"));
                oEvent.getSource().setValueState(ValueState.Error);

                this._messageManager.addMessages(
                    new Message({
                        message: "Deve ler e concordar com os termos",
                        type: ValueState.Error,
                        additionalText: "Termo de compromisso e responsabilidade",
                        target: sTarget,
                        processor: oModel
                    })
                );
            } else {
                this._wizard.validateStep(this.byId("paso2"));
                oEvent.getSource().setValueState(ValueState.None);
            }
        },

        validarPaso3: function(oEvent) {
        	var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                sDocumento = oBeneficio.documento? oBeneficio.documento.replace(/\D/g,''): "",
                bDocValido = oBeneficio.tipoDoc === "CPF"? this.validCpf(sDocumento): this.validCnpj(sDocumento);
            if (!oBeneficio.nombre || !bDocValido || !oBeneficio.estado) {
                this._wizard.invalidateStep(this.byId("paso3"));
            } else {
                this._wizard.validateStep(this.byId("paso3"));
            }
        },

        validarDocumento: function(oEvent) {
        	var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oInput = oEvent.getSource(),
                sTarget = oInput.getBindingContext().getPath() + "/" + oInput.getBindingPath("value"),
                bValido,
                sDocumento = oBeneficio.documento? oBeneficio.documento.replace(/\D/g,''): "";

            this._removeMessageFromTarget(sTarget);

            if (oBeneficio.tipoDoc === "CPF") {
            	bValido = this.validCpf(sDocumento);
            } else {
            	bValido = this.validCnpj(sDocumento);
            }
            if (!bValido) {
            	oInput.setValueState(ValueState.Error);

                this._messageManager.addMessages(
                    new Message({
                        message: "Documento inválido",
                        type: ValueState.Error,
                        additionalText: oInput.getLabels()[0].getText(),
                        target: sTarget,
                        processor: oModel
                    })
                );
            } else {
            	oInput.setValueState(ValueState.Success);
            }

            this.validarPaso3();
        },

        validarPaso4: function(oEvent) {
        	var oModel = this.getModel(),
        		oBeneficio = oModel.getProperty("/Beneficio"),
        		bSerieValida;
        	bSerieValida = oBeneficio.tipo === "5" || oBeneficio.tipo === "6"? oBeneficio.serie: true;

        	if (!bSerieValida) {
                this._wizard.invalidateStep(this.byId("paso4"));
            } else {
                this._wizard.validateStep(this.byId("paso4"));
            }
        },

        /**
         * Validaciones de CPF y CNPJ -> https://gist.github.com/roneigebert/10d788a07e2ffff88eb0f1931fb7bb49
         */
        validCpf: function(cpf) {
            if (!cpf || cpf.length != 11 ||
                cpf == "00000000000" ||
                cpf == "11111111111" ||
                cpf == "22222222222" ||
                cpf == "33333333333" ||
                cpf == "44444444444" ||
                cpf == "55555555555" ||
                cpf == "66666666666" ||
                cpf == "77777777777" ||
                cpf == "88888888888" ||
                cpf == "99999999999")
                return false
            var soma = 0
            var resto
            for (var i = 1; i <= 9; i++)
                soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i)
            resto = (soma * 10) % 11
            if ((resto == 10) || (resto == 11)) resto = 0
            if (resto != parseInt(cpf.substring(9, 10))) return false
            soma = 0
            for (var i = 1; i <= 10; i++)
                soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i)
            resto = (soma * 10) % 11
            if ((resto == 10) || (resto == 11)) resto = 0
            if (resto != parseInt(cpf.substring(10, 11))) return false
            return true
        },

        validCnpj: function(cnpj) {
            if (!cnpj || cnpj.length != 14 ||
                cnpj == "00000000000000" ||
                cnpj == "11111111111111" ||
                cnpj == "22222222222222" ||
                cnpj == "33333333333333" ||
                cnpj == "44444444444444" ||
                cnpj == "55555555555555" ||
                cnpj == "66666666666666" ||
                cnpj == "77777777777777" ||
                cnpj == "88888888888888" ||
                cnpj == "99999999999999")
                return false
            var tamanho = cnpj.length - 2
            var numeros = cnpj.substring(0, tamanho)
            var digitos = cnpj.substring(tamanho)
            var soma = 0
            var pos = tamanho - 7
            for (var i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--
                if (pos < 2) pos = 9
            }
            var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
            if (resultado != digitos.charAt(0)) return false;
            tamanho = tamanho + 1
            numeros = cnpj.substring(0, tamanho)
            soma = 0
            pos = tamanho - 7
            for (var i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--
                if (pos < 2) pos = 9
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
            if (resultado != digitos.charAt(1)) return false
            return true;
        },

        validarPaso5: function (oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oCalendario = this.byId("calendario"),
                oDateRange = oCalendario.getSelectedDates()[0],
                bCalendarioValido = oDateRange && oDateRange.getStartDate() && oDateRange.getEndDate(),
                aMeses1 = oModel.getProperty("/Meses1"),
                aMeses2 = oModel.getProperty("/Meses2"),
                bValorValido,
                bMensualidadesValido = aMeses1.length > 0 || aMeses2.length > 0;
            switch (oBeneficio.tipo) {
                case "1":
                case "2":
                case "3":
                    bValorValido = true;
                    break;
                case "4":
                    bValorValido = oBeneficio.publica || !oBeneficio.hayMatricula? true: oBeneficio.matricula > 0;
                    break;
                case "5":
                case "6":
                    if (!oBeneficio.publica) {
                        bValorValido = oBeneficio.hayMatricula? oBeneficio.matricula > 0: true;
                    } else {
                        bValorValido = oBeneficio.hayMaterial? oBeneficio.material > 0: true;
                    }
                    break;
                case "7":
                    if (!oBeneficio.publica) {
                        bValorValido = oBeneficio.hayLibros? oBeneficio.libros > 0: true;
                    } else {
                        bValorValido = oBeneficio.hayMaterial? oBeneficio.material > 0: true;
                    }
                    break;
            }
            for (var i in aMeses1) {
                bMensualidadesValido &= aMeses1[i].valor > 0;
            }
            for (var i in aMeses2) {
                bMensualidadesValido &= aMeses2[i].valor > 0;
            }

            if (!bCalendarioValido || !bValorValido || !bMensualidadesValido) {
                this._wizard.invalidateStep(this.byId("paso5"));
                this.getModel().setProperty("/Completo", false);
            } else {
                this._wizard.validateStep(this.byId("paso5"));
                this.getModel().setProperty("/Completo", true);
            }
        }

        /**
         * -------------- FIN VALIDACIONES --------------
         */

    });

});