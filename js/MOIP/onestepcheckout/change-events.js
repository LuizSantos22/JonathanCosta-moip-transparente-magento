(function($) {
    // Function to validate form fields on blur
    const validateOnBlur = (form) => {
        $(`#${form} :input:not([type="checkbox"]):not([type="submit"]):not([type="button"])`).on('blur', function() {
            const id = $(this).attr('id');
            if (id && id !== "day" && id !== "month") {
                Validation.validate(id);
            }
        });
    };

    // Function to set confirmation password value
    const setUniquePassword = () => {
        $('#confirmation').val($('#password').val());
    };

    // Function to go back to email identification
    const gobackemail = () => {
        location.href = url_clear_identify;
    };

    // Function to identify user via AJAX
    const identifyUser = () => {
        const identifyForm = new VarienForm('onestep_form_identify', true);
        if (identifyForm.validator.validate()) {
            $.ajax({
                url: url_indetify,
                type: "POST",
                data: $("#onestep_form_identify").serialize(),
                beforeSend: visibilyloading,
                success: (result) => {
                    visibilyloading("end");
                    const sanitizedHtml = DOMPurify.sanitize(result.html); // Sanitize HTML to prevent XSS
                    if (result.is_user) {
                        $('#isCustomer').html(sanitizedHtml);
                        animateModal("#create-loggin");
                        $('#login-email').val($('#checked-login').val());
                        $('#login-password').password();
                    } else {
                        $('#not-isCustomer').html(sanitizedHtml);
                        animateModal("#create-account");
                        $('#password').password();
                    }
                },
            });
        }
    };

    // Helper function to animate modal transitions
    const animateModal = (selector) => {
        const $target = $(selector);
        $target.css('right', `-${$(window).width()}px`);
        const rightOffset = $target.offset().right;
        $target.css({ right: rightOffset }).animate({ right: "0px" }, 10);
        $target.addClass('active in');
        $('#identifique').removeClass('active in');
    };

    // Function to authenticate user via AJAX
    const authenticate = () => {
        const loginForm = new VarienForm('form-loggin', true);
        if (loginForm.validator.validate()) {
            $.ajax({
                url: url_authenticate,
                type: "POST",
                data: $("#form-loggin").serialize(),
                beforeSend: visibilyloading,
                success: (result) => {
                    visibilyloading('end');
                    if (result.success) {
                        location.href = encodeURI(result.redirect);
                    } else {
                        $('.error-login').html(result.error);
                    }
                },
            });
        }
    };

    // Function to get error descriptions
    const getErroDescription = () => {
        let error = null;
        $(".erros_cadastro_valores").html('');
        $(".validation-failed").each(function() {
            const name = $(this).attr("name");
            const temp = $(this).attr("title");
            if (name && error !== temp) {
                error = temp;
                $(".erros_cadastro_valores").append(`<li>${error}</li>`);
            }
        });
        return this;
    };

    // Function to toggle loading state in buttons
    const loadingInButton = (type) => {
        const $button = $('.moip-place-order');
        if (type !== 'stop') {
            $button.addClass('progress-bar progress-bar-striped active').css('width', '100%').prop('disabled', true);
        } else {
            $button.removeClass('progress-bar progress-bar-striped active').prop('disabled', false);
        }
    };

    // Function to toggle visibility of loading modal
    const visibilyloading = (type) => {
        const $modal = $("#modal-loading-process");
        if (type !== 'end') {
            $modal.modal({ backdrop: 'static', keyboard: false });
        } else {
            $modal.modal("toggle");
        }
    };

    // Function to save payment method via AJAX
    const savePaymentMethod = () => {
        $.ajax({
            url: url_save_payment_metthod,
            type: "POST",
            data: $("#onestep_form").serialize(),
            beforeSend: () => loadingInButton('start'),
            success: (result) => {
                if (result?.success) {
                    $('#totals').html(result.html);
                }
            },
            complete: () => loadingInButton('stop'),
        });
        return this;
    };

    // Function to save shipping method via AJAX
    const saveShippingMethod = () => {
        $.ajax({
            type: "POST",
            url: url_save_shipping_method,
            async: true,
            data: $("#onestep_form").serialize(),
            beforeSend: () => {
                $("#payment-progress").removeClass('hidden-it');
                $("#co-payment-form").addClass('hidden-it');
                loadingInButton('start');
            },
            success: (result) => {
                $("#payment-progress").addClass('hidden-it');
                $("#co-payment-form").removeClass('hidden-it');
                loadingInButton('stop');
                if (result?.success) {
                    $("#payment-method-available").html(result.html);
                    $('html, body').animate({
                        scrollTop: $("#meio-de-pagamento").offset().top
                    }, 2000);
                }
                if (result?.totals) {
                    $('#totals').html(result.totals);
                }
            },
            complete: () => {
                $("#payment-progress").addClass('hidden-it');
                $("#co-payment-form").removeClass('hidden-it');
                loadingInButton('stop');
            },
        });
        return this;
    };

    // Function to save shipping details via AJAX
    const saveShipping = () => {
        $("#shipping-progress").removeClass('hidden-it');
        $.ajax({
            type: "POST",
            url: url_save_shipping,
            data: $("#onestep_form").serialize(),
            beforeSend: visibilyloading,
            success: (result) => {
                if (result?.success) {
                    visibilyloading('stop');
                    $("#shipping-progress").addClass('hidden-it');
                    $("#shipping-method-available").html(result.html);
                    $('html, body').animate({
                        scrollTop: $("#meio-de-envio").offset().top
                    }, 2000);
                }
            },
        });
        return this;
    };

    // Function to toggle billing address view
    const viewAddressBilling = (value) => {
        if (value === false) {
            $(".address-billing-view").removeClass("no-display");
        } else {
            $(".address-billing-view").addClass("no-display");
        }
        return this;
    };

    // Function to create a new account
    const createAccount = () => {
        const saveForm = new VarienForm('form-new-address', true);
        if (saveForm.validator.validate()) {
            visibilyloading();
            $("#form-new-address").submit();
        }
    };

    // Function to add a new address via AJAX
    const newAddress = (context) => {
        const saveForm = new VarienForm('form-new-address', true);
        if (saveForm.validator.validate()) {
            visibilyloading();
            $.ajax({
                type: "POST",
                url: form_post_address,
                data: $("#form-new-address").serialize(),
                dataType: "json",
                success: () => window.location.reload(),
            });
        }
    };

    // Function to save an address via AJAX
    const saveAddress = (id, context) => {
        console.log("chama a função");
        const saveForm = new VarienForm('form-new-address', true);
        if (saveForm.validator.validate()) {
            visibilyloading();
            $.ajax({
                type: "POST",
                url: `${form_post_address}id/${id}`,
                data: $("#form-new-address").serialize(),
                dataType: "json",
                success: () => {
                    visibilyloading('end');
                    window.location.href = encodeURI(url_success_action_redirect);
                },
            });
        }
        return this;
    };
})(jQuery);
// Function to edit an address via AJAX
const editAddress = (isEdit, context) => {
    if (isEdit !== 0) {
        if (context === "shipping") {
            $.ajax({
                type: "POST",
                url: url_save_shipping,
                data: $("#onestep_form").serialize(),
                dataType: "json",
                beforeSend: () => {
                    $("#shipping-progress").removeClass('hidden-it');
                    $("#shipping-method-available").addClass('hidden-it');
                },
                success: (result) => {
                    if (result?.success) {
                        if (result.update === "billing") {
                            $('#payment-method-available').html(result.html);
                        } else {
                            $("#shipping-progress").addClass('hidden-it');
                            $("#shipping-method-available").removeClass('hidden-it');
                            $('#shipping-method-available').html(result.html);
                        }
                        if (result.totals) {
                            $('#totals').html(result.totals);
                        }
                    } else {
                        alert(result.error);
                        window.location.reload();
                    }
                },
            });
        } else if (context === "billing") {
            $.ajax({
                type: "POST",
                url: url_save_billing,
                data: $("#onestep_form").serialize(),
                dataType: "json",
                success: (result) => {
                    if (result?.success) {
                        if (result.update === "billing") {
                            $('#payment-method-available').html(result.html);
                        } else {
                            $('#shipping-method-available').html(result.html);
                        }
                        if (result.totals) {
                            $('#totals').html(result.totals);
                        }
                    } else {
                        alert(result.error);
                        window.location.reload();
                    }
                },
            });
        } else {
            $.ajax({
                type: "POST",
                url: url_new_address,
                data: { id: isEdit, typeform: context },
                dataType: "json",
                success: (result) => {
                    $("#new-address").modal({ backdrop: 'static', keyboard: false });
                    $("#form-edit-address").html(result.html);
                },
            });
        }
    }
};

// Function to check if email exists via AJAX
const checkEmailExists = (v) => {
    return new Promise((resolve) => {
        $.ajax({
            type: "POST",
            url: url_indetify,
            data: { email: v, form_key: $("input[name='form_key']").val() },
            success: (result) => resolve(!result.is_user),
        });
    });
};

// Function to set person type (e.g., individual or legal entity)
const setTypePersona = (type) => {
    const personaType = $(type).attr('data-typepersona');
    if (personaType === "Jurídica") {
        $('.dados-pj').show();
        $('#cnpj').addClass('validate-cnpj');
        $('.dados-pj input:not([type=radio])')
            .addClass('required-entry')
            .removeClass('validation-passed validation-failed');
    } else {
        $('.dados-pj').hide();
        $('#cnpj').removeClass('validate-cnpj');
        $('.dados-pj input:not([type=radio])')
            .removeClass('required-entry validation-passed validation-failed');
    }
};

// Function to validate document type (CPF or CNPJ)
const validateTypeDocument = (cpf, pType) => {
    let cpfFiltered = "", valor1 = " ", valor2 = " ", ch = "";
    let isValid = false;
    for (let i = 0; i < cpf.length; i++) {
        ch = cpf.substring(i, i + 1);
        if (ch >= "0" && ch <= "9") {
            cpfFiltered += ch;
            valor1 = valor2;
            valor2 = ch;
        }
        if (valor1 !== " " && !isValid) isValid = !(valor1 === valor2);
    }
    if (!isValid) cpfFiltered = "12345678910";
    if (cpfFiltered.length < 11) {
        for (let i = 1; i <= 11 - cpfFiltered.length; i++) {
            cpfFiltered = "0" + cpfFiltered;
        }
    }
    if (pType === 1) {
        return cpfFiltered.substring(9, 11) === checkCPF(cpfFiltered.substring(0, 9)) && cpfFiltered.substring(11, 12) === "";
    }
    if (pType === 2) {
        return cpfFiltered.length >= 14 && cpfFiltered.substring(12, 14) === checkCNPJ(cpfFiltered.substring(0, 12));
    }
    return false;
};

// Helper function to validate CPF
const checkCPF = (vCPF) => {
    let mControle = "", mContIni = 2, mContFim = 10, mDigito = 0;
    for (let j = 1; j <= 2; j++) {
        let mSoma = 0;
        for (let i = mContIni; i <= mContFim; i++) {
            mSoma += vCPF.substring(i - j - 1, i - j) * (mContFim + 1 + j - i);
        }
        if (j === 2) mSoma += 2 * mDigito;
        mDigito = (mSoma * 10) % 11;
        if (mDigito === 10) mDigito = 0;
        mControle = (mControle * 10) + mDigito;
        mContIni = 3;
        mContFim = 11;
    }
    return mControle;
};

// Helper function to validate CNPJ
const checkCNPJ = (vCNPJ) => {
    let mControle = "", aTabCNPJ = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 1; i <= 2; i++) {
        let mSoma = 0;
        for (let j = 0; j < vCNPJ.length; j++) {
            mSoma += vCNPJ.substring(j, j + 1) * aTabCNPJ[j];
        }
        if (i === 2) mSoma += 2 * mDigito;
        mDigito = (mSoma * 10) % 11;
        if (mDigito === 10) mDigito = 0;
        mControle = (mControle * 10) + mDigito;
        aTabCNPJ = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3];
    }
    return mControle;
};

// Function to apply input masks
const setMask = () => {
    $('#moip_cc_number').mask("0000 0000 0000 0000 0000");
    $('#moip_cc_cid').mask("000Z", { translation: { 'Z': { pattern: /[0-9]/, optional: true } } });
    $('#postcode').mask("00000-000", { placeholder: "_____-___" });
    $('#fax').mask("(00)00000-0000", { placeholder: "(__)____-_____", translation: { 'Z': { pattern: /[0-9]/, optional: true } } });
    $('#telephone').mask("(00)00000-0000", { placeholder: "(__)____-_____", translation: { 'Z': { pattern: /[0-9]/, optional: true } } });
    $('#credito_portador_cpf').mask("000.000.000-00", { placeholder: "___.___.___-__" });
    $('#taxvat').mask("000.000.000-00", { placeholder: "___.___.___-__" });
    $('#cnpj').mask("00.000.000/0000-00", { placeholder: "__.___.___/____-__" });
};

// Function to add custom validation rules
const addValidateFormCreate = () => {
    Validation.add('validate-cpf', 'O CPF informado é inválido', (v) => validateTypeDocument(v, 1));
    Validation.add('validate-cnpj', 'O CNPJ informado é inválido', (v) => validateTypeDocument(v, 2));
    Validation.add('validate-tel-brazil', 'Entre com telefone válido: (99)9999-9999 ou caso tenha o 9º digito (99)9999-99999', (v) =>
        Validation.get('IsEmpty').test(v) || /^([()])([0-9]){2}([)])([0-9]){4,5}([-])([0-9]){3,4}$/.test(v)
    );
    Validation.add('validate-zip-br', 'Entre com um cep válido: 99999-999', (v) =>
        Validation.get('IsEmpty').test(v) || /^([0-9]){5}([-])([0-9]){3}$/.test(v)
    );
    Validation.add('validate-if-email-exist', '', (v) => {
        let isNewCustomer = false;
        new Ajax.Request(url_indetify, {
            method: 'post',
            asynchronous: false,
            parameters: { email: v, form_key: $("input[name='form_key']").val() },
            requestHeaders: { Accept: 'application/json' },
            onSuccess: (response) => {
                if (response.responseJSON.is_user) {
                    isNewCustomer = false;
                    Validation.get('validate-if-email-exist').error = 'Email já cadastrado';
                    $("#loginModel").modal();
                } else {
                    isNewCustomer = true;
                }
            },
        });
        return isNewCustomer;
    });
};
// Function to fix button placement
const fixedButtonPlace = () => {
    const topHeader = $("#checkout-moip-header").outerHeight(true);
    const meioPgAltura = $("#meio-de-pagamento").outerHeight(true);
    const meioPgDistancia = $("#meio-de-pagamento").offset().top;
    const bottomForAffix = meioPgAltura + meioPgDistancia;
    const reviewItensTop = $("#review").offset().top;
    const reviewItensAltura = $("#review").outerHeight(true);
    const alturaButton = $(".actions-fixed").outerHeight(true);
    const footerBottom = $("#footer-inbootom").offset().top;
    const stop = footerBottom;
    const start = parseInt(reviewItensTop) + parseInt(reviewItensAltura);

    if (reviewItensAltura < meioPgAltura) {
        $(".actions-fixed").affix({ offset: { top: start, bottom: 240 } });
    }
};

// Function to activate payment form
const paymentFormActive = () => {
    $("input[name='payment[method]']").on('change', function() {
        const codeMethod = $(this).val();
        const selectMethod = "#payment_form_" + codeMethod;
        payment.switchMethod(codeMethod);
        $(selectMethod).show();
    });
};

// Function to remove a product by ID
const removeProductId = (productId) => {
    if (confirm("Tem certeza que deseja remover o produto?")) {
        removeProduct(productId);
    }
};

// Function to update quantity in the review section
const updateQtyReview = () => {
    $('.btn-number').on('click', (e) => {
        e.preventDefault();
        const fieldName = $(e.target).attr('data-field');
        const type = $(e.target).attr('data-type');
        const input = $(`input[name='${fieldName}']`);
        let currentVal = parseInt(input.val());
        const oldValue = parseInt(input.attr('data-oldValue'));

        if (!isNaN(currentVal)) {
            if (type === 'minus') {
                if (currentVal > input.attr('min')) {
                    if (parseInt(oldValue - 1) === parseInt(currentVal - 1)) {
                        input.val(currentVal - 1).change();
                    }
                }
                if (parseInt(input.val()) === input.attr('min')) {
                    $(e.target).attr('disabled', true);
                }
            } else if (type === 'plus') {
                if (currentVal < input.attr('max')) {
                    if (parseInt(oldValue + 1) === parseInt(currentVal + 1)) {
                        input.val(currentVal + 1).change();
                    }
                }
                if (parseInt(input.val()) === input.attr('max')) {
                    $(e.target).attr('disabled', true);
                }
            }
        } else {
            input.val(0);
        }
    });

    $('.input-number').on('focusin', function() {
        $(this).data('oldValue', $(this).val());
    });

    $('.input-number').on('change', function() {
        const minValue = parseInt($(this).attr('min'));
        const maxValue = parseInt($(this).attr('max'));
        const valueCurrent = parseInt($(this).val());
        const name = $(this).attr('name');

        if (valueCurrent >= minValue) {
            $(`.btn-number[data-type='minus'][data-field='${name}']`).removeAttr('disabled');
        } else {
            $(this).val($(this).data('oldValue'));
        }

        if (valueCurrent <= maxValue) {
            $(`.btn-number[data-type='plus'][data-field='${name}']`).removeAttr('disabled');
        } else {
            $(this).val($(this).data('oldValue'));
        }

        setTimeout(updateQty, 2000);
    });

    $('.input-number').on('keydown', (e) => {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
};

// Function to bind change events
const changeEvents = () => {
    updateQtyReview();
    saveShipping();
    validateOnBlur("onestep_form");

    $("#onestep_form_identify").on("submit", (e) => {
        e.preventDefault();
        identifyUser();
    });

    $("#form-loggin").on("submit", (e) => {
        e.preventDefault();
        authenticate();
    });

    $('#allow_gift_messages').on('click', function() {
        if ($(this).is(':checked')) {
            $('#allow-gift-message-container').show();
        } else {
            $('#allow-gift-message-container').hide();
        }
    });

    $('.moip-place-order').on("click", (e) => {
        e.preventDefault();
        visibilyloading();
        const form = new VarienForm('onestep_form', true);
        if (form.validator.validate()) {
            updateOrderMethod();
            return true;
        } else {
            visibilyloading('end');
            getErroDescription();
            $('#ErrosFinalizacao').modal();
            $(".moip-place-order").show();
            $('.validation-advice').delay(5000).fadeOut("slow");
            return false;
        }
    });
};

// Function to search address by postal code
const buscarEndereco = (whatform) => {
    $(".hide-zip-code").addClass("show-zip-code");
    const postcode = $('#postcode').val();
    const street1 = $('#street1');
    const street2 = $('#street2');
    const street4 = $('#street4');
    const city = $('#city');
    const region = $('#region_id');

    $.ajax({
        type: 'GET',
        url: `${url_busca_cep}meio/cep/cep/${postcode.replace(/[^\d\.]/g, '')}`,
        beforeSend: () => {
            street1.attr('placeholder', 'Buscando Endereço');
            street4.attr('placeholder', 'Buscando Endereço');
            city.attr('placeholder', 'Buscando Endereço');
        },
        success: (addressData) => {
            if (!addressData.error) {
                street1.val(addressData.logradouro).focus();
                street4.val(addressData.bairro).focus();
                city.val(addressData.cidade).focus();
                region.val(addressData.ufid).focus();
                street2.focus();
            } else {
                street1.attr('placeholder', '').val('');
                street4.attr('placeholder', '').val('');
                city.attr('placeholder', '').val('');
                region.attr('placeholder', '').val('');
            }
        },
        error: () => {
            street1.attr('placeholder', '').val('');
            street4.attr('placeholder', '').val('');
            city.attr('placeholder', '').val('');
            region.attr('placeholder', '').val('');
            street1.focus();
        },
    });
};

// Function to remove a coupon
const removeCoupon = () => {
    $.ajax({
        type: "POST",
        url: updatecouponurl,
        data: $("#onestep_form").serialize(),
        success: () => location.reload(),
        error: () => location.reload(),
    });
};

// Function to update a coupon
const updateCoupon = () => {
    visibilyloading();
    $.ajax({
        type: "POST",
        url: updatecouponurl,
        data: $("#onestep_form").serialize(),
        success: () => location.reload(),
        error: () => location.reload(),
    });
};

// Function to remove a product
const removeProduct = (id) => {
    $.ajax({
        type: "POST",
        url: removeproducturl,
        data: { id },
        beforeSend: visibilyloading,
        success: () => location.reload(),
    });
};

// Function to check login status
const logined = () => customer_status;

// Function to check login step
const checkedLoginStep = (val) => {
    $.ajax({
        type: "POST",
        url: updateemailmsg,
        data: { email: val },
        success: (msg) => {
            if (msg === 0) {
                $('.pre-step').hide();
                $('#login-checked').show();
                $('#checked-login-email').val(val);
            } else {
                $('.pre-step').hide();
                $('#billing\\:email').val(val);
                $('#create-checked').show();
            }
        },
    });
};

// Function to update quantity
const updateQty = () => {
    visibilyloading();
    $.ajax({
        url: updateqtyurl,
        data: $("#onestep_form").serialize(),
        success: () => location.reload(),
    });
};

// Function to handle payment changes
const paymentChange = () => {
    const payment = new Payment('co-payment-form', set_payment_form);
    payment.init();
    paymentFormActive();

    $("input[name='payment[method]']").on('change', savePaymentMethod);
    $("#credito_parcelamento").on('change', savePaymentMethod);
    $("#moip_cc_count_cofre").on('change', savePaymentMethod);
    $('[data-toggle="popover"]').popover();
};

// Function to initialize shipping time
const startTimeShipping = () => {};

})(jQuery);
