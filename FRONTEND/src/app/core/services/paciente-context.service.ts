import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PacienteContextService {

    private readonly PACIENTE_CONTEXT_KEY = 'paciente_context_id';

    private pacienteIdSubject = new BehaviorSubject<number | null>(this.getStoredPacienteId());

    public pacienteId$: Observable<number | null> = this.pacienteIdSubject.asObservable();

    constructor() { }

    setPacienteContext(id: number): void {
        this.pacienteIdSubject.next(id);
        this.storePacienteId(id);
    }

    clearPacienteContext(): void {
        this.pacienteIdSubject.next(null);
        this.clearStoredPacienteId();
    }

    getPacienteIdActual(): number | null {
        return this.pacienteIdSubject.value;
    }

    private getStoredPacienteId(): number | null {
        const storedId = localStorage.getItem(this.PACIENTE_CONTEXT_KEY);
        return storedId ? parseInt(storedId, 10) : null;
    }

    private storePacienteId(id: number): void {
        localStorage.setItem(this.PACIENTE_CONTEXT_KEY, id.toString());
    }

    private clearStoredPacienteId(): void {
        localStorage.removeItem(this.PACIENTE_CONTEXT_KEY);
    }
}