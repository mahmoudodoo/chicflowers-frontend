import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventDesignService } from '../../services/event-design.service';

@Component({
  selector: 'app-add-personals-arrangement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-personals-arrangement-modal.component.html',
  styleUrls: ['./add-personals-arrangement-modal.component.css'],
})
export class AddPersonalsArrangementModalComponent implements OnInit {
  arrangementTypeId!: number;
  arrangementTypeName!: string; // To display arrangement type name
  arrangements: any[] = [];
  filteredArrangements: any[] = []; // Array to hold filtered arrangements
  searchTerm: string = ''; // Search term for filtering

  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 6; // Number of items per page
  totalItems: number = 0;
  paginatedArrangements: any[] = []; // Array to hold paginated arrangements

  constructor(
    public activeModal: NgbActiveModal,
    private eventDesignService: EventDesignService
  ) {}

  ngOnInit(): void {
    this.loadArrangementsByType();
  }

  loadArrangementsByType(): void {
    this.eventDesignService
      .getArrangementsByType(this.arrangementTypeId)
      .subscribe(
        (response) => {
          if (response.success) {
            this.arrangements = response.arrangements.map((arrangement: any) => {
              return {
                ...arrangement,
                image_filename: this.formatImageUrl(arrangement.image_filename) // Format the image URL correctly
              };
            });
            this.filteredArrangements = this.arrangements; // Initialize filtered arrangements
            this.totalItems = this.filteredArrangements.length; // Set total items for pagination
            this.paginateArrangements(); // Initialize pagination
          } else {
            console.error('Failed to load arrangements:', response.message);
          }
        },
        (error) => {
          console.error('Error loading arrangements:', error);
        }
      );
  }

  // Handle pagination
  paginateArrangements(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedArrangements = this.filteredArrangements.slice(startIndex, endIndex);
  }

  // Navigate to the next page
  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.paginateArrangements();
    }
  }

  // Navigate to the previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateArrangements();
    }
  }

  // Filter arrangements based on the search term
  filterArrangements(): void {
    this.filteredArrangements = this.arrangements.filter(arrangement =>
      arrangement.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalItems = this.filteredArrangements.length; // Update the total number of filtered items
    this.currentPage = 1; // Reset to the first page after filtering
    this.paginateArrangements(); // Paginate the filtered results
  }

  // Handle click event directly on the arrangement item
  selectArrangement(arrangementId: number): void {
    this.activeModal.close(arrangementId); // Automatically close the modal and return the selected arrangement
  }

  close(): void {
    this.activeModal.dismiss();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const backdrop = document.querySelector('.modal-backdrop');
      const modal = document.querySelector('.modal-dialog');
      if (backdrop && modal) {
        backdrop.setAttribute('style', 'z-index: 1040 !important');
        modal.setAttribute('style', 'z-index: 1055 !important');
      }
    }, 100);
  }

  formatImageUrl(filename: string): string {
    if (!filename) {
      return 'https://self.pythonanywhere.com/uploads/no_image.png'; // Return a default image if the filename is empty
    }
    if (filename.startsWith('//s3')) {
      return 'https:' + filename; // Correctly format S3 URLs
    }
    return 'https://self.pythonanywhere.com/uploads/' + filename; // Return the local Flask uploads URL for local filenames
  }
}
