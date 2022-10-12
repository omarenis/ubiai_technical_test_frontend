import {Directive, ElementRef, EventEmitter, NgZone} from '@angular/core';


export interface TextSelectEvent {
  text: string;
  viewportRectangle: SelectionRectangle | null;
  hostRectangle: SelectionRectangle | null;
}

interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}
@Directive({
  selector: '[textSelect]',
  outputs: [ "textSelectEvent: textSelect" ]
})
export class TextSelectDirective {

  public textSelectEvent: EventEmitter<TextSelectEvent>;

  private elementRef: ElementRef;
  private hasSelection: boolean;
  private zone: NgZone;

  // I initialize the text-select directive.
  constructor(
    elementRef: ElementRef,
    zone: NgZone
  ) {

    this.elementRef = elementRef;
    this.zone = zone;
    this.hasSelection = false;
    this.textSelectEvent = new EventEmitter();

  }

  public ngOnDestroy() : void {

    // Unbind all handlers, even ones that may not be bounds at this moment.
    this.elementRef.nativeElement.removeEventListener( "mousedown", this.handleMousedown, false );
    document.removeEventListener( "mouseup", this.handleMouseup, false );
    document.removeEventListener( "selectionchange", this.handleSelectionchange, false );

  }

  public ngOnInit() : void {

    this.zone.runOutsideAngular(
      () => {

        this.elementRef.nativeElement.addEventListener( "mousedown", this.handleMousedown, false );
        document.addEventListener( "selectionchange", this.handleSelectionchange, false );

      }
    );
  }

  private getRangeContainer( range: Range ) : null | Node {

    let container: Node | ParentNode | null = range.commonAncestorContainer;
      while (container !== null && container.nodeType !== Node.ELEMENT_NODE ) {

        if ("parentNode" in container) {
          container = container.parentNode;
        }

      }
      return( container );
  }


  // I handle mousedown events inside the current element.
  private handleMousedown = () : void => {
    document.addEventListener( "mouseup", this.handleMouseup, false );

  }


  // I handle mouseup events anywhere in the document.
  private handleMouseup = () : void => {

    document.removeEventListener( "mouseup", this.handleMouseup, false );

    this.processSelection();

  }


  // I handle selectionchange events anywhere in the document.
  private handleSelectionchange = () : void => {
    if ( this.hasSelection ) {
      this.processSelection();

    }
  }

  private processSelection() : void {
    const selection = document.getSelection();
    if (!selection || !selection.rangeCount || ! selection.toString() ) {
      return;
    }
    const range = selection.getRangeAt(0);
    const rangeContainer = this.getRangeContainer(range);
    if ( this.elementRef.nativeElement.contains( rangeContainer ) ) {
      this.zone.runGuarded(
        () => {
          this.hasSelection = false;
          this.textSelectEvent.next({
            text: selection.toString(),
            viewportRectangle: null,
            hostRectangle: null
          });
        }
      );
/*      this.zone.runGuarded(
        () => {
          this.hasSelection = true;
          if(selection)
          {
            this.textSelectEvent.emit({
              text: selection.toString(),
              viewportRectangle: {
                left: viewportRectangle.left,
                top: viewportRectangle.top,
                width: viewportRectangle.width,
                height: viewportRectangle.height
              },
              hostRectangle: {
                left: localRectangle.left,
                top: localRectangle.top,
                width: localRectangle.width,
                height: localRectangle.height
              }
            });
          }
        }
      );*/

    }

  }
}
