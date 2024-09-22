import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf, ngFor, and ngClass
import { FlowerService } from '../services/flower.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-flower',
  standalone: true,
  templateUrl: './flower.component.html',
  styleUrls: ['./flower.component.css'],
  imports: [CommonModule, ReactiveFormsModule]  // Ensure CommonModule is imported
})
export class FlowerComponent implements OnInit {
  flowers: any[] = [];
  listView: boolean = false;
  showModal: boolean = false;
  addFlowerForm!: FormGroup;  // Non-null assertion to inform TypeScript that this will be initialized

  constructor(private flowerService: FlowerService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.flowerService.getFlowers().subscribe(
      (response) => {
        // Update the flower images to point to the Flask server
        this.flowers = response.flowers.map((flower: { image_filename: any; }) => {
          return {
            ...flower,
            imageUrl: `https://self.pythonanywhere.com/uploads/${flower.image_filename}`
          };
        });
      },
      (error) => {
        console.error('Error fetching flowers:', error);
      }
    );

    // Initialize the add flower form
    this.addFlowerForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required],
      stems_per_bunch: ['', Validators.required],
      cost_per_stem: ['', Validators.required],
      total_cost: ['', Validators.required],
      supplier: [''],
      image: ['']
    });
  }

  switchToListView(): void {
    this.listView = true;
  }

  switchToGalleryView(): void {
    this.listView = false;
  }

  openAddFlowerModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitFlower(): void {
    if (this.addFlowerForm.valid) {
      const newFlower = this.addFlowerForm.value;
      // Call the flower service to add a new flower (API integration)
      console.log(newFlower); // Placeholder for actual API call
      this.closeModal(); // Close the modal after submitting
    }
  }
}
