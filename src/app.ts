//  drag and drop interface
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

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
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFN: Listener<T>) {
    this.listeners.push(listenerFN);
  }
}

class ProjectSate extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectSate;

  private constructor () {
    super();
  }

  static getSingletonInstance () {
    if (this.instance) return this.instance;
    this.instance = new ProjectSate();
    return this.instance;
  }

  addProject(title: string, description: string, number: number) {
    const newProject = new Project(Math.random.toString(), title, description, number, ProjectStatus.ACTIVE);
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject (projectID: string, newStatus: ProjectStatus) {
    const foundProject = this.projects.find(p => p.id === projectID);
    if (foundProject && foundProject.status !== newStatus) {
      foundProject.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners () {
    this.listeners.forEach((listener) => {
      listener(this.projects.slice());
    });
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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor (templateID: string, hostElementID: string, insertAtStart: boolean, newElementID?: string) {
    this.templateElement = document.getElementById(templateID)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementID)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementID) this.element.id = newElementID;

    this.attach(insertAtStart);
  }

  private attach (insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent():void ;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
  private project: Project;

  get persons () {
    return this.project.people === 1 ? '1 person' : `${this.project.people} persons`
  }

  constructor (hostID: string, project: Project) {
    super('single-project', hostID, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_: DragEvent) {

  }

  configure () {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.persons} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
  assignedProject: Project[];

  constructor (private status: 'active' | 'finished') {
    super('project-list', 'app', false, `${status}-projects`);

    this.assignedProject = [];

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const pID = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(pID, this.status === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED);
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  // ! private

  private renderProjects () {
    const list = document.getElementById(`${this.status}-projects-lists`)! as HTMLUListElement;
    list.innerHTML = '';
    for (const projectItem of this.assignedProject) {
      new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
    }
  }

  configure () {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter(p => {
        if (this.status === 'active') return p.status === ProjectStatus.ACTIVE;
        return p.status === ProjectStatus.FINISHED;
      });
      this.assignedProject = relevantProject;
      this.renderProjects();
    });
  }

  renderContent () {
    const listID = `${this.status}-projects-lists`;
    this.element.querySelector('ul')!.id = listID;
    this.element.querySelector('h2')!.textContent = this.status.toUpperCase() + 'PROJECTS';
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor () {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

    this.configure();
  }

  configure () {
    this.element.addEventListener('submit', this.submit);
  }

  renderContent () {}

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
}

// INIT FORM
const projectInput_: ProjectInput = new ProjectInput();
const activeList = new ProjectList('active');
const finishedList = new ProjectList('finished');
