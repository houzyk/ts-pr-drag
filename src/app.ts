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

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor () {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.element.id = 'user-input';
    this.titleInput = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInput = this.element.querySelector('#description')! as HTMLInputElement;
    this.peopleInput = this.element.querySelector('#people')! as HTMLInputElement;

    this.config();
    this.attach();
  }

  @autoBind
  private submit (e: Event) {
    e.preventDefault();
    // todo
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
