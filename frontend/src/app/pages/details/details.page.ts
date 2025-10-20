// pages/details/details.page.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
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
  constructor(
    // private route: ActivatedRoute,
    // private ProductService: ProductService,
    private CommentService: CommentsService,
    private UserService: UserService,
    // private ActivatedRoute: ActivatedRoute,
    // private router: Router,
    // private ToastrService: ToastrService,
  ) { }

  evento$ = this.route.paramMap.pipe(
    switchMap(params => this.svc.get(params.get('slug') ?? ''))
  );


  // =======================================================================
  //FALTA AUTOR
  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.route.data.subscribe(
      (data: any) => {
        // console.log(data);

        this.author = data.evento.author;
        console.log("AUTOR", this.author);
        this.get_comments(this.slug);
        this.get_user_author();
        console.log("CurrentUser", this.currentUser.username);
        console.log("AUTOR", this.author.username);
        if (this.currentUser.username === this.author.username) {
          this.canModify = true;
        } else {
          this.canModify = false;
        }
        // console.log("PUEDE MODIFICAR?", this.canModify);
      }
    );

    //COMPROBANDO
    this.UserService.isAuthenticated.subscribe(
      (data) => {
        this.logged = data;
        // console.log(this.logged, "logged");
      }
    );
    this.get_user_author();
  }

  //COMPROBANDO
  get_user_author() {
    this.UserService.currentUser.subscribe(
      (userData: User) => {
        this.currentUser = userData;
        // this.user_image = this.currentUser.image;
        this.canModify = true;
      }
    );
  }

  //SI QUE VA
  get_comments(product_slug: any) {
    // console.log(product_slug);
    if (product_slug) {
      this.CommentService.getAll(product_slug).subscribe((comments) => {
        this.comments = comments;
        // console.log("Commentarios Detectados", this.comments.length);
        if (this.comments.length === 0) {
          console.log("No comments");
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
      console.log('Comentario eliminado correctamente');
    });
  }

  create_comment() {
    this.isSubmitting = true;
    this.commentFormErrors = {};
    console.log(this.commentControl.value);
    // if (this.slug) {
    // const commentBody = this.commentControl.value;
    // console.log("Comentando:", commentBody);
    //   this.CommentService.add(this.slug, { body: commentBody }).subscribe({
    //     next: (data: Comment) => {
    //       this.comments.push(data);
    //       this.commentControl.reset('');
    //       this.isSubmitting = false;
    //       console.log('Comment added successfully');
    //     },
    //     error: (err) => {
    //       console.error('Error adding comment:', err);
    //       this.isSubmitting = false;
    //     }
    //   });
    // }
  }


  empty_comment() {
    this.commentControl.reset('');
    this.isSubmitting = false;
  }


}