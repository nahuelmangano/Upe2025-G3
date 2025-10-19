import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../reutilizable/shared/shared-module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  isDesktop = true;
  isExpanded = true;

  constructor(){
    this.updateViewportFlags();
  }

  @HostListener('window:resize')
  onResize(){
    this.updateViewportFlags();
  }

  private updateViewportFlags(){
    this.isDesktop = window.innerWidth >= 960; // md breakpoint
    this.isExpanded = this.isDesktop ? true : false;
  }

  toggleSidenav(){
    this.isExpanded = !this.isExpanded;
  }
}
