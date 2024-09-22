import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ArrangementsService } from '../services/arrangements.service';
import { ArrangementModalComponent } from './arrangement-modal/arrangement-modal.component';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-arrangements',
  templateUrl: './arrangements.component.html',
  styleUrls: ['./arrangements.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ArrangementsComponent implements OnInit {
  arrangements: any[] = [];
  userId = 1;
  flaskServerUrl = 'https://self.pythonanywhere.com/uploads/';
  currentPage: number = 1;
  perPage: number = 10; // Number of arrangements per page
  totalArrangements: number = 0;
  totalPages: number = 0;

  // For tracking hover events
  hoveredName: number | null = null;
  hoveredDescription: number | null = null;
  hoveredIngredients: number | null = null;

  constructor(
    private arrangementsService: ArrangementsService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadArrangements();
  }

  loadArrangements(): void {
    this.arrangementsService.getArrangements(this.userId, this.currentPage, this.perPage).subscribe(
      (response) => {
        if (response && response.arrangements) {
          this.arrangements = response.arrangements.map((arrangement: { image_filename: string; }) => {
            return {
              ...arrangement,
              image_filename: this.formatImageUrl(arrangement.image_filename)
            };
          });
          this.totalArrangements = response.total;
          this.totalPages = response.pages;
        }
      },
      (error) => {
        console.error('Error loading arrangements:', error);
      }
    );
  }
  
  formatImageUrl(filename: string): string {
    if (filename.startsWith('//s3')) {
      return 'https:' + filename; // Converts S3 links to proper URLs
    }
    return this.flaskServerUrl + filename; // Prefixes non-S3 filenames with the Flask uploads URL
  }
  
  openModal(arrangement: any): void {
    // Fetch the arrangement details by ID to ensure all data is available
    this.arrangementsService.getArrangement(arrangement.id).subscribe(
      (response: any) => {
        const modalRef = this.modalService.open(ArrangementModalComponent);
        modalRef.componentInstance.arrangement = response; // Use the fetched arrangement data
        modalRef.componentInstance.ingredients = arrangement.ingredients;
        modalRef.result.then((updatedArrangement) => {
          if (updatedArrangement) {
            this.updateArrangementInList(updatedArrangement);
          }
        }).catch((error) => {
          console.log('Modal closed:', error);
        });
      },
      (error) => {
        console.error('Error fetching arrangement details:', error);
      }
    );
  }
  

  updateArrangementInList(updatedArrangement: any): void {
    const index = this.arrangements.findIndex(a => a.id === updatedArrangement.id);
    if (index !== -1) {
      this.arrangements[index] = updatedArrangement;
    }
  }

  onImageError(event: any): void {
    const defaultImage = this.flaskServerUrl + 'no_image.png';
    if (event.target.src !== defaultImage) {
      event.target.src = defaultImage;
    }
  }

  // Pagination Methods
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadArrangements();
    }
  }

  // Event handlers for hover events
  onHoverName(id: number): void {
    this.hoveredName = id;
  }

  onHoverDescription(id: number): void {
    this.hoveredDescription = id;
  }

  onHoverIngredients(id: number): void {
    this.hoveredIngredients = id;
  }

  onLeaveHover(): void {
    this.hoveredName = null;
    this.hoveredDescription = null;
    this.hoveredIngredients = null;
  }
}
