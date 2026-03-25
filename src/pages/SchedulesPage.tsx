import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Trash2, Zap, Power, PowerOff, Edit3, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useScheduledAutomations, type NewRelaySchedule, type ScheduleDays, type RelaySchedule } from '@/hooks/useScheduledAutomations';
import type { RelayKey } from '@/types/sensor.types';

const RELAY_LABELS: Record<RelayKey, string> = {
  relay1: 'Relay 1',
  relay2: 'Relay 2',
  relay3: 'Relay 3',
  relay4: 'Relay 4',
};

const ALL_DAYS: { key: keyof ScheduleDays; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const DEFAULT_DAYS: ScheduleDays = {
  mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false,
};

interface ScheduleFormState {
  relayKey: RelayKey;
  action: 'on' | 'off';
  hour: number;
  minute: number;
  days: ScheduleDays;
  label: string;
  enabled: boolean;
}

const defaultForm = (): ScheduleFormState => ({
  relayKey: 'relay1',
  action: 'on',
  hour: 8,
  minute: 0,
  days: { ...DEFAULT_DAYS },
  label: '',
  enabled: true,
});

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatScheduleTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${pad(h)}:${pad(minute)} ${ampm}`;
}

function dayLabel(days: ScheduleDays): string {
  const active = ALL_DAYS.filter((d) => days[d.key]).map((d) => d.key.charAt(0).toUpperCase() + d.key.slice(1));
  if (active.length === 7) return 'Every day';
  if (active.length === 0) return 'No days';
  if (JSON.stringify(active) === JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])) return 'Weekdays';
  if (JSON.stringify(active) === JSON.stringify(['Sat', 'Sun'])) return 'Weekends';
  return active.join(', ');
}

// ──────────────── Sub-component: Schedule Form ────────────────
interface ScheduleFormProps {
  initial?: ScheduleFormState;
  onSave: (form: NewRelaySchedule) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ initial, onSave, onCancel, isEditing }) => {
  const [form, setForm] = useState<ScheduleFormState>(initial ?? defaultForm());

  const set_ = <K extends keyof ScheduleFormState>(key: K, val: ScheduleFormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (key: keyof ScheduleDays) =>
    setForm((f) => ({ ...f, days: { ...f.days, [key]: !f.days[key] } }));

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) { set_('hour', h); set_('minute', m); }
  };

  const handleSubmit = () => {
    const payload: NewRelaySchedule = {
      relayKey: form.relayKey,
      action: form.action,
      hour: form.hour,
      minute: form.minute,
      days: form.days,
      label: form.label.trim() || `${RELAY_LABELS[form.relayKey]} ${form.action} at ${formatScheduleTime(form.hour, form.minute)}`,
      enabled: form.enabled,
    };
    onSave(payload);
  };

  return (
    <Card className="card-premium border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {isEditing ? 'Edit Schedule' : 'New Schedule'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Label (optional)</Label>
          <Input
            placeholder="e.g. Morning Fan"
            value={form.label}
            onChange={(e) => set_('label', e.target.value)}
            className="bg-background/50 border-border/50"
          />
        </div>

        {/* Relay + Action */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Device</Label>
            <select
              value={form.relayKey}
              onChange={(e) => set_('relayKey', e.target.value as RelayKey)}
              className="w-full h-9 rounded-md border border-border/50 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {(Object.keys(RELAY_LABELS) as RelayKey[]).map((k) => (
                <option key={k} value={k}>{RELAY_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</Label>
            <div className="flex gap-2 mt-1">
              {(['on', 'off'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => set_('action', a)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    form.action === a
                      ? a === 'on'
                        ? 'bg-green-500/15 border-green-500/40 text-green-500'
                        : 'bg-red-500/15 border-red-500/40 text-red-500'
                      : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {a === 'on' ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                  {a.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</Label>
          <Input
            type="time"
            value={`${pad(form.hour)}:${pad(form.minute)}`}
            onChange={handleTimeChange}
            className="max-w-[160px] bg-background/50 border-border/50 font-mono text-base"
          />
        </div>

        {/* Days */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Repeat on</Label>
          <div className="flex gap-2 flex-wrap">
            {ALL_DAYS.map((d) => (
              <button
                key={d.key}
                onClick={() => toggleDay(d.key)}
                className={`w-9 h-9 rounded-full text-xs font-bold border transition-all ${
                  form.days[d.key]
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enabled */}
        <div className="flex items-center gap-3">
          <Switch checked={form.enabled} onCheckedChange={(v) => set_('enabled', v)} />
          <Label className="text-sm font-medium">Active immediately</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} size="sm" className="flex-1 gap-1.5">
            <Check className="w-3.5 h-3.5" /> {isEditing ? 'Update' : 'Create'}
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm" className="flex-1 gap-1.5">
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ──────────────── Main Page ────────────────
const SchedulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { schedules, isLoading, addSchedule, updateSchedule, deleteSchedule, toggleScheduleEnabled } =
    useScheduledAutomations(user?.uid ?? null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingSchedule = schedules.find((s) => s.id === editingId);

  const handleAdd = async (form: NewRelaySchedule) => {
    await addSchedule(form);
    setShowForm(false);
  };

  const handleUpdate = async (form: NewRelaySchedule) => {
    if (!editingId) return;
    await updateSchedule(editingId, form);
    setEditingId(null);
  };

  const getInitialForm = (s: RelaySchedule): ScheduleFormState => ({
    relayKey: s.relayKey,
    action: s.action,
    hour: s.hour,
    minute: s.minute,
    days: { ...s.days },
    label: s.label,
    enabled: s.enabled,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Scheduled Automations
                </h1>
                <p className="text-xs text-muted-foreground">
                  {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
          </div>
          {!showForm && !editingId && (
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> New Schedule
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* New schedule form */}
        {showForm && (
          <ScheduleForm
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Info banner */}
        {!showForm && schedules.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
              <Clock className="w-12 h-12 text-primary/60" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">No schedules yet</h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                Create a schedule to automatically turn relays on or off at specific times every day.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2 mt-2">
              <Plus className="w-4 h-4" /> Create your first schedule
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        )}

        {/* Schedule list */}
        <div className="space-y-3">
          {schedules.map((sched) => {
            const isEditing = editingId === sched.id;
            if (isEditing && editingSchedule) {
              return (
                <ScheduleForm
                  key={sched.id}
                  initial={getInitialForm(editingSchedule)}
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                  isEditing
                />
              );
            }

            return (
              <Card
                key={sched.id}
                className={`card-premium transition-all duration-300 ${
                  !sched.enabled ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Time block */}
                    <div className={`flex-shrink-0 text-center px-4 py-2.5 rounded-xl border font-mono ${
                      sched.enabled
                        ? sched.action === 'on'
                          ? 'bg-green-500/10 border-green-500/30 text-green-500'
                          : 'bg-red-500/10 border-red-500/30 text-red-500'
                        : 'bg-muted/30 border-border/30 text-muted-foreground'
                    }`}>
                      <p className="text-lg font-bold leading-none">
                        {formatScheduleTime(sched.hour, sched.minute)}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 opacity-80">
                        {sched.action === 'on' ? 'Turn ON' : 'Turn OFF'}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{sched.label}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          {RELAY_LABELS[sched.relayKey]}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground">{dayLabel(sched.days)}</span>
                      </div>

                      {/* Day pills */}
                      <div className="flex gap-1 mt-2">
                        {ALL_DAYS.map((d) => (
                          <span
                            key={d.key}
                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              sched.days[d.key]
                                ? 'bg-primary/15 text-primary'
                                : 'bg-muted/30 text-muted-foreground/40'
                            }`}
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={sched.enabled}
                        onCheckedChange={(v) => toggleScheduleEnabled(sched.id, v)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={() => { setEditingId(sched.id); setShowForm(false); }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteSchedule(sched.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How it works */}
        {schedules.length > 0 && (
          <Card className="card-premium border-primary/10 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> How schedules work
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1.5">
              <p>• The browser checks schedules every 15 seconds while the dashboard is open.</p>
              <p>• Each schedule fires once per minute — duplicate triggers are prevented.</p>
              <p>• Schedules are saved in Firebase and persist across sessions.</p>
              <p>• Disabled schedules are shown dimmed and will not trigger.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SchedulesPage;
