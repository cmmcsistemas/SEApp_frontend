import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup,  FormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  passwordVisible: boolean = false;

  constructor() { }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    // La manipulación del DOM directo ya no es necesaria si el [type] se vincula a passwordVisible
    // const passwordInput = document.getElementById('password') as HTMLInputElement;
    // if (passwordInput) {
    //   passwordInput.type = this.passwordVisible ? 'text' : 'password';
    // }
  }

}
