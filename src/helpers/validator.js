const storage = require('../helpers/storage');

module.exports = (() => {

    function validateFormData(dataObj, formName) {
        storage.saveAsJson('validator', {});

        let formsValidation = {
            register: regLoginValidation,
            login: regLoginValidation,
            create: createEditValidation,
            edit: createEditValidation
        };

        function regLoginValidation(dataObj, key) {
            let currentInput = $(`[name=${key}]`);

            switch (key) {
                case 'username':
                    const usernameRegex = RegExp('^[A-Za-z]{3,}$');
                    usernameRegex.test(dataObj[key])
                        ? validInput(currentInput)
                        : invalidInput(currentInput, 'Field must contains 3 or more latin letters!');
                    break;

                case 'password':
                case 'repeatPass':
                    const passwordRegex = RegExp('^[A-Za-z0-9]{6,}$');
                    passwordRegex.test(dataObj[key])
                        ? validInput(currentInput)
                        : invalidInput(currentInput, 'Field must contains 6 or more latin letters and digits!');
                    break;
            }
        }

        function createEditValidation(dataObj, key) {
            let currentInput = $(`[name=${key}]`);

            switch (key) {
                case 'name':
                    const titleRegex = RegExp('^.{3,10}$');
                    titleRegex.test(dataObj[key])
                        ? validInput(currentInput)
                        : invalidInput(currentInput, 'Minimum 2, maximum 10 characters allowed!');
                    break;

                case 'description':
                    const descriptionRegex = RegExp('^.{5,450}$');
                    descriptionRegex.test(dataObj[key])
                        ? validInput(currentInput)
                        : invalidInput(currentInput, 'Minimum 5, maximum 450 characters allowed!');
                    break;

                case 'imageURL':
                    const modelRegex = RegExp('^http?.+$');
                    modelRegex.test(dataObj[key])
                        ? validInput(currentInput)
                        : invalidInput(currentInput, 'Invalid image URL!');
                    break;

                case 'category':
                    const validationRegex = RegExp('^.+');
                    validationRegex.test(dataObj[key])
                        ? validInput(currentInput)
                        : invalidInput(currentInput, 'Category is required!');
                    break;
            }
        }

        for (let key in dataObj) {
            formsValidation[formName](dataObj, key);
        }
    }

    function isFormValid() {
        const formValidations = storage.getJson('validator');
        return !Object.values(formValidations).includes('invalid');
    }

    async function validInput(jqueryElement) {
        const inputName = jqueryElement.attr('name');
        storage.saveToValidator(inputName, 'valid');
        await jqueryElement.parent().next()
            .hide('slow', () => {
                jqueryElement.parent().next().remove();
            });
    }

    async function invalidInput(jqueryElement, message) {
        const inputName = jqueryElement.attr('name');
        storage.saveToValidator(inputName, 'invalid');

        await jqueryElement.parent().next().remove();
        const errorDiv = $(`<div class="danger">${message}</div>`);

        await jqueryElement.parent().after(errorDiv);
        await errorDiv.show('slow');
    }

    function escapeSpecialChars(dataObj, excludeArr) {
        let result = {};

        function escape(string) {
            let escape = $('<p></p>');
            escape.text(string);

            return escape.text();
        }

        for (let key in dataObj) {
            if (excludeArr.includes(key)) {
                result[key] = dataObj[key];
            } else {
                result[key] = escape(dataObj[key]);
            }
        }

        return result;
    }

    return {
        validateFormData,
        isFormValid,
        escapeSpecialChars
    }
})();