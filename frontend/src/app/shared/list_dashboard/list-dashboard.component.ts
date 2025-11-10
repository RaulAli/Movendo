import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Evento } from '../../core/models/evento.model';
import { AdminDashboardService } from '../../core/services/admin_dashboard.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';

@Component({
    selector: 'list-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
    templateUrl: './list-dashboard.component.html',
    styleUrls: ['./list-dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListDashboardComponent implements OnInit {
    constructor(
        private adminDashboardService: AdminDashboardService,
        private userService: UserService,
        private categoriesService: CategoryService,
        private fb: FormBuilder
    ) { }

    menuItems = ['Main', 'Events', 'Categories', 'Clients', 'Merchan'];
    selectedMenuItem = 'Main';

    // Datos dinámicos
    cards: any[] = [];
    eventos: Evento[] = [];
    filteredEventos: Evento[] = [];
    users: User[] = [];
    categories: Category[] = [];

    contenidoDB: any = {};
    editingEvento: Evento | null = null;
    creatingEvento: boolean = false;
    newEvento: Partial<Evento> = {};

    // Edición
    userForm!: FormGroup;
    editingUser: User | null = null;

    categoryForm!: FormGroup;
    editingCategory: Category | null = null;

    // loading guard para evitar clicks múltiples
    loadingUsers: Set<string> = new Set();
    loadingCategories: Set<string> = new Set();

    // Filtros
    filterForm!: FormGroup;
    cities: string[] = [];
    statuses: string[] = ['PUBLISHED', 'DRAFT'];
    showCityFilters = false;
    showCategoryFilters = false;

    ngOnInit(): void {
        this.loadContentFromDB();
        this.filterForm = this.fb.group({
            nombre: [''],
            ciudad: this.fb.array([]),
            categoria: this.fb.array([]),
            isActive: [null]
        });

        this.filterForm.valueChanges.subscribe(() => {
            this.filterEvents();
        });
    }

    filterEvents() {
        const { nombre, ciudad, categoria, isActive } = this.filterForm.value;
        this.filteredEventos = this.eventos.filter(evento => {
            const ciudadMatch = ciudad.length > 0 ? ciudad.includes(evento.ciudad) : true;
            const categoriaMatch = categoria.length > 0 ? categoria.includes(evento.category) : true;
            const isActiveMatch = typeof isActive === 'boolean' ? evento.isActive === isActive : true;

            return (
                (nombre ? evento.nombre.toLowerCase().includes(nombre.toLowerCase()) : true) &&
                ciudadMatch &&
                categoriaMatch &&
                isActiveMatch
            );
        });
    }

    onCheckboxChange(event: any, formArrayName: string) {
        const formArray: FormArray = this.filterForm.get(formArrayName) as FormArray;

        if (event.target.checked) {
            formArray.push(new FormControl(event.target.value));
        } else {
            let i: number = 0;
            formArray.controls.forEach((ctrl: any) => {
                if (ctrl.value == event.target.value) {
                    formArray.removeAt(i);
                    return;
                }
                i++;
            });
        }
    }

    // ---------------------------
    // Helpers para categories
    // ---------------------------
    private bytesToBase64(bytes: Uint8Array): string {
        // chunking para no crear strings gigantes de golpe
        const chunkSize = 0x8000; // 32768
        let result = '';
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            let chunk = '';
            for (let j = 0; j < slice.length; j++) {
                chunk += String.fromCharCode(slice[j]);
            }
            result += chunk;
        }
        return btoa(result);
    }

    private normalizeImage(img: any): string | null {
        if (img == null) return null;

        // Si ya es string (URL o data URL), devolver tal cual
        if (typeof img === 'string') {
            return img;
        }

        // Si es un array (ej. string[] de URLs) -> tomar primera
        if (Array.isArray(img)) {
            return img.length ? String(img[0]) : null;
        }

        // Si es objeto
        if (typeof img === 'object') {
            // Si viene { url: '...' }
            if (typeof img.url === 'string') return img.url;

            // Si viene { data: [...] } (bytes serializados)
            if (Array.isArray((img as any).data) || (img.data && typeof img.data === 'object' && (img.data as any).length !== undefined)) {
                try {
                    const arr = Array.isArray((img as any).data) ? (img as any).data : Array.from((img as any).data);
                    const u8 = new Uint8Array(arr);
                    const base64 = this.bytesToBase64(u8);

                    // intentar coger mime/type si viene
                    const mime = (img.mime || img.type || (img as any).mimetype) || 'application/octet-stream';
                    return `data:${mime};base64,${base64}`;
                } catch {
                    return null;
                }
            }

            // fallback: intentar stringify (útil para debugging, no ideal en prod)
            try {
                return JSON.stringify(img);
            } catch {
                return null;
            }
        }

        // cualquier otro tipo, convertir a string
        return String(img);
    }


    private normalizeCategories(raw: any): Category[] {
        const arr = raw?.items ?? raw ?? [];
        const list = Array.isArray(arr) ? arr : Object.values(arr);
        return (list as any[]).filter(Boolean).map(c => ({
            ...c,
            // forzamos image a string|null para que el template y validaciones no peten
            image: this.normalizeImage((c as any).image),
        })) as Category[];
    }

    loadContentFromDB() {
        this.contenidoDB = {
            Main: [
                { title: 'Resumen General', content: 'Métricas importantes del sistema' },
                { title: 'Eventos Recientes', content: 'Últimos eventos creados' },
                { title: 'Categorias Activas', content: 'Categorias Activas' },
                { title: 'Clientes Activos', content: 'Clientes activos' },
                { title: 'Inventario Merchan', content: 'Stock disponible' }
            ],
            Events: 'api',
            Clients: [],
            Merchan: []
        };

        this.Cargar_MenuItem();
    }

    selectMenuItem(item: string) {
        this.selectedMenuItem = item;
        this.Cargar_MenuItem();
    }

    private loadCategoriesFromBackend() {
        // centralizado para reutilizar en Events y en Categories
        this.categories = [];
        this.adminDashboardService.list_cat().subscribe({
            next: (data) => {
                const normalized = this.normalizeCategories(data);
                this.categories = normalized;
                console.log('Categorías cargadas (normalizadas):', this.categories);
            },
            error: (err) => {
                console.error('Error cargando categorías', err);
                this.categories = [];
            }
        });
    }

    Cargar_MenuItem() {
        switch (this.selectedMenuItem) {
            case 'Main':
                this.cards = this.contenidoDB['Main'] ?? [];
                break;

            case 'Events':
                this.eventos = [];
                this.adminDashboardService.list().subscribe({
                    next: (data) => {
                        this.eventos = data ?? [];
                        this.filteredEventos = this.eventos;
                        console.log(this.eventos);
                    },
                    error: (err) => console.error('Error cargando eventos', err)
                });
                this.adminDashboardService.getUniqueCities().subscribe({
                    next: (data) => (this.cities = data ?? []),
                    error: (err) => console.error('Error cargando ciudades', err)
                });
                // cargamos categorías para filtros (normalizadas)
                this.loadCategoriesFromBackend();
                break;

            case 'Clients':
                this.users = [];
                this.adminDashboardService.list_usr().subscribe({
                    next: (data) => (this.users = data ?? [], console.log(this.users)),
                    error: (err) => console.error('Error cargando usuarios', err)
                });
                break;

            case 'Categories':
                // carga las categorías (normalizadas)
                this.loadCategoriesFromBackend();
                break;

            case 'Merchan':
                break;
        }
    }

    // ---------------------------
    // Usuarios: editar inline
    // ---------------------------

    onEditUser(user: User) {
        this.editingUser = { ...user };
    }

    onSaveUser(user: User) {
        console.log("hola");
        if (user.username) {
            console.log(user.username);
            const { email, image, isActive } = user;
            const updatedData = { email, image, isActive };

            this.adminDashboardService.update_usr(user.username, updatedData).subscribe({
                next: (data) => {
                    const index = this.users.findIndex(e => e.username === user.username);
                    if (index !== -1) {
                        this.users[index] = data;
                    }
                    this.editingUser = null;
                },
                error: (err) => console.error('Error actualizando evento', err)
            });
        }
    }

    onCancelUser() {
        this.editingUser = null;
    }

    // ---------------------------
    // Categorías: editar inline
    // ---------------------------

    onEditCategory(category: Category) {
        this.editingCategory = { ...category };
    }

    onSaveCategory(category: Category) {
        if (category.slug) {
            console.log('Saving category:', category.slug);
            const { nombre, descripcion, image, isActive } = category;
            const updatedData = { nombre, descripcion, image, isActive };

            this.adminDashboardService.update_cat(category.slug, updatedData).subscribe({
                next: (data) => {
                    // corregido: buscar en this.categories (no en eventos)
                    const index = this.categories.findIndex(e => e.slug === category.slug);
                    if (index !== -1) {
                        // normalizar la respuesta del backend antes de insertar
                        const normalized = this.normalizeCategories(data);
                        // si normalized devuelve array (por la forma {items: [...]}) usamos el primer elemento
                        this.categories[index] = Array.isArray(normalized) ? (normalized[0] ?? data) : (normalized as any);
                    }
                    this.editingCategory = null;
                },
                error: (err) => console.error('Error actualizando categoría', err)
            });
        }
    }

    onCancelCategory() {
        this.editingCategory = null;
    }

    // ---------------------------
    // Métodos auxiliares / botones existentes
    // ---------------------------

    onVerMas(card: any) {
        console.log('Ver más de:', card);
    }

    onCreateEvento() {
        this.creatingEvento = true;
    }

    onCancelNewEvento() {
        this.creatingEvento = false;
    }

    onSaveNewEvento() {
        this.adminDashboardService.create(this.newEvento as Evento).subscribe({
            next: (newEvent) => {
                this.eventos.push(newEvent);
                this.creatingEvento = false;
                this.newEvento = {};
            },
            error: (err) => console.error('Error creating evento', err)
        });
    }

    onEdit(evento: Evento) {
        this.editingEvento = { ...evento };
    }

    onSave(evento: Evento) {
        console.log("hola");
        if (evento.slug) {
            console.log(evento.slug);
            const originalSlug = evento.slug;
            const { nombre, ciudad, category, price, isActive } = evento;
            const updatedData = { nombre, ciudad, category, price, isActive };

            this.adminDashboardService.update(originalSlug, updatedData).subscribe({
                next: (data) => {
                    const index = this.eventos.findIndex(e => e.slug === originalSlug);
                    if (index !== -1) {
                        this.eventos[index] = data;
                    }
                    this.editingEvento = null;
                },
                error: (err) => console.error('Error actualizando evento', err)
            });
        }
    }

    onCancel() {
        this.editingEvento = null;
    }

    onDelete(evento: Evento) {
        if (evento.slug && confirm(`¿Estás seguro de que quieres eliminar el evento "${evento.nombre}"?`)) {
            this.adminDashboardService.delete(evento.slug).subscribe({
                next: () => {
                    this.eventos = this.eventos.filter(e => e.slug !== evento.slug);
                },
                error: (err) => console.error('Error eliminando evento', err)
            });
        }
    }

    onDeleteCategory(category: Category) {
        if (!category._id) return;
        if (confirm(`¿Seguro que deseas eliminar la categoría "${category.nombre}"?`)) {
            // descomenta la llamada real
            /*
            this.categoriesService.delete_adm(category._id).subscribe({
              next: () => {
                this.categories = this.categories.filter(c => c._id !== category._id);
              },
              error: (err) => console.error('Error eliminando categoría:', err)
            });
            */
            // versión local:
            this.categories = this.categories.filter(c => c._id !== category._id);
        }
    }

    onDeleteUser(user: User) {
        if (!user.username) return;
        if (confirm(`¿Seguro que deseas eliminar al usuario "${user.username}"?`)) {
            // descomenta la llamada real
            /*
            this.userService.delete_adm(user.username).subscribe({
              next: () => {
                this.users = this.users.filter(u => u.username !== user.username);
              },
              error: (err) => console.error('Error eliminando usuario', err)
            });
            */
            // versión local:
            this.users = this.users.filter(u => u.username !== user.username);
        }
    }
}
