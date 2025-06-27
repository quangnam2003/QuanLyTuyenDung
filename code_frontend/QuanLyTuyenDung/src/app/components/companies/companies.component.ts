import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService, Company } from '../../services/mock-data.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  searchQuery = '';
  selectedIndustry = 'Tất cả lĩnh vực';
  selectedSize = 'Tất cả quy mô';
  loading = false;
  error: string | null = null;

  industries = ['Tất cả lĩnh vực', 'Công nghệ thông tin', 'Tài chính - Công nghệ', 'Cloud Computing', 'Thiết kế và Sáng tạo', 'Phân tích dữ liệu'];
  sizes = ['Tất cả quy mô', '10-50 nhân viên', '20-50 nhân viên', '50-100 nhân viên', '50-200 nhân viên', '100-500 nhân viên'];

  constructor(private mockDataService: MockDataService) { }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.error = null;

    try {
      this.companies = this.mockDataService.getAllCompanies();
      this.filteredCompanies = [...this.companies];
      this.loading = false;
    } catch (error) {
      this.error = 'Không thể tải danh sách công ty. Vui lòng thử lại sau.';
      this.loading = false;
    }
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredCompanies = this.companies.filter(company => {
      const matchQuery = !this.searchQuery || 
        company.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        company.location.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchIndustry = this.selectedIndustry === 'Tất cả lĩnh vực' || company.industry === this.selectedIndustry;
      const matchSize = this.selectedSize === 'Tất cả quy mô' || company.size === this.selectedSize;

      return matchQuery && matchIndustry && matchSize;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedIndustry = 'Tất cả lĩnh vực';
    this.selectedSize = 'Tất cả quy mô';
    this.filteredCompanies = [...this.companies];
  }

  viewCompanyDetails(company: Company) {
    console.log('Viewing company details:', company);
    // TODO: Navigate to company details page
    // this.router.navigate(['/companies', company.id]);
  }
} 