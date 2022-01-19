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

  @autoBind
  private submit (e: Event) {
    e.preventDefault();
    this.getUserInput();
  }

  private getUserInput (): [string, string, number] | void {
    const inputTitle = this.titleInputElement.value;
    const inputDescription = this.descriptionInputElement.value;
    const inputPeople = this.peopleInputElement.value;

    const validation: Boolean = inputTitle.trim().length === 0 ||
                                inputDescription.trim().length === 0 ||
                                inputPeople.trim().length === 0;
    if (validation) {
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
