import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- añadir
import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings-page',
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
  // ... resto de tu clase (igual que antes)
  user: User = {} as User;
  settingsForm: FormGroup;
  errors: Object = {};
  isSubmitting = false;

  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private router: Router,
    private userService: UserService,
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
    Object.assign(this.user, this.userService.getCurrentUser());
    this.settingsForm.patchValue(this.user);
    this.cd.markForCheck();
  }

  get username() { return this.settingsForm.get('username'); }
  get email() { return this.settingsForm.get('email'); }
  get password() { return this.settingsForm.get('password'); }

  logout() {
    this.userService.purgeAuth();
    this.router.navigateByUrl('/');
  }

  submitForm() {
    this.isSubmitting = true;

    if (this.settingsForm.invalid) {
      this.isSubmitting = false;
      this.settingsForm.markAllAsTouched();
      this.cd.markForCheck();
      return;
    }

    this.updateUser(this.settingsForm.value);

    this.userService.update(this.user).subscribe(
      updatedUser => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/profile');
      },
      err => {
        this.errors = err;
        this.isSubmitting = false;
        this.cd.markForCheck();
      }
    );
  }

  updateUser(values: Object) {
    Object.assign(this.user, values);
  }
}
