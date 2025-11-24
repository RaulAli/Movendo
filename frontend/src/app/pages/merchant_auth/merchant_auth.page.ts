// src/app/pages/auth-merchant/auth-merchant.page.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthMerchantService } from '../../core/services/merchant_auth.service';
import { AdminService } from '../../core/services/admin_auth.service';
import { JwtService } from '../../core/services/jwt.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth-merchant',
  templateUrl: './merchant_auth.page.html',
  styleUrls: ['./merchant_auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ]
})
export class AuthMerchantPage implements OnInit {
  authType: string = '';
  title: string = '';
  errors: string[] = [];
  isSubmitting = false;
  authForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authMerchantService: AuthMerchantService,
    private adminService: AdminService,
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
      const pathSegments = data.map(segment => segment.path);
      this.authType = pathSegments.includes('login') ? 'login' : 'register';
      this.title = this.authType === 'login' ? 'Iniciar sesión' : 'Registrar comerciante';
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

    if (this.authType === 'login') {
      this.login(credentials);
    } else {
      this.register(credentials);
    }
  }

  private login(credentials: any) {
    this.authMerchantService.attemptAuth('login', credentials).subscribe({
      next: (response) => this.handleSuccess(response, 'merchant'),
      error: (err) => {
        // If merchant login fails, try admin login
        this.adminService.attemptAuth('login', credentials).subscribe({
          next: (response) => this.handleSuccess(response, 'admin'),
          error: (adminErr) => this.handleError(adminErr)
        });
      }
    });
  }

  private register(credentials: any) {
    this.authMerchantService.attemptAuth('register', credentials).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Registro de comerciante exitoso'
        }).then(() => {
          this.router.navigateByUrl('/merchant/login');
        });
        this.isSubmitting = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(response: any, userType: 'merchant' | 'admin') {
    const token = response.token || response.accessToken;
    if (token) {
      this.jwtService.saveToken(token);
      const decodedToken: any = jwtDecode(token);
      // You can do something with the decoded token if needed
    }

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Inicio de sesión de ${userType === 'merchant' ? 'comerciante' : 'administrador'} exitoso`
    }).then(() => {
      const dashboardUrl = userType === 'merchant' ? '/merchant/dashboard' : '/admin/dashboard';
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || dashboardUrl;
      this.router.navigateByUrl(returnUrl);
    });

    this.isSubmitting = false;
  }

  private handleError(err: any) {
    console.error('❌ Auth error:', err);
    this.errors = err.error?.errors ? Object.values(err.error.errors).flat() :
      [err.error?.message || err.message || 'Error desconocido'];
    this.isSubmitting = false;
    this.cd.markForCheck();
  }
}
