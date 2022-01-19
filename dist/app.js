"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
    ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
})(ProjectStatus || (ProjectStatus = {}));
;
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectSate {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getSingletonInstance() {
        if (this.instance)
            return this.instance;
        this.instance = new ProjectSate();
        return this.instance;
    }
    addProject(title, description, number) {
        const newProject = new Project(Math.random.toString(), title, description, number, ProjectStatus.ACTIVE);
        this.projects.push(newProject);
        this.listeners.forEach((listener) => {
            listener(this.projects.slice());
        });
    }
    addListener(listenerFN) {
        this.listeners.push(listenerFN);
    }
}
const projectState = ProjectSate.getSingletonInstance();
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
class ProjectList {
    constructor(status) {
        this.status = status;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        this.assignedProject = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.status}-projects`;
        projectState.addListener((projects) => {
            this.assignedProject = projects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    renderProjects() {
        const list = document.getElementById(`${this.status}-projects-lists`);
        for (const projectItem of this.assignedProject) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            list.appendChild(listItem);
        }
    }
    renderContent() {
        const listID = `${this.status}-projects-lists`;
        this.element.querySelector('ul').id = listID;
        this.element.querySelector('h2').textContent = this.status.toUpperCase() + 'PROJECTS';
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
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
            projectState.addProject(title, description, people);
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
const activeList = new ProjectList('active');
const finishedList = new ProjectList('finished');
//# sourceMappingURL=app.js.map