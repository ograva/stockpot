import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MaterialModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
