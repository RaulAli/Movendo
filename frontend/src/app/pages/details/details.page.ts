// pages/details/details.page.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, ParamMap, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Evento } from '../../core/models/evento.model';
import { EventoService } from '../../core/services/evento.service';
import { CarouselComponent } from '../../shared/carousel/carousel.component';
import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';
import { Product } from '../../core/models/merch-prods.model';
import { MerchantsService } from '../../core/services/merchant_products.service';
import { MerchantsComponent, SelectedProduct } from '../../shared/list-merchant-product/list-merchant-product.component';
import { CommentsComponent } from '../../shared/comments/comments.component';
import { Comment } from '../../core/models/comment.model';
import { CommentsService } from '../../core/services/comment.service';
import { CarritoService } from '../../core/services/carrito.service';
import Swal from 'sweetalert2';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselComponent, CommentsComponent, MerchantsComponent, ReactiveFormsModule],
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss']
})
export class DetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(EventoService);

  author!: User;
  slug!: string | null;
  currentUser!: User;
  comments = signal<Comment[]>([]);
  merchant = signal<Product[]>([]);
  canModify!: boolean;
  commentFormErrors!: {};
  commentControl = new FormControl();
  logged!: boolean;
  NoComments!: boolean;
  NoMerchants!: boolean;
  isDeleting!: boolean;
  user_image!: string | null;
  isSubmitting!: boolean;

  evento$: Observable<Evento>;
  existingComment: Comment | null = null;
  hasCommented: boolean = false;
  evento = signal<Evento | undefined>(undefined);
  selectedMerchantProducts: SelectedProduct[] = [];

  constructor(
    private MerchantService: MerchantsService,
    private CommentService: CommentsService,
    private UserService: UserService,
    private router: Router,
    private carritoService: CarritoService
  ) {
    this.evento$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const slug = params.get('slug') ?? '';
        return this.UserService.isAuthenticated.pipe(
          switchMap(() => this.svc.get(slug))
        );
      })
    );
  }

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.route.data.subscribe(
      (data: any) => {
        this.author = data.evento.author;
        this.get_comments(this.slug);
        this.get_merchant(this.slug);
        this.get_user_author();
        if (this.currentUser.username === this.author.username) {
          this.canModify = true;
        } else {
          this.canModify = false;
        }
      }
    );

    this.UserService.isAuthenticated.subscribe(
      (data) => {
        this.logged = data;
      }
    );
    this.UserService.populate();
    this.get_user_author();

    this.evento$.subscribe(evento => {
      this.evento.set(evento);
    });

    this.UserService.actionTriggered.subscribe(action => {
      if (action.slug === this.slug) {
        if (action.type === 'favorite') {
          this.svc.favorite(action.slug!).subscribe({
            next: (updatedEvento) => {
              this.evento.set(updatedEvento);
            },
            error: (err) => {
              console.error('Error favoring event after login:', err);
            }
          });
        } else if (action.type === 'unfavorite') {
          console.log('Unfavorite action skipped after login redirection.');
        } else if (action.type === 'comment') {
          var currentEVET: Evento | undefined = this.evento();
          this.create_comment(currentEVET ? new Event('submit') : new Event('submit'), action.body);
        }
      }
    });
  }

  get_user_author() {
    this.UserService.currentUser.subscribe(
      (userData: User) => {
        this.currentUser = userData;
        this.canModify = true;
        if (this.comments()) {
          this.checkIfUserHasCommented();
        }
      }
    );
  }

  get_comments(product_slug: any) {
    if (product_slug) {
      this.CommentService.getAll(product_slug).subscribe((comments) => {
        this.comments.set(comments);
        this.checkIfUserHasCommented();
        if (this.comments().length === 0) {
          this.NoComments = true;
        } else {
          this.NoComments = false;
        }
      });
    }
  }

  get_merchant(product_slug: any) {
    if (product_slug) {
      this.MerchantService.getAllByEventSlug(product_slug).subscribe((merchants) => {
        this.merchant.set(merchants);
        if (this.merchant().length === 0) {
          this.NoMerchants = true;
        } else {
          this.NoMerchants = false;
        }
      });
    }
  }

  checkIfUserHasCommented() {
    if (!this.currentUser || !this.comments() || this.comments().length === 0) {
      this.hasCommented = false;
      this.existingComment = null;
      return;
    }
    this.existingComment = this.comments().find(comment =>
      comment.author && comment.author.username === this.currentUser.username
    ) || null;
    this.hasCommented = !!this.existingComment;
  }

  create_comment(event: Event, data?: string) {
    event.preventDefault();
    this.isSubmitting = true;
    this.commentFormErrors = {};
    var commentBody = '';

    if (data !== undefined) {
      commentBody = data;
    } else {
      commentBody = this.commentControl.value?.trim();
    }

    if (!this.UserService.getCurrentUser().token) {
      this.UserService.redirectToLoginWithAction(this.router.url, {
        type: commentBody ? 'comment' : 'comment',
        slug: this.evento()!.slug,
        body: commentBody
      });
      return;
    }

    if (this.hasCommented) {
      this.isSubmitting = false;
      return;
    }

    if (!commentBody) {
      this.isSubmitting = false;
      return;
    }

    if (this.slug) {
      this.CommentService.add(this.slug, { body: commentBody }).subscribe({
        next: (data: Comment) => {
          this.comments.update(currentComments => [data, ...currentComments]);
          this.commentControl.reset('');
          this.isSubmitting = false;
          this.checkIfUserHasCommented();
        },
        error: (err) => {
          if (err.status === 409) {
            this.hasCommented = true;
            this.get_comments(this.slug);
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  onDeleteComment(commentId: number): void {
    this.comments.update(currentComments => currentComments.filter(comment => comment.id !== commentId));
    this.checkIfUserHasCommented();
  }

  onUpdateComment(updatedData: { id: number; body: string }): void {
    this.comments.update(currentComments => currentComments.map(comment => {
      if (comment.id === updatedData.id) {
        return { ...comment, body: updatedData.body };
      }
      return comment;
    }));
  }

  empty_comment() {
    this.commentControl.reset('');
    this.isSubmitting = false;
  }

  toggleFavorite() {
    if (!this.evento()) {
      return;
    }

    if (!this.UserService.getCurrentUser().token) {
      this.UserService.redirectToLoginWithAction(this.router.url, {
        type: this.evento()!.favorited ? 'unfavorite' : 'favorite',
        slug: this.evento()!.slug
      });
      return;
    }

    const eventoValue = this.evento();
    if (!eventoValue || !eventoValue.slug) {
      return;
    }

    const currentSlug: string = eventoValue.slug;
    if (!eventoValue.favorited) {
      this.svc.favorite(currentSlug).subscribe({
        next: (updatedEvento) => {
          this.evento.set(updatedEvento);
        }
      });
    } else {
      this.svc.unfavorite(currentSlug).subscribe({
        next: (updatedEvento) => {
          this.evento.set(updatedEvento);
        }
      });
    }
  }

  onProductSelectionChanged(selectedProducts: SelectedProduct[]): void {
    this.selectedMerchantProducts = selectedProducts;
  }

  addToCart() {
    const eventoValue = this.evento();
    if (!eventoValue || !eventoValue._id) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot add to cart. Event data is missing. Please try again later.',
      });
      return;
    }

    const merchants = this.selectedMerchantProducts
      .filter(p => p.product.authorId)
      .map(p => ({
        id_merchant: p.product.authorId!,
        cantidad: p.quantity
      }));

    const item = {
      id_evento: eventoValue._id,
      cantidad: 1, // Default quantity for the event
      merchants: merchants
    };

    this.carritoService.addItemToCart(item).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart!',
          text: `"${eventoValue.nombre}" and selected products have been added to your cart.`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was a problem adding the item to your cart. Please try again.',
        });
      }
    });
  }
}
