import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Comment } from '../../core/models/comment.model';
import { User } from '../../core/models/auth.model';
import { UserService } from '../../core/services/auth.service';
import { CommentsService } from '../../core/services/comment.service';
import { Router, RouterLink } from '@angular/router'; // Añadir Router
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    imports: [RouterLink, FormsModule],
    styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit, OnDestroy {

    @Input() comment!: Comment;
    @Input() slug?: string;
    @Output() deleteComment = new EventEmitter<number>();
    @Output() updateComment = new EventEmitter<{ id: number, body: string }>();

    canModify!: boolean;
    subscription!: Subscription;
    deleteSub?: Subscription;
    editSub?: Subscription;

    isEditing = false;
    editedBody = '';
    isSpecificRoute = false; // Nueva variable para detectar la ruta

    constructor(
        private userService: UserService,
        private commentService: CommentsService,
        private router: Router, // Inyectar Router
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.isSpecificRoute = this.router.url === '/profile';

        this.subscription = this.userService.currentUser.subscribe(
            (userData: User) => {
                if (this.isSpecificRoute !== true) {
                    this.canModify = !!(userData && userData.username === this.comment.author.username);
                }
                console.log(this.canModify);
                this.cd.markForCheck();
            }

        );
    }

    // El resto de métodos permanecen igual...
    ngOnDestroy() {
        this.subscription?.unsubscribe();
        this.deleteSub?.unsubscribe();
        this.editSub?.unsubscribe();
    }

    startEditing(): void {
        this.isEditing = true;
        this.editedBody = this.comment.body;
    }

    cancelEditing(): void {
        this.isEditing = false;
        this.editedBody = '';
    }

    saveEditedComment(): void {
        if (!this.editedBody.trim()) {
            alert('El comentario no puede estar vacío');
            return;
        }

        if (!this.slug) {
            console.warn('No hay slug disponible para editar el comentario');
            return;
        }

        this.editSub = this.commentService.edit(this.comment.id, this.slug, this.editedBody).subscribe({
            next: (Updatebody) => {
                console.log('Comentario editado correctamente:', Updatebody);
                this.comment.body = Updatebody.body;
                this.isEditing = false;
                this.editedBody = '';

                this.updateComment.emit({
                    id: this.comment.id,
                    body: Updatebody.body
                });
            },
            error: (err) => {
                console.error('Error editando comentario:', err);
                alert('No se pudo editar el comentario. Inténtalo de nuevo.');
            }
        });
    }

    deleteClicked(): void {
        if (!this.comment || !this.slug) {
            console.warn('Falta comment o slug para eliminar.');
            return;
        }

        const ok = confirm('¿Estás seguro de que quieres borrar este comentario?');
        if (!ok) return;

        this.deleteSub = this.commentService.destroy(this.comment.id, this.slug).subscribe({
            next: (resp) => {
                console.log('Comentario eliminado correctamente:', resp);
                this.deleteComment.emit(this.comment.id);
            },
            error: (err) => {
                console.error('Error eliminando comentario:', err);
                alert('No se pudo borrar el comentario. Inténtalo de nuevo.');
            }
        });
    }
}