/**
 * asyncReportsStore.tsx — Motor mock del reporte asíncrono "Ventas Async".
 *
 * Simula un backend que arma el reporte en segundo plano (8-20s en este
 * prototipo, representando los 1-5 min reales) y notifica al terminar.
 * Persistido en localStorage para sobrevivir refrescos de página.
 * Permite múltiples reportes "en proceso" en paralelo.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useNotifications } from './notificationsStore';
import { generateVentasAsyncXlsx } from '../utils/generateVentasAsyncXlsx';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AsyncReportStatus = 'processing' | 'ready' | 'error' | 'expired';

export interface AsyncReportFilters {
  estado:     string;
  usuario:    string;
  includeTip: boolean;
}

export interface AsyncReportJob {
  id:              string;
  requestedAt:     number;
  rangeFrom:       string;
  rangeTo:         string;
  filters:         AsyncReportFilters;
  status:          AsyncReportStatus;
  expectedReadyAt: number;      // cuándo debería resolver el mock (processing → ready/error)
  readyAt?:        number;
  expiresAt?:      number;      // readyAt + 60 días
}

interface AsyncReportsContextValue {
  jobs:            AsyncReportJob[];
  requestReport:   (rangeFrom: string, rangeTo: string, filters: AsyncReportFilters) => void;
  retryReport:     (jobId: string) => void;
  downloadReport:  (jobId: string) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const LS_KEY = 'bold-pos:async-reports';
const EXPIRATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 días
const MIN_DELAY_MS = 8_000;
const MAX_DELAY_MS = 20_000;
const ERROR_RATE = 0.15;
const EXPIRATION_CHECK_INTERVAL_MS = 60_000;

// ─── Seed (historial de ejemplo en la primera visita) ────────────────────────

function buildSeedJobs(): AsyncReportJob[] {
  const now = Date.now();
  return [
    {
      id: 'seed-ready',
      requestedAt: now - 2 * 60 * 60 * 1000,
      rangeFrom: '2026-06-01',
      rangeTo: '2026-06-30',
      filters: { estado: 'Todos', usuario: 'Todos', includeTip: false },
      status: 'ready',
      expectedReadyAt: now - 2 * 60 * 60 * 1000,
      readyAt: now - 2 * 60 * 60 * 1000 + 12_000,
      expiresAt: now - 2 * 60 * 60 * 1000 + 12_000 + EXPIRATION_MS,
    },
    {
      id: 'seed-error',
      requestedAt: now - 24 * 60 * 60 * 1000,
      rangeFrom: '2026-05-01',
      rangeTo: '2026-05-31',
      filters: { estado: 'Todos', usuario: 'Camila', includeTip: false },
      status: 'error',
      expectedReadyAt: now - 24 * 60 * 60 * 1000,
    },
    {
      id: 'seed-expired',
      requestedAt: now - 65 * 24 * 60 * 60 * 1000,
      rangeFrom: '2026-04-01',
      rangeTo: '2026-04-30',
      filters: { estado: 'Todos', usuario: 'Todos', includeTip: false },
      status: 'expired',
      expectedReadyAt: now - 65 * 24 * 60 * 60 * 1000,
      readyAt: now - 65 * 24 * 60 * 60 * 1000 + 12_000,
      expiresAt: now - 5 * 24 * 60 * 60 * 1000,
    },
  ];
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadJobs(): AsyncReportJob[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as AsyncReportJob[];
  } catch { /* ignore */ }
  const seed = buildSeedJobs();
  saveJobs(seed);
  return seed;
}

function saveJobs(jobs: AsyncReportJob[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(jobs));
  } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AsyncReportsContext = createContext<AsyncReportsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AsyncReportsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<AsyncReportJob[]>(() => loadJobs());
  const jobsRef = useRef(jobs);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const navigate = useNavigate();
  const { push } = useNotifications();

  // jobsRef siempre refleja el último estado — evita closures obsoletas dentro
  // de callbacks de setTimeout/notificaciones que se crearon en un render previo.
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

  const updateJobs = useCallback((updater: (prev: AsyncReportJob[]) => AsyncReportJob[]) => {
    setJobs(prev => {
      const next = updater(prev);
      saveJobs(next);
      return next;
    });
  }, []);

  const downloadReportById = useCallback((jobId: string) => {
    const job = jobsRef.current.find(j => j.id === jobId);
    if (job && job.status === 'ready') generateVentasAsyncXlsx(job);
  }, []);

  const resolveJob = useCallback((jobId: string, rangeFrom: string, rangeTo: string) => {
    timers.current.delete(jobId);
    const willError = Math.random() < ERROR_RATE;
    const now = Date.now();

    updateJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      if (willError) return { ...j, status: 'error' as const };
      return { ...j, status: 'ready' as const, readyAt: now, expiresAt: now + EXPIRATION_MS };
    }));

    const rango = `${rangeFrom} – ${rangeTo}`;

    push(willError
      ? {
          title: 'No se pudo generar el reporte',
          message: `Reporte de Ventas Async (${rango}) falló al generarse.`,
          kind: 'error',
          onRowClick: () => navigate('/reportes/restaurantes/rest-ventas-async'),
        }
      : {
          title: 'Reporte de Ventas Async listo',
          message: `Rango ${rango} · ya puedes descargarlo.`,
          kind: 'success',
          onRowClick: () => navigate('/reportes/restaurantes/rest-ventas-async'),
          action: { label: 'Descargar', onClick: () => downloadReportById(jobId) },
        },
    );
  }, [push, navigate, updateJobs, downloadReportById]);

  const scheduleResolution = useCallback((jobId: string, delayMs: number, rangeFrom: string, rangeTo: string) => {
    if (timers.current.has(jobId)) return;
    const timeout = setTimeout(() => resolveJob(jobId, rangeFrom, rangeTo), Math.max(delayMs, 0));
    timers.current.set(jobId, timeout);
  }, [resolveJob]);

  // Al montar: retoma los jobs que quedaron "processing" (ej. tras un refresh).
  useEffect(() => {
    const activeTimers = timers.current;
    jobsRef.current.forEach(job => {
      if (job.status === 'processing') {
        scheduleResolution(job.id, job.expectedReadyAt - Date.now(), job.rangeFrom, job.rangeTo);
      }
    });
    return () => {
      activeTimers.forEach(t => clearTimeout(t));
      activeTimers.clear();
    };
    // Solo al montar — los nuevos jobs se programan explícitamente en requestReport/retryReport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revisa periódicamente si algún reporte "listo" ya venció.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      updateJobs(prev => prev.map(j =>
        j.status === 'ready' && j.expiresAt !== undefined && now > j.expiresAt
          ? { ...j, status: 'expired' as const }
          : j,
      ));
    }, EXPIRATION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updateJobs]);

  const requestReport = useCallback((rangeFrom: string, rangeTo: string, filters: AsyncReportFilters) => {
    const now = Date.now();
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const newJob: AsyncReportJob = {
      id: crypto.randomUUID(),
      requestedAt: now,
      rangeFrom,
      rangeTo,
      filters,
      status: 'processing',
      expectedReadyAt: now + delay,
    };
    updateJobs(prev => [newJob, ...prev]);
    scheduleResolution(newJob.id, delay, rangeFrom, rangeTo);
  }, [updateJobs, scheduleResolution]);

  const retryReport = useCallback((jobId: string) => {
    const now = Date.now();
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const job = jobsRef.current.find(j => j.id === jobId);
    updateJobs(prev => prev.map(j => j.id === jobId
      ? { ...j, status: 'processing' as const, requestedAt: now, expectedReadyAt: now + delay, readyAt: undefined, expiresAt: undefined }
      : j,
    ));
    if (job) scheduleResolution(jobId, delay, job.rangeFrom, job.rangeTo);
  }, [updateJobs, scheduleResolution]);

  return (
    <AsyncReportsContext.Provider value={{ jobs, requestReport, retryReport, downloadReport: downloadReportById }}>
      {children}
    </AsyncReportsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAsyncReports(): AsyncReportsContextValue {
  const ctx = useContext(AsyncReportsContext);
  if (!ctx) throw new Error('useAsyncReports must be used inside <AsyncReportsProvider>');
  return ctx;
}
