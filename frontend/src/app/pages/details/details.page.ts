// pages/details/details.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, ParamMap } from '@angular/router';
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

  author!: User; //GET CURRENT USER
  slug!: string | null; //SLUG del EVENTo
  currentUser!: User; //GET CURRENT USER
  comments!: Comment[];
  canModify!: boolean;
  commentFormErrors!: {};
  commentControl = new FormControl();
  logged!: boolean;
  NoComments!: boolean;
  isDeleting!: boolean;
  user_image!: string | null; //SLUG del EVENTo
  isSubmitting!: boolean;
  
  evento$: Observable<Evento>;

  constructor(
    private CommentService: CommentsService,
    private UserService: UserService,
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
  }

  get_user_author() {
    this.UserService.currentUser.subscribe(
      (userData: User) => {
        this.currentUser = userData;
        this.canModify = true;
      }
    );
  }

  get_comments(product_slug: any) {
    if (product_slug) {
      this.CommentService.getAll(product_slug).subscribe((comments) => {
        this.comments = comments;
        if (this.comments.length === 0) {
          this.NoComments = true;
        } else {
          this.NoComments = false;
        }
      });
    }
  }

  delete_comment(comment: Comment) {
    if (!comment || !this.slug) return;

    this.CommentService.destroy(this.slug, comment.id).subscribe(() => {
      this.comments = this.comments.filter(c => c.id !== comment.id);
    });
  }

  create_comment() {
    this.isSubmitting = true;
    this.commentFormErrors = {};
    if (this.slug) {
      const commentBody = this.commentControl.value;
      this.CommentService.add(this.slug, { body: commentBody }).subscribe({
        next: (data: Comment) => {
          this.comments.unshift(data);
          this.commentControl.reset('');
          this.isSubmitting = false;
        },
        error: (err) => {
          this.isSubmitting = false;
        }
      });
    }
  }

  empty_comment() {
    this.commentControl.reset('');
    this.isSubmitting = false;
  }

  toggleFavorite(evento: Evento) {
    if (this.logged) {
      if (evento.favorited) {
        this.svc.unfavorite(evento.slug!).subscribe(
          () => {
            this.reload$.next();
          }
        );
      } else {
        this.svc.favorite(evento.slug!).subscribe(
          () => {
            this.reload$.next();
          }
        );
      }
    }
  }
}
