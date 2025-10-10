// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { TemplatesService } from '../services-old/templates.service';
// import { Plantilla } from '../mock/mock-templates';

// @Component({
//   standalone: true, selector:'app-plantillas', imports:[CommonModule, FormsModule],
//   template: `
//   <div style="display:grid;grid-template-columns:320px 1fr;gap:16px">
//     <div class="card" style="height:calc(100vh - 150px);overflow:auto">
//       <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
//         <input [(ngModel)]="q" placeholder="Buscar..." style="flex:1">
//         <button class="btn" (click)="nueva()">Nueva</button>
//       </div>
//       <div *ngFor="let t of filtradas()" (click)="seleccionar(t)" [style.background]="t.id===sel?.id ? '#eef0ff' : 'transparent'"
//            style="padding:10px;border:1px solid #eee;border-radius:10px;margin:6px 0;cursor:pointer">
//         <div style="font-weight:600">{{t.titulo}}</div>
//         <small>{{t.categoria || '—'}} • {{t.visibilidad}}</small>
//       </div>
//     </div>
//     <div style="display:grid;grid-template-rows:auto 1fr auto;gap:12px">
//       <div class="card" style="display:grid;grid-template-columns:1fr 180px 160px;gap:10px">
//         <input [(ngModel)]="model.titulo" placeholder="Título de la plantilla">
//         <input [(ngModel)]="model.categoria" placeholder="Categoría">
//         <select [(ngModel)]="model.visibilidad"><option value="privada">Privada</option><option value="clinica">Clínica</option><option value="global">Global</option></select>
//       </div>
//       <div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
//         <div>
//           <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
//             <ng-container *ngFor="let v of variables">
//               <button class="btn-outline" type="button" (click)="insertar(v.key)">{{v.label}}</button>
//             </ng-container>
//           </div>
//           <textarea [(ngModel)]="model.cuerpo" style="width:100%;height:380px"></textarea>
//         </div>
//         <div>
//           <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
//             <h3 class="h3" style="margin:0">Vista previa</h3>
//             <small>Valores de ejemplo</small>
//           </div>
//           <div class="card" style="height:380px;overflow:auto;white-space:pre-wrap">{{ preview(model.cuerpo) }}</div>
//         </div>
//       </div>
//       <div style="display:flex;gap:10px">
//         <button class="btn" (click)="guardar()">Guardar</button>
//         <button class="btn-outline" (click)="duplicar()" [disabled]="!sel">Duplicar</button>
//         <button class="btn-outline" (click)="eliminar()" [disabled]="!sel">Eliminar</button>
//         <button class="btn-outline" (click)="exportar()">Exportar JSON</button>
//         <input type="file" (change)="importar($event)" title="Importar JSON"/>
//       </div>
//     </div>
//   </div>`
// })
// export class PlantillasComponent {
//   q=''; lista: Plantilla[]=[]; sel?: Plantilla;
//   model:any={titulo:'',categoria:'',visibilidad:'privada',cuerpo:''};
//   variables=[
//     {key:'{{Paciente.Nombre}}',label:'Paciente.Nombre'},
//     {key:'{{Paciente.DNI}}',label:'Paciente.DNI'},
//     {key:'{{Paciente.Edad}}',label:'Paciente.Edad'},
//     {key:'{{Medico.Nombre}}',label:'Medico.Nombre'},
//     {key:'{{Medico.Matricula}}',label:'Medico.Matricula'},
//     {key:'{{Centro.Nombre}}',label:'Centro.Nombre'},
//     {key:'{{Fecha}}',label:'Fecha'},
//     {key:'{{Recomendaciones}}',label:'Recomendaciones'},
//     {key:'{{AyunoHoras}}',label:'AyunoHoras'}
//   ];
//   ejemplo:any={'Paciente.Nombre':'Juan Pérez','Paciente.DNI':'12.345.678','Paciente.Edad':'32','Medico.Nombre':'Dra. Gómez','Medico.Matricula':'MP 12345','Centro.Nombre':'Centro Salud UPE','Fecha':'08/09/2025','Recomendaciones':'Hidratación y descanso 48h','AyunoHoras':'8'};
//   constructor(private tpl:TemplatesService){ this.reload(); }
//   reload(){ this.tpl.list().subscribe(d=>{ this.lista=d; if(!this.sel && d.length) this.seleccionar(d[0]); }); }
//   filtradas(){ return this.lista.filter(x=>(x.titulo+' '+(x.categoria||'')+' '+(x.tags||[]).join(' ')).toLowerCase().includes(this.q.toLowerCase())); }
//   seleccionar(t:Plantilla){ this.sel=t; this.model={id:t.id,titulo:t.titulo,categoria:t.categoria,visibilidad:t.visibilidad,cuerpo:t.cuerpo}; }
//   nueva(){ this.sel=undefined; this.model={titulo:'Nueva plantilla',categoria:'',visibilidad:'privada',cuerpo:''}; }
//   insertar(token:string){ const ta:any=document.querySelector('textarea'); if(ta&&ta.selectionStart!==undefined){const s=ta.selectionStart,e=ta.selectionEnd,txt=this.model.cuerpo||''; this.model.cuerpo=txt.slice(0,s)+token+txt.slice(e); setTimeout(()=>{ta.focus();ta.selectionStart=ta.selectionEnd=s+token.length;},0);} else { this.model.cuerpo=(this.model.cuerpo||'')+token; } }
//   preview(text:string){ if(!text) return ''; let out=text; Object.entries(this.ejemplo).forEach(([k,v])=>{ const t='{{'+k+'}}'; out=out.split(t).join(String(v)); }); return out; }
//   guardar(){ this.tpl.upsert(this.model).subscribe(s=>{ this.reload(); this.seleccionar(s); }); }
//   duplicar(){ if(!this.sel) return; this.tpl.upsert({ ...this.model, id: undefined, titulo: this.model.titulo+' (copia)' }).subscribe(s=>{ this.reload(); this.seleccionar(s); }); }
//   eliminar(){ if(!this.sel) return; if(confirm('¿Eliminar plantilla?')){ this.tpl.remove(this.sel.id).subscribe(()=>{ this.sel=undefined; this.reload(); this.nueva(); }); } }
//   exportar(){ const blob=new Blob([JSON.stringify(this.lista,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='plantillas.json'; a.click(); }
//   importar(ev:any){ const f=ev.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const arr=JSON.parse(String(r.result)); localStorage.setItem('plantillas:user-demo', JSON.stringify(arr)); this.reload(); }catch{} }; r.readAsText(f); }
// }
