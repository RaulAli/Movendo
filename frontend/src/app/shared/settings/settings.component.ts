import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SettingsComponent implements OnInit {
  user: User = {} as User;
  settingsForm: FormGroup;
  errors: Object = {};
  isSubmitting = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.settingsForm = this.fb.group({
      image: '',
      username: '',
      bio: '',
      email: '',
      password: ''
    });
  }

  ngOnInit() {
    Object.assign(this.user, this.userService.getCurrentUser());
    this.settingsForm.patchValue(this.user);
  }

  logout() {
    this.userService.purgeAuth();
    this.router.navigateByUrl('/');
  }

  submitForm() {
    // this.isSubmitting = true;

    // // update the model
    // this.updateUser(this.settingsForm.value);

    // this.userService.update(this.user).subscribe(
    //   updatedUser => this.router.navigateByUrl('/profile/' + updatedUser.username),
    //   err => {
    //     this.errors = err;
    //     this.isSubmitting = false;
    //     this.cd.markForCheck();
    //   }
    // );
  }

  updateUser(values: Object) {
    console.log(this.user);
    console.log(values);
    Object.assign(this.user, values);
  }

}
