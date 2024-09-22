import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ArrangementsService } from '../../services/arrangements.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-arrangement-modal',
  standalone: true,
  templateUrl: './arrangement-modal.component.html',
  styleUrls: ['./arrangement-modal.component.css'],
  imports: [FormsModule, CommonModule],
})
export class ArrangementModalComponent implements OnInit, AfterViewInit {
  @Input() arrangement: any;
  @Input() ingredients: any[] = [];
  @Output() onSave = new EventEmitter<any>();

  newIngredients: any[] = [];
  ingredientChoices: any[] = [];

  selectedIngredient: any = {};
  selectedQuantity: number = 1;

  typeChoices: any[] = [];
  colorChoices: any[] = [];
  weddingStyleChoices: any[] = [];
  selectedType: number | null = null;
  selectedColor: number | null = null;
  selectedWeddingStyle: number | null = null;

  isShareable: boolean = false;
  imagePreview: string = '';
  flaskServerUrl = 'https://self.pythonanywhere.com/uploads/';
  constructor(
    public activeModal: NgbActiveModal,
    private arrangementsService: ArrangementsService
  ) {}

  ngOnInit(): void {
    this.newIngredients = Array.isArray(this.ingredients) ? [...this.ingredients] : [];
  
    this.selectedType = this.arrangement.type_id;
    this.selectedColor = this.arrangement.color_id;
    this.selectedWeddingStyle = this.arrangement.wedding_style_id;
  
    // Handle image URL formatting
    this.imagePreview = this.formatImageUrl(this.arrangement.image_filename);
  
    this.isShareable = !!this.arrangement?.is_shareable; // Converts 1/0 or true/false to boolean
  
    this.loadTypeChoices();
    this.loadColorChoices();
    this.loadWeddingStyleChoices();
  
    this.arrangementsService.getIngredientChoices().subscribe((response: any) => {
      this.ingredientChoices = Array.isArray(response.ingredients) ? response.ingredients : [];
      this.setDefaultIngredients();
    });
  }
  
  formatImageUrl(filename: string): string {
    if (filename.startsWith('//s3')) {
      return 'https:' + filename; // Correctly format S3 URLs
    } else if (filename) {
      return this.flaskServerUrl + filename; // Append Flask server URL for local filenames
    }
    return ''; // Default case, return empty string or a default image path
  }
  

  loadTypeChoices(): void {
    this.arrangementsService.getTypeChoices().subscribe((response: any) => {
      this.typeChoices = response.types || [];
      if (this.arrangement && this.arrangement.type_id) {
        this.selectedType = this.arrangement.type_id;
      }
    });
  }

  loadColorChoices(): void {
    this.arrangementsService.getColorChoices().subscribe((response: any) => {
      this.colorChoices = response.colors || [];
      if (this.arrangement && this.arrangement.color_id) {
        this.selectedColor = this.arrangement.color_id;
      }
    });
  }

  loadWeddingStyleChoices(): void {
    this.arrangementsService.getWeddingStyleChoices().subscribe((response: any) => {
      this.weddingStyleChoices = response.styles || [];
      if (this.arrangement && this.arrangement.wedding_style_id) {
        this.selectedWeddingStyle = this.arrangement.wedding_style_id;
      }
    });
  }

  setDefaultIngredients(): void {
    if (Array.isArray(this.ingredients) && this.ingredients.length > 0) {
      this.newIngredients = this.ingredients.map((ingredient) => {
        const matchedIngredient = this.ingredientChoices.find(
          (choice) => choice.name === ingredient.name
        );
        return {
          ...ingredient,
          flower_id: matchedIngredient ? matchedIngredient.id : null,
        };
      });
    }
  }

  ngAfterViewInit(): void {
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.setAttribute('style', 'z-index: 1045;');
    }
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.setAttribute('style', 'z-index: 1055;');
    }
  }

  addIngredient(): void {
    if (this.selectedIngredient && this.selectedIngredient.id && this.selectedQuantity > 0) {
      this.newIngredients.push({
        flower_id: this.selectedIngredient.id,
        name: this.selectedIngredient.name,
        quantity: this.selectedQuantity,
      });

      this.selectedIngredient = {};
      this.selectedQuantity = 1;
    }
  }

  removeIngredient(index: number): void {
    this.newIngredients.splice(index, 1);
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveArrangement(): void {
    const formData = new FormData();
    formData.append('id', this.arrangement.id);
    formData.append('name', this.arrangement.name || '');
    formData.append('type_id', this.selectedType?.toString() || this.arrangement.type_id);
    formData.append('color_id', this.selectedColor?.toString() || this.arrangement.color_id);
    formData.append('wedding_style_id', this.selectedWeddingStyle?.toString() || this.arrangement.wedding_style_id);
  
    // Log to ensure the value of isShareable
    // console.log('Is Shareable:', this.isShareable);
  
    // Ensure that true/false is converted to string for FormData
    formData.append('is_shareable', this.isShareable ? 'true' : 'false');
  
    //console.log('Ingredients sent to the server:', this.newIngredients);
    formData.append('ingredients', JSON.stringify(this.newIngredients));
  
    const imageInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (imageInput.files && imageInput.files.length > 0) {
      formData.append('image', imageInput.files[0]);
    }
  
    this.arrangementsService.updateArrangement(formData).subscribe(
      (response) => {
        this.onSave.emit(this.arrangement);
        this.activeModal.close();
      },
      (error) => {
        console.error('Error updating arrangement:', error);
      }
    );
  }
  

  close(): void {
    this.activeModal.dismiss();
  }
}
