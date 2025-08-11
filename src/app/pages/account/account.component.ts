import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup,  FormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';


@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
passwordVisible: boolean = true;

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
