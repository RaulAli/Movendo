import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MerchDashboardService } from '../../core/services/merch_dashboard.service';
import { Product } from '../../core/models/merch-prods.model';
import { merch_Category } from '../../core/models/merch-categories.model';

@Component({
    selector: 'list-dashboard_merchant',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
    templateUrl: './list-dashboard_merchant.component.html',
    styleUrls: ['./list-dashboard_merchant.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListDashboardComponentMerch implements OnInit {
    constructor(
        private merchDashboardService: MerchDashboardService,
        private fb: FormBuilder
    ) { }

    // Menú
    menuItems = ['Main', 'Products', 'Categories'];
    selectedMenuItem = 'Main';

    // Datos
    cards: any[] = [];
    products: Product[] = [];
    categories: merch_Category[] = [];

    // Edición/Creación de productos
    editingProduct: Product | null = null;
    creatingProduct: boolean = false;
    newProduct: Partial<Product> = {
        brand: '',
        name: '',
        slug: '',
        description: '',
        price: 0,
        stock: 0,
        image: '',
        categoryId: undefined,
        isActive: true,
        status: 'draft'
    };

    // Categorías
    editingCategories: merch_Category | null = null;
    creatingCategories: boolean = false;
    newCategories: Partial<merch_Category> = {};

    // Contenido local (ejemplo)
    contenidoDB: any = {};

    ngOnInit(): void {
        this.loadContentFromDB();

        // Cargar datos iniciales
        this.loadCategoriesFromBackend();
        this.loadProductsFromBackend();
    }

    private loadContentFromDB() {
        this.contenidoDB = {
            Main: [
                { title: 'Resumen General', content: 'Métricas importantes del sistema' },
                { title: 'Products Recientes', content: 'Últimos product creados' },
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
        // reset UI state
        this.editingProduct = null;
        this.creatingProduct = false;
        this.editingCategories = null;
        this.creatingCategories = false;

        // cargar datos según el menú seleccionado
        this.Cargar_MenuItem();
    }

    Cargar_MenuItem() {
        switch (this.selectedMenuItem) {
            case 'Main':
                this.cards = this.contenidoDB['Main'] ?? [];
                break;

            case 'Products':
                // cuando el usuario selecciona 'Products' nos aseguramos de tener los productos
                this.loadProductsFromBackend();
                break;

            case 'Categories':
                this.loadCategoriesFromBackend();
                break;

            case 'Merchan':
                // Lógica adicional si hace falta
                break;
        }
    }

    // ---------------------------
    // Carga de datos desde backend
    // ---------------------------

    private loadCategoriesFromBackend() {
        // Uso de merchDashboardService.list_cat() que ya tenías.
        this.categories = [];
        this.merchDashboardService.list_cat().subscribe({
            next: (data) => {
                this.categories = data ?? [];
                console.log('Categorías cargadas: ', this.categories);
            },
            error: (err) => {
                console.error('Error cargando categorías', err);
                this.categories = [];
            }
        });
    }

    private loadProductsFromBackend() {
        this.products = [];

        this.merchDashboardService.list().subscribe({
            next: (data: Product[]) => {
                this.products = data ?? [];
                console.log('Productos cargados:', this.products);
            },
            error: (err) => {
                console.error('Error cargando productos', err);
                this.products = [];
            }
        });
    }

    // ---------------------------
    // Helpers
    // ---------------------------

    // getCategoryName(categoryId?: string | null): string | undefined {
    //     if (!categoryId) return undefined;
    //     // const c = this.categories.find(x => x.id === categoryId || x._id === categoryId || x.slug === categoryId);
    //     // return c ? (c.nombre || c.name || '') : undefined;
    // }

    // ---------------------------
    // Categorías: editar / crear
    // ---------------------------

    onCreateCategories() {
        this.creatingCategories = true;
    }

    onCancelNewCategories() {
        this.creatingCategories = false;
        this.newCategories = {};
    }

    onSaveNewCategories() {
        if (!this.newCategories || !this.newCategories.nombre) return;
        // const slug = (this.newCategory.nombre || '').trim().toLowerCase().replace(/\s+/g, '-');
        // const payload = { ...this.newCategory, slug } as Category;

        // this.merchDashboardService.create_cat(payload).subscribe({
        //     next: (created: Category) => {
        //         this.categories.push(created);
        //         this.creatingCategory = false;
        //         this.newCategory = {};
        //     },
        //     error: (err) => {
        //         console.error('Error creating categoria', err);
        //     }
        // });
    }

    onDeleteCategories(category: merch_Category) {
        if (!category || !category.slug) return;
        // if (!confirm(`¿Seguro que deseas eliminar la categoría "${category.nombre}"?`)) return;

        // this.merchDashboardService.delete_cat(category.slug).subscribe({
        //     next: () => {
        //         this.categories = this.categories.filter(c => c.slug !== category.slug);
        //     },
        //     error: (err) => console.error('Error eliminando categoría:', err)
        // });
    }

    onEditCategories(category: merch_Category) {
        this.editingCategories = { ...category };
    }

    onSaveCategories(category: merch_Category) {
        if (!category || !category.slug) return;

        // const updatedData = {
        //     nombre: category.nombre,
        //     descripcion: category.descripcion,
        //     image: category.image,
        //     isActive: category.isActive
        // };

        // this.merchDashboardService.update_cat(category.slug, updatedData).subscribe({
        //     next: (data) => {
        //         const index = this.categories.findIndex(e => e.slug === category.slug);
        //         if (index !== -1) {
        //             this.categories[index] = Array.isArray(data) ? (data[0] ?? data) : (data as any);
        //         }
        //         this.editingCategory = null;
        //     },
        //     error: (err) => console.error('Error actualizando categoría', err)
        // });
    }

    onCancelCategories() {
        this.editingCategories = null;
    }

    // ---------------------------
    // Productos: crear / editar / borrar
    // ---------------------------

    onCreateProduct() {
        // reset newProduct con valores por defecto
        this.newProduct = {
            brand: '',
            name: '',
            slug: '',
            description: '',
            price: 0,
            stock: 0,
            image: '',
            categoryId: undefined,
            isActive: true,
            status: 'draft'
        };
        this.creatingProduct = true;
    }

    onCancelNewProduct() {
        this.creatingProduct = false;
        this.newProduct = {};
    }

    onSaveNewProduct() {
        // Validaciones mínimas
        if (!this.newProduct || !this.newProduct.name || !this.newProduct.brand) {
            alert('Marca y nombre son obligatorios.');
            return;
        }

        // Generar slug
        const slug = (this.newProduct.slug && String(this.newProduct.slug).trim()) || String(this.newProduct.name).trim().toLowerCase().replace(/\s+/g, '-');
        const payload: Partial<Product> = {
            ...this.newProduct,
            slug
        };

        this.merchDashboardService.create(payload as Product).subscribe({
            next: (created: Product) => {
                this.products.unshift(created);
                this.creatingProduct = false;
                this.newProduct = {};
            },
            error: (err) => {
                console.error('Error creating product', err);
                alert('Error creando producto. Revisa la consola.');
            }
        });
    }

    onEdit(product: Product) {
        this.editingProduct = { ...product };
    }

    onSave(product: Product) {
        if (!product) return;
        // Uso slug si existe; si prefieres id, cambia a product.id
        const identifier = (product.id);
        if (!identifier) {
            console.warn('Producto sin identificador (slug/id). No se puede actualizar.');
            return;
        }

        // Preparamos payload (actualizar solo campos permitidos)
        const payload: Partial<Product> = {
            brand: product.brand,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image,
            categoryId: product.categoryId,
            isActive: product.isActive,
            status: product.status
        };

        // Intentamos usar merchDashboardService.update(slug, payload)
        if (typeof this.merchDashboardService.update === 'function') {
            this.merchDashboardService.update(String(identifier), payload).subscribe({
                next: (updated: Product) => {
                    // sustituir en el array local (buscar por slug o id)
                    const idx = this.products.findIndex(p => p.id === product.id);
                    if (idx !== -1) {
                        this.products[idx] = Array.isArray(updated) ? (updated[0] ?? updated) : updated;
                    }
                    this.editingProduct = null;
                },
                error: (err) => {
                    console.error('Error actualizando producto', err);
                    alert('Error actualizando producto. Revisa la consola.');
                }
            });
        } else {
            console.warn('El servicio no expone update(). Ajusta onSave() para usar el método correcto.');
        }
    }

    onCancel() {
        this.editingProduct = null;
    }

    onDelete(product: Product) {
        // if (!product) return;
        // const identifier = product.slug || product.id;
        // if (!identifier) return;

        // if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) return;

        // if (typeof this.merchDashboardService.delete === 'function') {
        this.merchDashboardService.delete(String(product.id)).subscribe({
            next: () => {
                this.products = this.products.filter(p => p.slug !== product.slug && p.id !== product.id);
            },
            error: (err) => {
                console.error('Error eliminando producto', err);
                alert('Error eliminando producto. Revisa la consola.');
            }
        });
        // } else {
        //     console.warn('El servicio no expone delete(). Ajusta onDelete() según tu API.');
        // }
    }

    // ---------------------------
    // Otros métodos utilitarios
    // ---------------------------

    onVerMas(card: any) {
        console.log('Ver más de:', card);
    }
}
