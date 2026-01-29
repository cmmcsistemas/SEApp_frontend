import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import {MatIconModule} from '@angular/material/icon';

// Interfaz para la respuesta del login
interface LoginResponse {
  status: string;
  message: string;
  token?: string;
  user?: any;
}
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, LucideAngularModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})


export class LoginComponent {
loginForm: FormGroup;
  passwordVisible: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Iconos de Lucide para consistencia con el resto del proyecto
  iconEye = Eye;
  iconEyeOff = EyeOff;

  private apiUrl = 'http://20.81.172.55:3900/api/user/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], // Puede ser correo o cédula según tu placeholder
      password: ['', [Validators.required]]
    });
  }

  /**
   * Cambia la visibilidad del campo de contraseña
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Envía las credenciales a la API
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.http.post<LoginResponse>(this.apiUrl, payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          // Guardar token si es necesario (ejemplo)
          if (response.token) {
            localStorage.setItem('token', response.token);
          }

          // Redirigir al dashboard o listado tras éxito
          console.log('Login exitoso:', response.message);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        this.errorMessage = error.error?.message || 'Usuario o contraseña incorrectos.';
      }
    });
  }
  }


