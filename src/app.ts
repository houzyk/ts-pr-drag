//  Project
enum ProjectStatus {ACTIVE, FINISHED};
class Project {
  constructor(public id: string,
                      public title: string,
                      public description: string,
                      public people: number,
                      public status: ProjectStatus) {}
}

// state management
type Listener = (items: Project[]) => void;

class ProjectSate {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectSate;

  private constructor () {}

  static getSingletonInstance () {
    if (this.instance) return this.instance;
    this.instance = new ProjectSate();
    return this.instance;
  }

  addProject(title: string, description: string, number: number) {
    const newProject = new Project(Math.random.toString(), title, description, number, ProjectStatus.ACTIVE);
    this.projects.push(newProject);
    this.listeners.forEach((listener) => {
      listener(this.projects.slice());
    });
  }

  addListener(listenerFN: Listener) {
    this.listeners.push(listenerFN);
  }
}

// state
const projectState = ProjectSate.getSingletonInstance();

// validators
interface Valid {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?:number;
};

// decorators
function autoBind (_: any, __: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      return boundFunction;
    }
  };
  return adjustedDescriptor;
};

function validator(input: Valid): boolean {
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
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProject: Project[];

  constructor (private status: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    this.assignedProject = [];

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.status}-projects`;

    projectState.addListener((projects: Project[]) => {
      this.assignedProject = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  // ! private

  private renderProjects () {
    const list = document.getElementById(`${this.status}-projects-lists`)! as HTMLUListElement;
    for (const projectItem of this.assignedProject) {
      const listItem = document.createElement('li');
      listItem.textContent = projectItem.title;
      list.appendChild(listItem);
    }
  }

  private renderContent () {
    const listID = `${this.status}-projects-lists`;
    this.element.querySelector('ul')!.id = listID;
    this.element.querySelector('h2')!.textContent = this.status.toUpperCase() + 'PROJECTS';
  }

  private attach () {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor () {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.element.id = 'user-input';
    this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

    this.config();
    this.attach();
  }

  // ! private

  private clearInput () {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autoBind
  private submit (e: Event) {
    e.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
    }
    this.clearInput();
  }

  private getUserInput (): [string, string, number] | void {
    const inputTitle = this.titleInputElement.value;
    const inputDescription = this.descriptionInputElement.value;
    const inputPeople = this.peopleInputElement.value;

    const titleValidator: Valid = {
      value: inputTitle,
      required: true,
      maxLength: 50
    }

    const descriptionValidator: Valid = {
      value: inputDescription,
      required: true,
      minLength: 5
    }

    const peopleValidator: Valid = {
      value: inputPeople,
      required: true,
      min: 1,
      max: 5
    }

    const validations: boolean = !validator(titleValidator) ||
                                !validator(descriptionValidator) ||
                                !validator(peopleValidator);

    if (validations) {
      alert('Invalid Input');
      return;
    } else {
      return [inputTitle, inputDescription, +inputPeople];
    }
  }

  private config () {
    this.element.addEventListener('submit', this.submit);
  }

  private attach () {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

// INIT FORM
const projectInput_: ProjectInput = new ProjectInput();
const activeList = new ProjectList('active');
const finishedList = new ProjectList('finished');
