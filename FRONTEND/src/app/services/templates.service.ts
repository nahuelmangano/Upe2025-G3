import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { Plantilla, MOCK_PLANTILLAS } from '../mock/mock-templates';

const KEY = (userId: string) => `plantillas:${userId}`;

@Injectable({providedIn:'root'})
export class TemplatesService {
  userId = 'user-demo';
  private loadLocal(): Plantilla[] {
    const raw = localStorage.getItem(KEY(this.userId));
    if (raw) { try { return JSON.parse(raw); } catch { return []; } }
    localStorage.setItem(KEY(this.userId), JSON.stringify(MOCK_PLANTILLAS));
    return JSON.parse(localStorage.getItem(KEY(this.userId)) || '[]');
  }
  private saveLocal(data: Plantilla[]) { localStorage.setItem(KEY(this.userId), JSON.stringify(data)); }
  list(): Observable<Plantilla[]> { if (environment.useMock) return of(this.loadLocal()); return of(this.loadLocal()); }
  get(id: string){ return of(this.loadLocal().find(x=>x.id===id)); }
  upsert(input:any){ const all=this.loadLocal(); let item= input.id? all.find(x=>x.id===input.id): undefined;
    if(!item){ item={ id: input.id || `tpl-${Math.random().toString(36).slice(2,8)}`, titulo: input.titulo||'Sin título', categoria: input.categoria||'', cuerpo: input.cuerpo||'', visibilidad: input.visibilidad||'privada', tags: input.tags||[], ownerUserId: this.userId, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }; all.unshift(item); }
    else{ item.titulo=input.titulo??item.titulo; item.categoria=input.categoria??item.categoria; item.cuerpo=input.cuerpo??item.cuerpo; item.visibilidad=input.visibilidad??item.visibilidad; item.tags=input.tags??item.tags; item.updatedAt=new Date().toISOString(); }
    this.saveLocal(all); return of(item);
  }
  remove(id:string){ this.saveLocal(this.loadLocal().filter(x=>x.id!==id)); return of(true); }
}
