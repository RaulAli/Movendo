import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';
import { JwtService } from '../../core/services/jwt.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'settings-component',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  user: User = {} as User;
  settingsForm: FormGroup;
  errors: any = {};
  isSubmitting = false;

  @Output() backToProfile = new EventEmitter<void>();

  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private router: Router,
    private userService: UserService,
    private jwtService: JwtService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.settingsForm = this.fb.group({
      image: [''],
      username: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.minLength(6), Validators.maxLength(20)]]
    });
  }

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser && currentUser.username) {
      this.user = { ...currentUser };
      this.settingsForm.patchValue({
        image: this.user.image || '',
        username: this.user.username || '',
        email: this.user.email || '',
        password: ''
      });
    }
    this.cd.markForCheck();
  }

  get username() { return this.settingsForm.get('username'); }
  get email() { return this.settingsForm.get('email'); }
  get password() { return this.settingsForm.get('password'); }

  hasErrors(): boolean {
    return this.errors && Object.keys(this.errors).length > 0;
  }

  getErrorKeys(): string[] {
    return this.errors ? Object.keys(this.errors) : [];
  }

  getErrorMessage(key: string): string {
    return this.errors ? this.errors[key] : '';
  }

  goBack(): void {
    this.backToProfile.emit();
  }

  logout() {
    this.userService.purgeAuth();
    this.router.navigateByUrl('/');
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = {};

    if (this.settingsForm.invalid) {
      this.isSubmitting = false;
      this.settingsForm.markAllAsTouched();
      this.cd.markForCheck();
      return;
    }

    const formData = { ...this.settingsForm.value };
    if (!formData.password) {
      delete formData.password;
    }

    console.log('Enviando datos de actualización:', formData);

    this.userService.update(formData).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        console.log('Usuario actualizado:', updatedUser);

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Perfil actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });

        this.backToProfile.emit();
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error actualizando usuario:', err);
        this.isSubmitting = false;

        if (err.error && err.error.errors) {
          this.errors = err.error.errors;
        } else {
          this.errors = { general: err.error?.message || err.message || 'Error desconocido' };
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el perfil',
        });

        this.cd.markForCheck();
      }
    });
  }

}