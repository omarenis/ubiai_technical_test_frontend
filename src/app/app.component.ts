import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TextSelectEvent} from "./directive/text-select.directive";
import {HttpClient} from "@angular/common/http";
interface Skill
{
  id: number;
  label: string;
  style: string;
}
interface Annotation
{
  start: number,
  end: number,
  label: string,
  text: string
}
interface Document
{
  document: string,
  annotations: Annotation[],
}
function randomRgbColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return [r,g,b];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'UBIAI';
  saved = false;
  documentText !: string;
  colors: string[] = [];
  skills !: Skill[];
  editable = true;
  private selectedSkill !: Skill | null;
  formGroup !: FormGroup;
  annotations !: Annotation[];
  documentFormGroup !: FormGroup;
  constructor(private httpClient: HttpClient) {}
  ngOnInit(): void {
    this.formGroup =  new FormGroup({
      skill: new FormControl('', [Validators.required])
    });
    this.documentFormGroup = new FormGroup(
      {
        document: new FormControl('', [Validators.required])
      }
    )
    this.annotations = [];
    this.selectedSkill = null;
    this.skills = [];
  }

  @ViewChild('documentView') documentView !: ElementRef;
  addSkill($event: Event): void {
    $event.preventDefault();
    const [r, g, b] = randomRgbColor();
    const styleString = `rgb(${r}, ${g}, ${b})`;
    this.skills.push(
      <Skill> {
        label: this.formGroup.value.skill, style: "background-color: "+styleString
      }
    );
    this.formGroup.reset();
  }
  getSelectedText($event: TextSelectEvent)
  {
    if(this.selectedSkill !== null)
    {
      let startText = this.documentText.indexOf($event.text);
      let endText = startText + $event.text.length;
      let newElement = `<span class="non-select fs-5 text-white p-2" style="${this.selectedSkill.style}">${$event.text}<span class="bg-white text-black fs-6 p-1 m-2">${this.selectedSkill.label}</span></span>`;
      console.log($event.text);
      if($event.text.length !== 1)
      {
        this.documentView.nativeElement.innerHTML = this.documentView.nativeElement.innerHTML.replace(
          $event.text, newElement
        );
      }
      this.annotations.push({
        label: this.selectedSkill.label,
        start: startText,
        end: endText,
        text: $event.text
      });
      console.log(this.annotations);
    }
  }
  selectLabel(skill: Skill) {
    this.selectedSkill = skill;
  }

  validate($event: Event)
  {
    $event.preventDefault();
    this.documentText = this.documentFormGroup.value.document;
    this.editable = false;
  }
  editContent() {
    this.annotations = [];
    this.editable = true;
  }

  sendData() {
    console.log(<Document>{
      document: this.documentText,
      annotations: this.annotations
    });
    this.httpClient.post<Document>('http://localhost:8000/export_document', <Document>{
      document: this.documentText,
      annotations: this.annotations
    }).subscribe(() => {
      this.saved = true;
    });
  }
}
