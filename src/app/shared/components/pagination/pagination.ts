import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
 
  // pages = input(0);

  // currentPage = input<number>(1);

  // getPagesList = computed(() => {
  //   return Array.from(
  //     { length: this.pages() },
  //     (_, i) => i + 1
  //   );
  // });

 pages = input(0);
  currentPage = input<number>(1);

  previousPage = computed(() => Math.max(this.currentPage() - 1, 1));

  nextPage = computed(() => Math.min(this.currentPage() + 1, this.pages()));

  getPagesList = computed<PaginationItem[]>(() => {
    const totalPages = this.pages();
    const current = this.currentPage();

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: PaginationItem[] = [1, 2];

    if (current > 4) {
      pages.push('ellipsis');
    }

    const start = Math.max(3, current - 1);
    const end = Math.min(totalPages - 2, current + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (current < totalPages - 3) {
      pages.push('ellipsis');
    }

    pages.push(totalPages - 1, totalPages);

    return pages;
  });
}
