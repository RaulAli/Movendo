import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Comment } from '../models/comment.model';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  constructor(
    private apiService: ApiService
  ) { }

  add(slug: any, payload: any): Observable<Comment> {
    return this.apiService
      .post(`/${slug}/comment`, { comment: payload }
      ).pipe(map((data) => { return data })
      );
  }

  getAll(slug: any): Observable<Comment[]> {
    return this.apiService.get(`/evento/${slug}/comment`)
      .pipe(map(data => data.comments));
  }

  destroy(commentId: any, productSlug: any) {
    return this.apiService.delete(
      `/${productSlug}/comment/${commentId}`
    );
  }

}