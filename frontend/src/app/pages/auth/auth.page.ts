// src/app/pages/auth/auth.page.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/auth.service';
import { JwtService } from '../../core/services/jwt.service';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ]
})
export class AuthPage implements OnInit {
  authType: string = '';
  title: string = '';
  errors: string[] = [];
  isSubmitting = false;
  authForm: FormGroup;
  selectedUserType: string = 'cliente';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private jwtService: JwtService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    });
  }

  ngOnInit() {
    this.route.url.subscribe((data) => {
      this.authType = data[data.length - 1].path;
      this.title = this.authType === 'login' ? 'Iniciar sesión' : 'Registrarse';
      if (this.authType === 'register') {
        this.authForm.addControl('username', this.fb.control('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]));
      } else {
        if (this.authForm.get('username')) {
          this.authForm.removeControl('username');
        }
      }
      this.cd.markForCheck();
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.errors = [];
    const credentials = this.authForm.value;

    this.userService.attemptAuth(this.authType, credentials).subscribe({
      next: (response) => {

        const token = response.token;

        if (this.authType === 'login' && token) {
          this.jwtService.saveToken(token);
          try {
            const decodedToken: any = jwtDecode(token);
          } catch (error) {
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.authType === 'login' ? 'Inicio de sesión exitoso' : 'Registro exitoso'
        }).then(() => {
          if (this.authType === 'login') {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigateByUrl('/auth/login');
          }
        });

        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('❌ Auth error:', err);
        console.error('❌ Error status:', err.status);
        console.error('❌ Error message:', err.message);

        this.errors = err.error?.errors ? Object.values(err.error.errors) :
          [err.error?.message || err.message || 'Error desconocido'];
        this.isSubmitting = false;
        this.cd.markForCheck();
      }
    });
  }
}