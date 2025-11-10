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
    editingUser: string | null = null; // username en edición
    userForm!: FormGroup;

    editingCategoryId: string | null = null; // _id en edición
    categoryForm!: FormGroup;

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
                this.categoriesService.list_adm().subscribe({
                    next: (data) => {
                        this.categories = data ?? [];
                        console.log('Categorías cargadas:', this.categories);
                    },
                    error: (err) => console.error('Error cargando categorías', err)
                });
                break;

            case 'Clients':
                this.users = [];
                this.userService.list_adm().subscribe({
                    next: (data) => (this.users = data ?? [], console.log(this.users)),
                    error: (err) => console.error('Error cargando usuarios', err)
                });
                break;

            case 'Categories':
                this.categories = [];
                this.categoriesService.list_adm().subscribe({
                    next: (data) => (this.categories = data ?? [], console.log(this.categories)),
                    error: (err) => console.error('Error cargando categorías', err)
                });
                break;

            case 'Merchan':
                break;
        }
    }

    // ---------------------------
    // Usuarios: editar inline
    // ---------------------------

    onEditUser(user: User) {
        this.editingUser = user.username;
        // crear form con valores actuales
        this.userForm = this.fb.group({
            username: [user.username, [Validators.required, Validators.minLength(3)]],
            email: [user.email, [Validators.required, Validators.email]],
            status: [user.status, [Validators.required]],
            isActive: [user.isActive]
        });
    }

    cancelEditUser() {
        this.editingUser = null;
    }

    saveUser(user: User) {
        if (!this.userForm) return;
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }
        const username = user.username;
        this.loadingUsers.add(username);

        const payload = this.userForm.value as Partial<User>;

        // Llamada al servidor (descomenta y adapta según tu servicio)
        /*
        this.userService.update_adm(username, payload).subscribe({
          next: (updatedUser) => {
            // sincroniza UI con lo devuelto
            this.users = this.users.map(u => u.username === username ? { ...u, ...updatedUser } : u);
            this.editingUser = null;
            this.loadingUsers.delete(username);
          },
          error: (err) => {
            console.error('Error guardando usuario:', err);
            this.loadingUsers.delete(username);
          }
        });
        */

        // Versión sin servidor (para pruebas locales): actualiza UI localmente
        this.users = this.users.map(u => u.username === username ? ({ ...u, ...payload }) : u);
        this.editingUser = null;
        this.loadingUsers.delete(username);
    }

    // ---------------------------
    // Categorías: editar inline
    // ---------------------------

    onEditCategory(category: Category) {
        this.editingCategoryId = category._id ?? null;
        this.categoryForm = this.fb.group({
            nombre: [category.nombre, [Validators.required, Validators.minLength(2)]],
            descripcion: [category.descripcion ?? ''],
            status: [category.status ?? 'PUBLISHED', [Validators.required]],
            isActive: [category.isActive ?? true]
        });
    }

    cancelEditCategory() {
        this.editingCategoryId = null;
    }

    saveCategory(category: Category) {
        if (!this.categoryForm) return;
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }
        const id = category._id;
        if (!id) return;

        this.loadingCategories.add(id);

        const payload = this.categoryForm.value as Partial<Category>;

        // Llamada al servidor (descomenta y adapta según tu servicio)
        /*
        this.categoriesService.update_adm(id, payload).subscribe({
          next: (updatedCategory) => {
            this.categories = this.categories.map(c => c._id === id ? { ...c, ...updatedCategory } : c);
            this.editingCategoryId = null;
            this.loadingCategories.delete(id);
          },
          error: (err) => {
            console.error('Error guardando categoría:', err);
            this.loadingCategories.delete(id);
          }
        });
        */

        // Versión sin servidor: actualiza UI localmente
        this.categories = this.categories.map(c => c._id === id ? ({ ...c, ...payload }) : c);
        this.editingCategoryId = null;
        this.loadingCategories.delete(id);
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
            const { nombre, ciudad, category, price, isActive } = evento;
            const updatedData = { nombre, ciudad, category, price, isActive };

            this.adminDashboardService.update(evento.slug, updatedData).subscribe({
                next: (data) => {
                    const index = this.eventos.findIndex(e => e.slug === evento.slug);
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
              error: (err) => console.error('Error eliminando usuario:', err)
            });
            */
            // versión local:
            this.users = this.users.filter(u => u.username !== user.username);
        }
    }
}