// pages/details/details.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, ParamMap, Router } from '@angular/router';
import { Subject, switchMap, startWith, Observable } from 'rxjs';
import { Evento } from '../../core/models/evento.model';
import { EventoService } from '../../core/services/evento.service';
import { CarouselComponent } from '../../shared/carousel/carousel.component';

import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';

import { CommentsComponent } from '../../shared/comments/comments.component';
import { Comment } from '../../core/models/comment.model';
import { CommentsService } from '../../core/services/comment.service';

import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselComponent, CommentsComponent, ReactiveFormsModule],
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss']
})
export class DetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(EventoService);
  private reload$ = new Subject<void>();

  author!: User;
  slug!: string | null;
  currentUser!: User;
  comments!: Comment[];
  canModify!: boolean;
  commentFormErrors!: {};
  commentControl = new FormControl();
  logged!: boolean;
  NoComments!: boolean;
  isDeleting!: boolean;
  user_image!: string | null;
  isSubmitting!: boolean;

  evento$: Observable<Evento>;
  existingComment: Comment | null = null;
  hasCommented: boolean = false;
  evento!: Evento;

  constructor(
    private CommentService: CommentsService,
    private UserService: UserService,
    private router: Router,
  ) {
    this.evento$ = this.reload$.pipe(
      startWith(undefined),
      switchMap(() => this.route.paramMap),
      switchMap((params: ParamMap) => this.svc.get(params.get('slug') ?? ''))
    );
  }

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.route.data.subscribe(
      (data: any) => {
        this.author = data.evento.author;
        this.get_comments(this.slug);
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
    this.get_user_author();

    this.evento$.subscribe(evento => {
      this.evento = evento; // Assign the emitted Evento to the component property
    });

    // Subscribe to pending actions from UserService
    this.UserService.actionTriggered.subscribe(action => {
      if (action.type === 'favorite') { // Only re-trigger if the action was to favorite
        if (action.slug === this.slug && this.evento && !this.evento.favorited) {
          // Directly call the favorite method if not already favorited
          this.svc.favorite(action.slug).subscribe(
            () => {
              this.reload$.next(); // Refresh the event data
            }
          );
        }
      }
    });
  }

  get_user_author() {
    this.UserService.currentUser.subscribe(
      (userData: User) => {
        this.currentUser = userData;
        this.canModify = true;
        if (this.comments) {
          this.checkIfUserHasCommented();
        }
      }
    );
  }

  get_comments(product_slug: any) {
    if (product_slug) {
      this.CommentService.getAll(product_slug).subscribe((comments) => {
        this.comments = comments;

        this.checkIfUserHasCommented();

        if (this.comments.length === 0) {
          console.log("No comments");
          this.NoComments = true;
        } else {
          this.NoComments = false;
        }
      });
    }
  }

  checkIfUserHasCommented() {
    if (!this.currentUser || !this.comments || this.comments.length === 0) {
      this.hasCommented = false;
      this.existingComment = null;
      return;
    }

    this.existingComment = this.comments.find(comment =>
      comment.author && comment.author.username === this.currentUser.username
    ) || null;

    this.hasCommented = !!this.existingComment;
  }

  create_comment(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;
    this.commentFormErrors = {};

    if (this.hasCommented) {
      console.warn('El usuario ya tiene un comentario en este evento');
      this.isSubmitting = false;
      return;
    }

    const commentBody = this.commentControl.value?.trim();

    if (!commentBody) {
      this.isSubmitting = false;
      return;
    }

    if (this.slug) {
      this.CommentService.add(this.slug, { body: commentBody }).subscribe({
        next: (data: Comment) => {
          this.comments.unshift(data);
          this.commentControl.reset('');
          this.isSubmitting = false;
          this.NoComments = false;
          this.hasCommented = true;
          this.existingComment = data;
          console.log('Comentario creado exitosamente');
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          if (err.status === 409) {
            this.hasCommented = true;
            this.get_comments(this.slug);
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  empty_comment() {
    this.commentControl.reset('');
    this.isSubmitting = false;
  }

  toggleFavorite() { // Remove evento parameter
    if (!this.evento) { // Ensure evento is loaded
      console.error('Evento not loaded yet.');
      return;
    }

    if (!this.UserService.getCurrentUser().token) {
      this.UserService.redirectToLoginWithAction(this.router.url, {
        type: this.evento.favorited ? 'unfavorite' : 'favorite',
        slug: this.evento.slug
      });
      return;
    }

    if (!this.evento.slug) {
      console.error('Evento slug is undefined, cannot favorite/unfavorite.');
      return;
    }

    if (this.evento.favorited) {
      this.svc.unfavorite(this.evento.slug).subscribe(
        () => {
          this.reload$.next();
        }
      );
    } else {
      this.svc.favorite(this.evento.slug).subscribe(
        () => {
          this.reload$.next();
        }
      );
    }
  }
}
