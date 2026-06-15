"use client";

import { LogOut, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ActivityEvent, Lead, LeadStatus } from "@/types";

const statusLabels: Record<LeadStatus, string> = {
  new: "Новая",
  contact: "Связаться",
  "brief-scheduled": "Брифинг назначен",
  "brief-done": "Брифинг проведен",
  proposal: "КП отправлено",
  thinking: "Думает",
  contract: "Договор",
  refused: "Отказ",
  closed: "Закрыта",
  "in-progress": "В работе",
  waiting: "Ждет ответа",
};

const statusClasses: Record<LeadStatus, string> = {
  new: "border-[#e7e3e0]/35 text-[#e7e3e0]",
  contact: "border-[#d7c4a3]/45 text-[#d7c4a3]",
  "brief-scheduled": "border-[#9bb7ff]/45 text-[#b9c9ff]",
  "brief-done": "border-[#9bb7ff]/45 text-[#b9c9ff]",
  proposal: "border-[#e7c891]/45 text-[#e7c891]",
  thinking: "border-[#e7c891]/45 text-[#e7c891]",
  contract: "border-[#8da98d]/45 text-[#b5d0b5]",
  refused: "border-[#e7b7a3]/45 text-[#e7b7a3]",
  closed: "border-[#8da98d]/45 text-[#b5d0b5]",
  "in-progress": "border-[#9bb7ff]/45 text-[#b9c9ff]",
  waiting: "border-[#e7c891]/45 text-[#e7c891]",
};

const pipelineStatuses: LeadStatus[] = ["new", "contact", "brief-scheduled", "brief-done", "proposal", "thinking", "contract", "refused", "closed"];

const inputClass = "min-h-11 w-full border border-[#e7e3e0]/15 bg-[#080706]/70 px-3 text-sm text-[#e7e3e0] outline-none focus:border-[#e7e3e0]/55";

const eventLabels: Record<string, string> = {
  page_view: "Просмотр страницы",
  hero_cta_click: "Клик по главной кнопке",
  portfolio_open: "Открытие проекта",
  phone_click: "Клик по телефону",
  contact_form_start: "Начал заполнять форму",
  contact_form_submit: "Отправил форму",
  service_open: "Открыл услугу",
  price_select: "Выбрал тариф",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-[#e7e3e0]/10 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#85786f]">{label}</p>
      <p className="mt-1 text-sm text-[#e7e3e0]">{value || "—"}</p>
    </div>
  );
}

export function AdminCRM() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [saving, setSaving] = useState(false);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null;

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const haystack = [lead.name, lead.phone, lead.email, lead.city, lead.objectType, lead.service].join(" ").toLowerCase();
      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [leads, query, statusFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      due: leads.filter((lead) => lead.nextActionAt && lead.nextActionAt.slice(0, 10) <= today && !["contract", "closed", "refused"].includes(lead.status)).length,
      proposal: leads.filter((lead) => ["proposal", "thinking"].includes(lead.status)).length,
      contract: leads.filter((lead) => lead.status === "contract").length,
    };
  }, [leads]);

  const activityStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return {
      total: activity.length,
      today: activity.filter((event) => event.createdAt.startsWith(today)).length,
      views: activity.filter((event) => event.name === "page_view").length,
      submits: activity.filter((event) => event.name === "contact_form_submit").length,
    };
  }, [activity]);

  const loadLeads = async () => {
    const response = await fetch("/api/admin/leads", { cache: "no-store" });

    if (response.status === 401) {
      setAuthenticated(false);
      setLeads([]);
      return;
    }

    const data = await response.json();
    setLeads(data.leads ?? []);
    setActivity(data.activity ?? []);
    setSelectedId((current) => current || data.leads?.[0]?.id || "");
  };

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
      setCheckingSession(false);

      if (data.authenticated) {
        await loadLeads();
      }
    };

    void checkSession();
  }, []);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setLoginError("Неверный пароль");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    await loadLeads();
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setLeads([]);
    setActivity([]);
  };

  const updateSelectedLead = async (patch: Partial<Pick<Lead, "status" | "managerNote" | "nextAction" | "nextActionAt" | "potentialValue" | "lostReason">>) => {
    if (!selectedLead) return;
    setSaving(true);

    const response = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedLead.id, ...patch }),
    });

    if (response.ok) {
      const data = await response.json();
      setLeads((items) => items.map((item) => (item.id === selectedLead.id ? data.lead : item)));
    }

    setSaving(false);
  };

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-[#080706] text-[#cbc9c8]">Проверяем вход...</main>;
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080706] px-5 text-[#e7e3e0]">
        <form className="glass w-full max-w-md p-6 md:p-8" onSubmit={login}>
          <ShieldCheck className="h-7 w-7 text-[#a69c96]" />
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-[#85786f]">ADV Interiors CRM</p>
          <h1 className="serif mt-3 text-5xl leading-none">Вход в админку</h1>
          <label className="mt-8 grid gap-2 text-sm text-[#cbc9c8]">
            Пароль
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
          </label>
          {loginError ? <p className="mt-3 text-sm text-[#e7b7a3]">{loginError}</p> : null}
          <button className="mt-5 min-h-11 w-full border border-[#e7e3e0]/25 bg-[#e7e3e0] px-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#080706] transition hover:bg-[#cbc9c8]">
            Войти
          </button>
          <p className="mt-4 text-xs leading-5 text-[#85786f]">Локальный пароль по умолчанию: adv-admin</p>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080706] px-4 py-5 text-[#e7e3e0] md:px-7">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e3e0]/12 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#85786f]">ADV Interiors CRM</p>
          <h1 className="serif mt-2 text-5xl leading-none md:text-7xl">Заявки</h1>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm text-[#cbc9c8] transition hover:bg-[#e7e3e0]/8" onClick={loadLeads}>
            <RefreshCw className="h-4 w-4" />
            Обновить
          </button>
          <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm text-[#cbc9c8] transition hover:bg-[#e7e3e0]/8" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </header>

      <section className="grid gap-3 py-5 md:grid-cols-5">
        {([
          ["Всего", stats.total],
          ["Новые", stats.new],
          ["Нужно действие", stats.due],
          ["КП / думают", stats.proposal],
          ["Договор", stats.contract],
        ] as const).map(([label, value]) => (
          <div key={label} className="border border-[#e7e3e0]/12 bg-[#11100f] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">{label}</p>
            <p className="serif mt-2 text-4xl">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="border border-[#e7e3e0]/12 bg-[#11100f]">
          <div className="grid gap-3 border-b border-[#e7e3e0]/12 p-4 md:grid-cols-[1fr_180px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#85786f]" />
              <input className={`${inputClass} pl-10`} placeholder="Поиск по имени, телефону, email" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "all")}>
              <option value="all">Все статусы</option>
              {pipelineStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
            </select>
          </div>

          <div className="max-h-[64vh] overflow-auto dark-scrollbar">
            {filteredLeads.length === 0 ? (
              <p className="p-5 text-sm text-[#85786f]">Заявок пока нет.</p>
            ) : (
              filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  className={`grid w-full gap-2 border-b border-[#e7e3e0]/10 p-4 text-left transition hover:bg-[#e7e3e0]/5 ${selectedLead?.id === lead.id ? "bg-[#e7e3e0]/8" : ""}`}
                  onClick={() => setSelectedId(lead.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{lead.name}</p>
                      <p className="mt-1 text-sm text-[#a69c96]">{lead.phone}</p>
                    </div>
                    <span className={`shrink-0 border px-2 py-1 text-[11px] uppercase tracking-[0.12em] ${statusClasses[lead.status]}`}>{statusLabels[lead.status]}</span>
                  </div>
                  <p className="text-sm text-[#cbc9c8]">{lead.objectType}, {lead.area}, {lead.city}</p>
                  <p className="text-xs text-[#85786f]">{formatDate(lead.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <aside className="border border-[#e7e3e0]/12 bg-[#11100f] p-5">
          {selectedLead ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Карточка заявки</p>
                  <h2 className="serif mt-2 text-5xl leading-none">{selectedLead.name}</h2>
                  <p className="mt-3 text-sm text-[#a69c96]">{formatDate(selectedLead.createdAt)}</p>
                </div>
                <select className="min-h-10 border border-[#e7e3e0]/15 bg-[#080706] px-3 text-sm" value={selectedLead.status} onChange={(event) => updateSelectedLead({ status: event.target.value as LeadStatus })}>
                  {pipelineStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
                </select>
              </div>

              <div className="mt-6 grid gap-x-6 md:grid-cols-2">
                <Detail label="Телефон" value={selectedLead.phone} />
                <Detail label="Email" value={selectedLead.email} />
                <Detail label="Тип объекта" value={selectedLead.objectType} />
                <Detail label="Площадь" value={selectedLead.area} />
                <Detail label="Город" value={selectedLead.city} />
                <Detail label="Бюджет" value={selectedLead.budget} />
                <Detail label="Услуга" value={selectedLead.service} />
                <Detail label="Старт" value={selectedLead.startDate} />
                <Detail label="Источник" value={selectedLead.source} />
                <Detail label="Потенциал сделки" value={selectedLead.potentialValue} />
              </div>

              {selectedLead.utm && Object.keys(selectedLead.utm).length > 0 ? (
                <div className="mt-5 border border-[#e7e3e0]/10 bg-[#080706]/45 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#85786f]">UTM-метки</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(selectedLead.utm).map(([key, value]) => (
                      <span key={key} className="border border-[#e7e3e0]/12 px-2 py-1 text-xs text-[#cbc9c8]">{key}: {value}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Следующее действие
                  <input
                    className={inputClass}
                    value={selectedLead.nextAction || ""}
                    onChange={(event) => setLeads((items) => items.map((item) => (item.id === selectedLead.id ? { ...item, nextAction: event.target.value } : item)))}
                    onBlur={(event) => updateSelectedLead({ nextAction: event.target.value })}
                    placeholder="Позвонить, отправить КП, назначить брифинг"
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Дата действия
                  <input
                    className={inputClass}
                    type="datetime-local"
                    value={selectedLead.nextActionAt || ""}
                    onChange={(event) => setLeads((items) => items.map((item) => (item.id === selectedLead.id ? { ...item, nextActionAt: event.target.value } : item)))}
                    onBlur={(event) => updateSelectedLead({ nextActionAt: event.target.value })}
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Потенциальная сумма
                  <input
                    className={inputClass}
                    value={selectedLead.potentialValue || ""}
                    onChange={(event) => setLeads((items) => items.map((item) => (item.id === selectedLead.id ? { ...item, potentialValue: event.target.value } : item)))}
                    onBlur={(event) => updateSelectedLead({ potentialValue: event.target.value })}
                    placeholder="Например: 650 000 ₽"
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Причина отказа
                  <input
                    className={inputClass}
                    value={selectedLead.lostReason || ""}
                    onChange={(event) => setLeads((items) => items.map((item) => (item.id === selectedLead.id ? { ...item, lostReason: event.target.value } : item)))}
                    onBlur={(event) => updateSelectedLead({ lostReason: event.target.value })}
                    placeholder="Если отказались или закрыли"
                  />
                </label>
              </div>

              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#85786f]">Комментарий клиента</p>
                <p className="mt-2 min-h-20 border border-[#e7e3e0]/10 bg-[#080706]/55 p-4 text-sm leading-6 text-[#cbc9c8]">{selectedLead.comment || "—"}</p>
              </div>

              {selectedLead.activityTrail && selectedLead.activityTrail.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#85786f]">История до заявки</p>
                  <div className="mt-2 max-h-56 overflow-auto border border-[#e7e3e0]/10 bg-[#080706]/55 dark-scrollbar">
                    {selectedLead.activityTrail.slice(0, 12).map((event, index) => (
                      <div key={`${event.createdAt}-${index}`} className="grid gap-1 border-b border-[#e7e3e0]/8 p-3 text-sm">
                        <p className="font-semibold text-[#e7e3e0]">{eventLabels[event.name] ?? event.name}</p>
                        <p className="text-xs text-[#a69c96]">{event.path} · {formatDate(event.createdAt)}</p>
                        {event.payload ? <p className="font-mono text-xs text-[#85786f]">{JSON.stringify(event.payload)}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <label className="mt-5 grid gap-2 text-sm text-[#cbc9c8]">
                Заметка менеджера
                <textarea
                  className={`${inputClass} min-h-32 py-3`}
                  value={selectedLead.managerNote || ""}
                  onChange={(event) => setLeads((items) => items.map((item) => (item.id === selectedLead.id ? { ...item, managerNote: event.target.value } : item)))}
                  onBlur={(event) => updateSelectedLead({ managerNote: event.target.value })}
                />
              </label>
              {saving ? <p className="mt-3 text-xs text-[#85786f]">Сохраняю...</p> : null}
            </>
          ) : (
            <p className="text-sm text-[#85786f]">Выберите заявку слева.</p>
          )}
        </aside>
      </section>

      <section className="mt-8 border-t border-[#e7e3e0]/12 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#85786f]">Site activity</p>
            <h2 className="serif mt-2 text-5xl leading-none">Активность сайта</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#a69c96]">Здесь собираются просмотры страниц и важные действия: клики, выбор тарифа, старт и отправка формы.</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {([
            ["Событий", activityStats.total],
            ["Сегодня", activityStats.today],
            ["Просмотров", activityStats.views],
            ["Отправок формы", activityStats.submits],
          ] as const).map(([label, value]) => (
            <div key={label} className="border border-[#e7e3e0]/12 bg-[#11100f] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">{label}</p>
              <p className="serif mt-2 text-4xl">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-hidden border border-[#e7e3e0]/12 bg-[#11100f]">
          <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-3 border-b border-[#e7e3e0]/12 px-4 py-3 text-xs uppercase tracking-[0.16em] text-[#85786f] max-md:hidden">
            <span>Событие</span>
            <span>Страница / детали</span>
            <span>Время</span>
          </div>

          <div className="max-h-[420px] overflow-auto dark-scrollbar">
            {activity.length === 0 ? (
              <p className="p-5 text-sm text-[#85786f]">Активности пока нет. Открой главную страницу, покликай по сайту и обнови админку.</p>
            ) : (
              activity.slice(0, 80).map((event) => (
                <div key={event.id} className="grid gap-2 border-b border-[#e7e3e0]/10 px-4 py-3 text-sm md:grid-cols-[1fr_1.2fr_1fr]">
                  <div>
                    <p className="font-semibold text-[#e7e3e0]">{eventLabels[event.name] ?? event.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#85786f]">{event.name}</p>
                  </div>
                  <div className="text-[#cbc9c8]">
                    <p>{event.path}</p>
                    {event.payload ? <p className="mt-1 font-mono text-xs text-[#85786f]">{JSON.stringify(event.payload)}</p> : null}
                  </div>
                  <p className="text-[#a69c96]">{formatDate(event.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
