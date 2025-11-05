import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TextFieldModule } from '@angular/cdk/text-field';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { LayoutModule } from '@angular/cdk/layout';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MomentDateModule } from '@angular/material-moment-adapter';


export const CORE_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule
];

export const FORMS_IMPORTS = [
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatCheckboxModule,
  MatAutocompleteModule,
  TextFieldModule
];

export const TABLE_IMPORTS = [
  MatTableModule,
  MatPaginatorModule,
  MatListModule
];

export const INTERACTION_IMPORTS = [
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatDialogModule,
  MatSnackBarModule
];

export const LAYOUT_IMPORTS = [
  MatToolbarModule,
  MatSidenavModule,
  MatCardModule,
  MatGridListModule,
  LayoutModule
];

export const FEEDBACK_IMPORTS = [
  MatProgressSpinnerModule,
  MatProgressBarModule
];

export const DATE_IMPORTS = [
  MatDatepickerModule,
  MatNativeDateModule,
  MomentDateModule
];

export const SHARED_IMPORTS = [
  ...CORE_IMPORTS,
  ...FORMS_IMPORTS,
  ...TABLE_IMPORTS,
  ...INTERACTION_IMPORTS,
  ...LAYOUT_IMPORTS,
  ...FEEDBACK_IMPORTS,
  ...DATE_IMPORTS
];
