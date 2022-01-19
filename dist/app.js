"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
;
function autoBind(_, __, descriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        get() {
            const boundFunction = originalMethod.bind(this);
            return boundFunction;
        }
    };
    return adjustedDescriptor;
}
;
function validator(input) {
    let isValid = true;
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLength != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length >= input.minLength;
    }
    if (input.maxLength != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length <= input.maxLength;
    }
    if (input.min != null && typeof input.value === 'number') {
        isValid = isValid && input.value >= input.min;
    }
    if (input.max != null && typeof input.value === 'number') {
        isValid = isValid && input.value <= input.max;
    }
    return isValid;
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.config();
        this.attach();
    }
    clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    submit(e) {
        e.preventDefault();
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
        }
        this.clearInput();
    }
    getUserInput() {
        const inputTitle = this.titleInputElement.value;
        const inputDescription = this.descriptionInputElement.value;
        const inputPeople = this.peopleInputElement.value;
        const titleValidator = {
            value: inputTitle,
            required: true,
            maxLength: 50
        };
        const descriptionValidator = {
            value: inputDescription,
            required: true,
            minLength: 5
        };
        const peopleValidator = {
            value: inputPeople,
            required: true,
            min: 1,
            max: 5
        };
        const validations = !validator(titleValidator) ||
            !validator(descriptionValidator) ||
            !validator(peopleValidator);
        if (validations) {
            alert('Invalid Input');
            return;
        }
        else {
            return [inputTitle, inputDescription, +inputPeople];
        }
    }
    config() {
        this.element.addEventListener('submit', this.submit);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
__decorate([
    autoBind
], ProjectInput.prototype, "submit", null);
const projectInput_ = new ProjectInput();
//# sourceMappingURL=app.js.map