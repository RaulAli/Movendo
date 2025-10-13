import '@angular/compiler'; // ← AÑADE ESTA LÍNEA AL PRINCIPIO
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// src/main.ts

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
