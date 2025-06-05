import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CandidateService } from '../../../services/candidate.service';
import { User } from '../../../interfaces/user.interface';
import { Candidate } from '../../../models/candidate.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="profile-container">
      <h2>Hồ sơ của tôi</h2>
      
      <!-- Upload CV Section -->
      <div class="profile-section">
        <h3>Tải lên CV</h3>
        <div class="upload-section">
          <div class="upload-box" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
            <input #fileInput type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx" style="display: none">
            <i class="bi bi-cloud-upload"></i>
            <p>Kéo thả file CV vào đây hoặc click để chọn file</p>
            <p class="file-types">Hỗ trợ: PDF, DOC, DOCX</p>
          </div>
          
          <!-- Uploaded Files -->
          <div class="uploaded-files" *ngIf="uploadedFiles.length > 0">
            <h4>CV đã tải lên</h4>
            <div class="file-list">
              <div class="file-item" *ngFor="let file of uploadedFiles">
                <div class="file-info">
                  <i class="bi bi-file-earmark-text"></i>
                  <span>{{file.name}}</span>
                  <small>{{file.uploadDate | date:'dd/MM/yyyy HH:mm'}}</small>
                </div>
                <div class="file-actions">
                  <a [href]="file.url" target="_blank" class="btn-view">Xem</a>
                  <button class="btn-delete" (click)="deleteResume(file)">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin cơ bản -->
      <div class="profile-section">
        <h3>Thông tin cá nhân</h3>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Họ</label>
              <input type="text" id="firstName" formControlName="firstName" class="form-control">
            </div>
            <div class="form-group">
              <label for="lastName">Tên</label>
              <input type="text" id="lastName" formControlName="lastName" class="form-control">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" formControlName="email" class="form-control" readonly>
            </div>
            <div class="form-group">
              <label for="phone">Số điện thoại</label>
              <input type="tel" id="phone" formControlName="phone" class="form-control">
            </div>
            <div class="form-group">
              <label for="address">Địa chỉ</label>
              <input type="text" id="address" formControlName="address" class="form-control">
            </div>
            <div class="form-group">
              <label for="dateOfBirth">Ngày sinh</label>
              <input type="date" id="dateOfBirth" formControlName="dateOfBirth" class="form-control">
            </div>
            <div class="form-group">
              <label for="gender">Giới tính</label>
              <select id="gender" formControlName="gender" class="form-control">
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          <!-- Học vấn -->
          <div class="profile-section">
            <h3>Học vấn</h3>
            <div formArrayName="education">
              <div *ngFor="let edu of educationArray.controls; let i=index" [formGroupName]="i" class="education-item">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Bằng cấp</label>
                    <input type="text" formControlName="degree" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Chuyên ngành</label>
                    <input type="text" formControlName="major" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Trường học</label>
                    <input type="text" formControlName="school" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Năm tốt nghiệp</label>
                    <input type="number" formControlName="graduationYear" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>GPA</label>
                    <input type="number" step="0.01" formControlName="gpa" class="form-control">
                  </div>
                </div>
                <button type="button" class="btn-remove" (click)="removeEducation(i)">Xóa</button>
              </div>
            </div>
            <button type="button" class="btn-add" (click)="addEducation()">Thêm học vấn</button>
          </div>

          <!-- Kinh nghiệm làm việc -->
          <div class="profile-section">
            <h3>Kinh nghiệm làm việc</h3>
            <div formArrayName="experience">
              <div *ngFor="let exp of experienceArray.controls; let i=index" [formGroupName]="i" class="experience-item">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Công ty</label>
                    <input type="text" formControlName="company" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Vị trí</label>
                    <input type="text" formControlName="position" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Ngày bắt đầu</label>
                    <input type="date" formControlName="startDate" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Ngày kết thúc</label>
                    <input type="date" formControlName="endDate" class="form-control">
                  </div>
                  <div class="form-group full-width">
                    <label>Mô tả công việc</label>
                    <textarea formControlName="description" class="form-control" rows="3"></textarea>
                  </div>
                  <div class="form-group">
                    <label>
                      <input type="checkbox" formControlName="isCurrentJob">
                      Đang làm việc tại đây
                    </label>
                  </div>
                </div>
                <button type="button" class="btn-remove" (click)="removeExperience(i)">Xóa</button>
              </div>
            </div>
            <button type="button" class="btn-add" (click)="addExperience()">Thêm kinh nghiệm</button>
          </div>

          <!-- Kỹ năng -->
          <div class="profile-section">
            <h3>Kỹ năng</h3>
            <div class="form-group">
              <label>Kỹ năng (phân cách bằng dấu phẩy)</label>
              <input type="text" formControlName="skills" class="form-control" placeholder="Ví dụ: JavaScript, Angular, Node.js">
            </div>
          </div>

          <!-- Ngôn ngữ -->
          <div class="profile-section">
            <h3>Ngôn ngữ</h3>
            <div formArrayName="languages">
              <div *ngFor="let lang of languagesArray.controls; let i=index" [formGroupName]="i" class="language-item">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Ngôn ngữ</label>
                    <input type="text" formControlName="language" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Trình độ</label>
                    <select formControlName="proficiency" class="form-control">
                      <option value="Basic">Cơ bản</option>
                      <option value="Intermediate">Trung bình</option>
                      <option value="Advanced">Nâng cao</option>
                      <option value="Native">Thành thạo</option>
                    </select>
                  </div>
                </div>
                <button type="button" class="btn-remove" (click)="removeLanguage(i)">Xóa</button>
              </div>
            </div>
            <button type="button" class="btn-add" (click)="addLanguage()">Thêm ngôn ngữ</button>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="!profileForm.valid || isSubmitting">
              {{isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      text-align: center;
    }

    .profile-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    h3 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    /* Upload Section Styles */
    .upload-section {
      margin-top: 1rem;
    }

    .upload-box {
      border: 2px dashed #3498db;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #f8f9fa;
    }

    .upload-box:hover {
      background: #e9ecef;
      border-color: #2980b9;
    }

    .upload-box i {
      font-size: 3rem;
      color: #3498db;
      margin-bottom: 1rem;
    }

    .upload-box p {
      margin: 0.5rem 0;
      color: #666;
    }

    .file-types {
      font-size: 0.9rem;
      color: #999;
    }

    .uploaded-files {
      margin-top: 2rem;
    }

    .file-list {
      margin-top: 1rem;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .file-info i {
      font-size: 1.5rem;
      color: #3498db;
    }

    .file-info small {
      color: #666;
    }

    .file-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-view,
    .btn-delete {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-view {
      background: #3498db;
      color: white;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
      border: none;
      cursor: pointer;
    }

    /* Form Styles */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      border-color: #3498db;
      outline: none;
      box-shadow: 0 0 0 2px rgba(52,152,219,0.2);
    }

    .education-item,
    .experience-item,
    .language-item {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      position: relative;
    }

    .btn-add,
    .btn-remove {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
    }

    .btn-add {
      background-color: #3498db;
      color: white;
      margin-top: 1rem;
    }

    .btn-add:hover {
      background-color: #2980b9;
    }

    .btn-remove {
      background-color: #e74c3c;
      color: white;
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .btn-remove:hover {
      background-color: #c0392b;
    }

    .btn-save {
      background-color: #2ecc71;
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s;
      width: 100%;
      margin-top: 2rem;
    }

    .btn-save:hover {
      background-color: #27ae60;
    }

    .btn-save:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }

    .form-actions {
      text-align: center;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-section {
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .file-item {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .file-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  uploadedFiles: { type: string; name: string; url: string; uploadDate: Date }[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private candidateService: CandidateService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      education: this.fb.array([]),
      experience: this.fb.array([]),
      skills: [''],
      languages: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserProfile();
    this.loadUploadedFiles();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          email: user.email
        });
      }
    });
  }

  loadUserProfile(): void {
    this.candidateService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          // Patch form with profile data
          this.profileForm.patchValue({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            address: profile.address,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            skills: profile.skills.join(', ')
          });

          // Add education entries
          profile.education.forEach(edu => {
            this.educationArray.push(this.fb.group({
              degree: [edu.degree, Validators.required],
              major: [edu.major, Validators.required],
              school: [edu.school, Validators.required],
              graduationYear: [edu.graduationYear, Validators.required],
              gpa: [edu.gpa]
            }));
          });

          // Add experience entries
          profile.experience.forEach(exp => {
            this.experienceArray.push(this.fb.group({
              company: [exp.company, Validators.required],
              position: [exp.position, Validators.required],
              startDate: [exp.startDate, Validators.required],
              endDate: [exp.endDate],
              description: [exp.description, Validators.required],
              isCurrentJob: [exp.isCurrentJob]
            }));
          });

          // Add language entries
          profile.languages.forEach(lang => {
            this.languagesArray.push(this.fb.group({
              language: [lang.language, Validators.required],
              proficiency: [lang.proficiency, Validators.required]
            }));
          });
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadUploadedFiles(): void {
    this.candidateService.getUploadedResumes().subscribe({
      next: (files) => {
        this.uploadedFiles = files;
      },
      error: (error) => {
        console.error('Error loading uploaded files:', error);
      }
    });
  }

  // Form Array Getters
  get educationArray() {
    return this.profileForm.get('education') as FormArray;
  }

  get experienceArray() {
    return this.profileForm.get('experience') as FormArray;
  }

  get languagesArray() {
    return this.profileForm.get('languages') as FormArray;
  }

  // Add/Remove Education
  addEducation() {
    const education = this.fb.group({
      degree: ['', Validators.required],
      major: ['', Validators.required],
      school: ['', Validators.required],
      graduationYear: ['', Validators.required],
      gpa: ['']
    });
    this.educationArray.push(education);
  }

  removeEducation(index: number) {
    this.educationArray.removeAt(index);
  }

  // Add/Remove Experience
  addExperience() {
    const experience = this.fb.group({
      company: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['', Validators.required],
      isCurrentJob: [false]
    });
    this.experienceArray.push(experience);
  }

  removeExperience(index: number) {
    this.experienceArray.removeAt(index);
  }

  // Add/Remove Language
  addLanguage() {
    const language = this.fb.group({
      language: ['', Validators.required],
      proficiency: ['', Validators.required]
    });
    this.languagesArray.push(language);
  }

  removeLanguage(index: number) {
    this.languagesArray.removeAt(index);
  }

  // File Upload Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileUpload(input.files[0]);
    }
  }

  handleFileUpload(file: File) {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Chỉ chấp nhận file PDF, DOC hoặc DOCX');
      return;
    }

    // Upload file
    this.candidateService.uploadResume(file).subscribe({
      next: (response) => {
        this.loadUploadedFiles(); // Reload file list
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        alert('Có lỗi xảy ra khi tải lên file');
      }
    });
  }

  deleteResume(file: { type: string; name: string; url: string; uploadDate: Date }) {
    if (confirm('Bạn có chắc chắn muốn xóa file này?')) {
      // TODO: Implement delete functionality
      // For now, just remove from the list
      this.uploadedFiles = this.uploadedFiles.filter(f => f.url !== file.url);
    }
  }

  onSubmit() {
    if (this.profileForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.profileForm.value;
      // Convert skills string to array
      formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
      // Gửi lên backend
      this.candidateService.saveProfile(formData).subscribe({
        next: (response) => {
          alert('Lưu hồ sơ thành công!');
          this.isSubmitting = false;
        },
        error: (error) => {
          alert('Có lỗi xảy ra khi lưu hồ sơ');
          this.isSubmitting = false;
        }
      });
    }
  }
} 