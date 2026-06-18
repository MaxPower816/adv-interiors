"use client";

import { ArrowDown, ArrowUp, Copy, LogOut, Plus, RefreshCw, Search, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ActivityEvent, Lead, LeadStatus, MediaItem, Project, SiteContent } from "@/types";

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
const textareaClass = `${inputClass} min-h-28 py-3`;

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

const emptyContent: SiteContent = {
  hero: {
    eyebrow: "",
    title: "",
    subtitle: "",
    cta: "",
    finalCta: "",
  },
  about: {
    title: "",
    text: "",
    stats: [],
  },
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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createEmptyProject(): Project {
  return {
    slug: `project-${Date.now()}`,
    title: "Новый проект",
    city: "Москва",
    area: "",
    year: new Date().getFullYear().toString(),
    type: "Квартира",
    description: "",
    challenge: "",
    solution: "",
    materials: "",
    result: "",
    works: [],
    cover: "/images/interior-placeholder.svg",
    images: [],
    layout: "/images/plan-placeholder.svg",
    characteristics: {},
    published: false,
    sortOrder: 0,
    seoTitle: "",
    seoDescription: "",
  };
}

function linesToArray(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function arrayToLines(value: string[]) {
  return value.join("\n");
}

function characteristicsToLines(value: Record<string, string>) {
  return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join("\n");
}

function linesToCharacteristics(value: string) {
  return Object.fromEntries(
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return [key.trim(), rest.join(":").trim()];
      })
      .filter(([key, item]) => key && item),
  );
}

function statsToLines(stats: SiteContent["about"]["stats"]) {
  return stats.map((stat) => `${stat.value}|${stat.suffix}|${stat.label}`).join("\n");
}

function linesToStats(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawValue, suffix = "", label = ""] = line.split("|");
      return {
        value: Number(rawValue) || 0,
        suffix: suffix.trim(),
        label: label.trim(),
      };
    })
    .filter((stat) => stat.label);
}

export function AdminCRM() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<SiteContent>(emptyContent);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [saving, setSaving] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectOrderSaving, setProjectOrderSaving] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentMessage, setContentMessage] = useState("");
  const [mediaSaving, setMediaSaving] = useState(false);
  const [mediaMessage, setMediaMessage] = useState("");
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "layout" | "gallery" | null>(null);
  const [activeView, setActiveView] = useState<"leads" | "projects" | "content" | "media">("leads");

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0] ?? null;
  const selectedProject = projects.find((project) => (project.id || project.slug) === selectedProjectId) ?? projects[0] ?? null;

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

  const loadProjects = async () => {
    const response = await fetch("/api/admin/projects", { cache: "no-store" });

    if (response.status === 401) {
      setAuthenticated(false);
      setProjects([]);
      return;
    }

    const data = await response.json();
    setProjects(data.projects ?? []);
    setSelectedProjectId((current) => current || data.projects?.[0]?.id || data.projects?.[0]?.slug || "");
  };

  const loadContent = async () => {
    const response = await fetch("/api/admin/content", { cache: "no-store" });

    if (response.status === 401) {
      setAuthenticated(false);
      setContent(emptyContent);
      return;
    }

    const data = await response.json();
    setContent(data.content ?? emptyContent);
  };

  const loadMedia = async () => {
    const response = await fetch("/api/admin/media", { cache: "no-store" });

    if (response.status === 401) {
      setAuthenticated(false);
      setMedia([]);
      return;
    }

    const data = await response.json();
    setMedia(data.media ?? []);
  };

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
      setCheckingSession(false);

      if (data.authenticated) {
        await loadLeads();
        await loadProjects();
        await loadContent();
        await loadMedia();
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
    await loadProjects();
    await loadContent();
    await loadMedia();
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setLeads([]);
    setActivity([]);
    setProjects([]);
    setContent(emptyContent);
    setMedia([]);
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

  const updateSelectedProject = (patch: Partial<Project>) => {
    if (!selectedProject) return;
    const key = selectedProject.id || selectedProject.slug;
    setProjects((items) => items.map((item) => ((item.id || item.slug) === key ? { ...item, ...patch } : item)));
  };

  const saveSelectedProject = async () => {
    if (!selectedProject) return;
    setProjectSaving(true);

    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedProject),
    });

    if (response.ok) {
      const data = await response.json();
      setProjects((items) => {
        const saved = data.project as Project;
        const currentKey = selectedProject.id || selectedProject.slug;
        const exists = items.some((item) => (item.id || item.slug) === currentKey);
        return exists
          ? items.map((item) => ((item.id || item.slug) === currentKey ? saved : item))
          : [saved, ...items];
      });
      setSelectedProjectId(data.project.id || data.project.slug);
    }

    setProjectSaving(false);
  };

  const saveProjectOrder = async () => {
    setProjectOrderSaving(true);

    const savedProjects = await Promise.all(
      projects.map((project, index) => fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...project, sortOrder: index }),
      })),
    );

    if (savedProjects.every((response) => response.ok)) {
      await loadProjects();
    }

    setProjectOrderSaving(false);
  };

  const addProject = () => {
    const project = createEmptyProject();
    setProjects((items) => [project, ...items]);
    setSelectedProjectId(project.slug);
    setActiveView("projects");
  };

  const deleteSelectedProject = async () => {
    if (!selectedProject?.id) {
      setProjects((items) => items.filter((item) => item !== selectedProject));
      setSelectedProjectId(projects[1]?.id || projects[1]?.slug || "");
      return;
    }

    const response = await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedProject.id }),
    });

    if (response.ok) {
      setProjects((items) => items.filter((item) => item.id !== selectedProject.id));
      setSelectedProjectId("");
    }
  };

  const updateContent = (patch: Partial<SiteContent>) => {
    setContent((current) => ({ ...current, ...patch }));
  };

  const saveContent = async () => {
    setContentSaving(true);
    setContentMessage("");

    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    if (response.ok) {
      const data = await response.json();
      setContent(data.content ?? content);
      setContentMessage("Тексты сохранены. Обнови главную страницу.");
    } else {
      setContentMessage("Не удалось сохранить тексты. Проверь поля и попробуй еще раз.");
    }

    setContentSaving(false);
  };

  const uploadMedia = async () => {
    if (!mediaFile) {
      setMediaMessage("Выберите файл для загрузки.");
      return;
    }

    setMediaSaving(true);
    setMediaMessage("");

    const formData = new FormData();
    formData.append("file", mediaFile);
    formData.append("title", mediaTitle);
    formData.append("alt", mediaAlt);

    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setMedia((items) => [data.media, ...items]);
      setMediaTitle("");
      setMediaAlt("");
      setMediaFile(null);
      setMediaMessage("Картинка загружена. URL можно скопировать.");
    } else {
      setMediaMessage("Не удалось загрузить картинку. Проверь Supabase Storage и размер файла.");
    }

    setMediaSaving(false);
  };

  const deleteMedia = async (id: string) => {
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setMedia((items) => items.filter((item) => item.id !== id));
    }
  };

  const copyMediaUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setMediaMessage("URL скопирован.");
  };

  const openProjectMediaPicker = (target: "cover" | "layout" | "gallery") => {
    setMediaPickerTarget((current) => (current === target ? null : target));
    void loadMedia();
  };

  const applyMediaToProject = (item: MediaItem) => {
    if (!selectedProject || !mediaPickerTarget) return;

    if (mediaPickerTarget === "gallery") {
      const nextImages = selectedProject.images.includes(item.url)
        ? selectedProject.images.filter((image) => image !== item.url)
        : [...selectedProject.images, item.url];
      updateSelectedProject({ images: nextImages });
    } else {
      updateSelectedProject({ [mediaPickerTarget]: item.url });
      setMediaPickerTarget(null);
    }
  };

  const moveProject = (key: string, direction: -1 | 1) => {
    setProjects((items) => {
      const currentIndex = items.findIndex((item) => (item.id || item.slug) === key);
      const targetIndex = currentIndex + direction;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length) return items;

      const next = [...items];
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
  };

  const moveGalleryImage = (index: number, direction: -1 | 1) => {
    if (!selectedProject) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedProject.images.length) return;

    const nextImages = [...selectedProject.images];
    [nextImages[index], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[index]];
    updateSelectedProject({ images: nextImages });
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
          <p className="mt-4 text-xs leading-5 text-[#85786f]">На Vercel пароль задается переменной ADMIN_PASSWORD.</p>
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
          <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm text-[#cbc9c8] transition hover:bg-[#e7e3e0]/8" onClick={addProject}>
            <Plus className="h-4 w-4" />
            Проект
          </button>
          <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm text-[#cbc9c8] transition hover:bg-[#e7e3e0]/8" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </header>

      <nav className="mt-5 flex gap-2 border-b border-[#e7e3e0]/12 pb-3">
        {([
          ["leads", "Заявки"],
          ["projects", "Проекты"],
          ["content", "Тексты"],
          ["media", "Медиа"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            className={`min-h-10 border px-4 text-sm ${activeView === value ? "border-[#e7e3e0] bg-[#e7e3e0] text-[#080706]" : "border-[#e7e3e0]/15 text-[#cbc9c8]"}`}
            onClick={() => setActiveView(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeView === "leads" ? <><section className="grid gap-3 py-5 md:grid-cols-5">
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
                  className={textareaClass}
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
      </section></> : activeView === "projects" ? (
        <section className="grid gap-5 py-5 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border border-[#e7e3e0]/12 bg-[#11100f]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e7e3e0]/12 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Portfolio CMS</p>
                <h2 className="serif mt-1 text-4xl">Проекты</h2>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm" onClick={saveProjectOrder}>
                  {projectOrderSaving ? "Сохраняю..." : "Сохранить порядок"}
                </button>
                <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm" onClick={loadProjects}>
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-auto dark-scrollbar">
              {projects.length === 0 ? (
                <p className="p-5 text-sm text-[#85786f]">Проектов в CMS пока нет. Нажми “Проект”, чтобы добавить первый.</p>
              ) : projects.map((project, index) => {
                const key = project.id || project.slug;
                return (
                  <div
                    key={key}
                    className={`grid gap-3 border-b border-[#e7e3e0]/10 p-4 transition hover:bg-[#e7e3e0]/5 ${selectedProject && (selectedProject.id || selectedProject.slug) === key ? "bg-[#e7e3e0]/8" : ""}`}
                  >
                    <button type="button" className="grid w-full gap-2 text-left" onClick={() => setSelectedProjectId(key)}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{String(index + 1).padStart(2, "0")} · {project.title}</p>
                          <p className="mt-1 text-sm text-[#a69c96]">{project.slug}</p>
                        </div>
                        <span className={`shrink-0 border px-2 py-1 text-[11px] uppercase tracking-[0.12em] ${project.published ? "border-[#8da98d]/45 text-[#b5d0b5]" : "border-[#e7c891]/45 text-[#e7c891]"}`}>
                          {project.published ? "Опубликован" : "Черновик"}
                        </span>
                      </div>
                      <p className="text-sm text-[#cbc9c8]">{project.type}, {project.area}, {project.city}</p>
                    </button>
                    <div className="flex gap-2">
                      <button type="button" className="grid h-9 w-9 place-items-center border border-[#e7e3e0]/18 text-[#cbc9c8] disabled:opacity-30" disabled={index === 0} onClick={() => moveProject(key, -1)} aria-label="Поднять проект">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" className="grid h-9 w-9 place-items-center border border-[#e7e3e0]/18 text-[#cbc9c8] disabled:opacity-30" disabled={index === projects.length - 1} onClick={() => moveProject(key, 1)} aria-label="Опустить проект">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="border border-[#e7e3e0]/12 bg-[#11100f] p-5">
            {selectedProject ? (
              <div className="grid gap-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Карточка проекта</p>
                    <h2 className="serif mt-2 text-5xl leading-none">{selectedProject.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7b7a3]/35 px-3 text-sm text-[#e7b7a3]" onClick={deleteSelectedProject}>
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                    <button className="min-h-10 bg-[#e7e3e0] px-4 text-sm font-semibold text-[#080706]" onClick={saveSelectedProject}>
                      {projectSaving ? "Сохраняю..." : "Сохранить"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Название
                    <input
                      className={inputClass}
                      value={selectedProject.title}
                      onChange={(event) => updateSelectedProject({ title: event.target.value, slug: selectedProject.slug.startsWith("project-") ? slugify(event.target.value) : selectedProject.slug })}
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Slug
                    <input className={inputClass} value={selectedProject.slug} onChange={(event) => updateSelectedProject({ slug: slugify(event.target.value) })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Город
                    <input className={inputClass} value={selectedProject.city} onChange={(event) => updateSelectedProject({ city: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Площадь
                    <input className={inputClass} value={selectedProject.area} onChange={(event) => updateSelectedProject({ area: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Год
                    <input className={inputClass} value={selectedProject.year} onChange={(event) => updateSelectedProject({ year: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Тип
                    <input className={inputClass} value={selectedProject.type} onChange={(event) => updateSelectedProject({ type: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Порядок
                    <input className={inputClass} type="number" value={selectedProject.sortOrder ?? 0} onChange={(event) => updateSelectedProject({ sortOrder: Number(event.target.value) })} />
                  </label>
                  <label className="flex items-center gap-3 pt-7 text-sm text-[#cbc9c8]">
                    <input type="checkbox" checked={selectedProject.published ?? true} onChange={(event) => updateSelectedProject({ published: event.target.checked })} />
                    Опубликован
                  </label>
                </div>

                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Описание
                  <textarea className={textareaClass} value={selectedProject.description} onChange={(event) => updateSelectedProject({ description: event.target.value })} />
                </label>

                <div className="grid gap-4 border border-[#e7e3e0]/12 bg-[#080706]/45 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Страница проекта</p>
                    <h3 className="serif mt-1 text-4xl">Тексты кейса</h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-2 text-sm text-[#cbc9c8]">
                      Задача проекта
                      <textarea className={textareaClass} value={selectedProject.challenge || ""} onChange={(event) => updateSelectedProject({ challenge: event.target.value })} />
                    </label>
                    <label className="grid gap-2 text-sm text-[#cbc9c8]">
                      Решение
                      <textarea className={textareaClass} value={selectedProject.solution || ""} onChange={(event) => updateSelectedProject({ solution: event.target.value })} />
                    </label>
                    <label className="grid gap-2 text-sm text-[#cbc9c8]">
                      Материалы
                      <textarea className={textareaClass} value={selectedProject.materials || ""} onChange={(event) => updateSelectedProject({ materials: event.target.value })} />
                    </label>
                    <label className="grid gap-2 text-sm text-[#cbc9c8]">
                      Результат
                      <textarea className={textareaClass} value={selectedProject.result || ""} onChange={(event) => updateSelectedProject({ result: event.target.value })} />
                    </label>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    <span className="flex items-center justify-between gap-3">
                      Обложка URL
                      <button type="button" className="border border-[#e7e3e0]/18 px-2 py-1 text-xs text-[#cbc9c8]" onClick={() => openProjectMediaPicker("cover")}>
                        Выбрать
                      </button>
                    </span>
                    <input className={`${inputClass} min-w-0`} value={selectedProject.cover} onChange={(event) => updateSelectedProject({ cover: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    <span className="flex items-center justify-between gap-3">
                      Планировка URL
                      <button type="button" className="border border-[#e7e3e0]/18 px-2 py-1 text-xs text-[#cbc9c8]" onClick={() => openProjectMediaPicker("layout")}>
                        Выбрать
                      </button>
                    </span>
                    <input className={`${inputClass} min-w-0`} value={selectedProject.layout} onChange={(event) => updateSelectedProject({ layout: event.target.value })} />
                  </label>
                </div>

                {mediaPickerTarget ? (
                  <div className="border border-[#e7e3e0]/12 bg-[#080706]/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">
                          {mediaPickerTarget === "cover" ? "Выбор обложки" : mediaPickerTarget === "layout" ? "Выбор планировки" : "Выбор галереи"}
                        </p>
                        <p className="mt-1 text-sm text-[#a69c96]">
                          {mediaPickerTarget === "gallery" ? "Можно выбрать несколько. Цифра на картинке — порядок показа." : "Нажмите на одну картинку."}
                        </p>
                      </div>
                      <button type="button" className="border border-[#e7e3e0]/18 px-3 py-2 text-xs text-[#cbc9c8]" onClick={() => setMediaPickerTarget(null)}>
                        Закрыть
                      </button>
                    </div>
                    <div className="mt-4 grid max-h-80 gap-2 overflow-auto dark-scrollbar sm:grid-cols-2 xl:grid-cols-4">
                      {media.length === 0 ? (
                        <p className="text-sm text-[#85786f]">Картинок пока нет. Сначала загрузи их во вкладке “Медиа”.</p>
                      ) : media.map((item) => {
                        const galleryIndex = selectedProject.images.indexOf(item.url);
                        const selected = mediaPickerTarget === "cover"
                          ? selectedProject.cover === item.url
                          : mediaPickerTarget === "layout"
                            ? selectedProject.layout === item.url
                            : galleryIndex >= 0;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`relative aspect-[4/3] overflow-hidden border bg-cover bg-center text-left ${selected ? "border-[#e7e3e0]" : "border-[#e7e3e0]/12"}`}
                            style={{ backgroundImage: `url(${item.url})` }}
                            onClick={() => applyMediaToProject(item)}
                          >
                            <span className="absolute inset-x-0 bottom-0 bg-[#080706]/75 px-2 py-1 text-xs text-[#e7e3e0] backdrop-blur">{item.title || item.alt || "Изображение"}</span>
                            {selected ? (
                              <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-[#e7e3e0] text-sm font-bold text-[#080706]">
                                {mediaPickerTarget === "gallery" ? galleryIndex + 1 : "✓"}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    Работы, каждая с новой строки
                    <textarea className={textareaClass} value={arrayToLines(selectedProject.works)} onChange={(event) => updateSelectedProject({ works: linesToArray(event.target.value) })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    <span className="flex items-center justify-between gap-3">
                      Галерея URL, каждый с новой строки
                      <button type="button" className="border border-[#e7e3e0]/18 px-2 py-1 text-xs text-[#cbc9c8]" onClick={() => openProjectMediaPicker("gallery")}>
                        Выбрать несколько
                      </button>
                    </span>
                    <textarea className={`${textareaClass} whitespace-pre-wrap break-all`} value={arrayToLines(selectedProject.images)} onChange={(event) => updateSelectedProject({ images: linesToArray(event.target.value) })} />
                    {selectedProject.images.length > 0 ? (
                      <div className="grid min-w-0 gap-2">
                        {selectedProject.images.map((image, index) => (
                          <div key={`${image}-${index}`} className="grid min-w-0 grid-cols-[28px_1fr_auto_auto_auto] items-center gap-2 border border-[#e7e3e0]/10 bg-[#080706]/45 p-2">
                            <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#e7e3e0] text-xs font-bold text-[#080706]">{index + 1}</span>
                            <span className="min-w-0 break-all text-xs leading-5 text-[#a69c96]">{image}</span>
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center border border-[#e7e3e0]/18 text-[#cbc9c8] disabled:opacity-30"
                              disabled={index === 0}
                              onClick={() => moveGalleryImage(index, -1)}
                              aria-label="Поднять изображение"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center border border-[#e7e3e0]/18 text-[#cbc9c8] disabled:opacity-30"
                              disabled={index === selectedProject.images.length - 1}
                              onClick={() => moveGalleryImage(index, 1)}
                              aria-label="Опустить изображение"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="border border-[#e7b7a3]/35 px-2 py-1 text-xs text-[#e7b7a3]"
                              onClick={() => updateSelectedProject({ images: selectedProject.images.filter((item) => item !== image) })}
                            >
                              убрать
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </label>
                </div>

                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Характеристики, формат key: value
                  <textarea className={textareaClass} value={characteristicsToLines(selectedProject.characteristics)} onChange={(event) => updateSelectedProject({ characteristics: linesToCharacteristics(event.target.value) })} />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    SEO title
                    <input className={inputClass} value={selectedProject.seoTitle || ""} onChange={(event) => updateSelectedProject({ seoTitle: event.target.value })} />
                  </label>
                  <label className="grid gap-2 text-sm text-[#cbc9c8]">
                    SEO description
                    <input className={inputClass} value={selectedProject.seoDescription || ""} onChange={(event) => updateSelectedProject({ seoDescription: event.target.value })} />
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#85786f]">Выберите проект слева или добавьте новый.</p>
            )}
          </aside>
        </section>
      ) : activeView === "media" ? (
        <section className="py-5">
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="border border-[#e7e3e0]/12 bg-[#11100f] p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Media library</p>
                <h2 className="serif mt-2 text-5xl leading-none">Картинки</h2>
                <p className="mt-3 text-sm leading-6 text-[#a69c96]">Загружай изображения и копируй URL в обложку или галерею проекта.</p>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Файл
                  <input
                    className={inputClass}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => setMediaFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Название
                  <input className={inputClass} value={mediaTitle} onChange={(event) => setMediaTitle(event.target.value)} placeholder="Например: Кухня ЖК Prime Park" />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Alt-текст для SEO
                  <input className={inputClass} value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder="Описание изображения" />
                </label>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#e7e3e0] px-4 text-sm font-semibold text-[#080706]" onClick={uploadMedia}>
                  <Upload className="h-4 w-4" />
                  {mediaSaving ? "Загружаю..." : "Загрузить"}
                </button>
                {mediaMessage ? <p className="text-sm text-[#d7c4a3]">{mediaMessage}</p> : null}
              </div>
            </div>

            <div className="border border-[#e7e3e0]/12 bg-[#11100f]">
              <div className="flex items-center justify-between gap-3 border-b border-[#e7e3e0]/12 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Uploaded</p>
                  <h3 className="serif mt-1 text-4xl">Библиотека</h3>
                </div>
                <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm" onClick={loadMedia}>
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="grid max-h-[72vh] gap-px overflow-auto bg-[#e7e3e0]/10 dark-scrollbar sm:grid-cols-2 xl:grid-cols-3">
                {media.length === 0 ? (
                  <p className="bg-[#11100f] p-5 text-sm text-[#85786f]">Картинок пока нет.</p>
                ) : media.map((item) => (
                  <div key={item.id} className="bg-[#11100f] p-3">
                    <div className="aspect-[4/3] border border-[#e7e3e0]/10 bg-cover bg-center" style={{ backgroundImage: `url(${item.url})` }} />
                    <p className="mt-3 truncate text-sm font-semibold text-[#e7e3e0]">{item.title || item.alt || "Изображение"}</p>
                    <p className="mt-1 truncate text-xs text-[#85786f]">{item.url}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 border border-[#e7e3e0]/18 px-3 text-xs text-[#cbc9c8]" onClick={() => copyMediaUrl(item.url)}>
                        <Copy className="h-3.5 w-3.5" />
                        URL
                      </button>
                      <button className="inline-flex min-h-9 items-center justify-center border border-[#e7b7a3]/35 px-3 text-xs text-[#e7b7a3]" onClick={() => deleteMedia(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-5">
          <div className="border border-[#e7e3e0]/12 bg-[#11100f] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e7e3e0]/12 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#85786f]">Content CMS</p>
                <h2 className="serif mt-2 text-5xl leading-none">Тексты сайта</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#a69c96]">Пока здесь главный экран и блок философии. После сохранения Vercel обновит публичную страницу примерно в течение минуты.</p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex min-h-10 items-center gap-2 border border-[#e7e3e0]/18 px-3 text-sm text-[#cbc9c8]" onClick={loadContent}>
                  <RefreshCw className="h-4 w-4" />
                  Обновить
                </button>
                <button className="min-h-10 bg-[#e7e3e0] px-4 text-sm font-semibold text-[#080706]" onClick={saveContent}>
                  {contentSaving ? "Сохраняю..." : "Сохранить тексты"}
                </button>
              </div>
            </div>
            {contentMessage ? <p className="mt-4 text-sm text-[#d7c4a3]">{contentMessage}</p> : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="grid gap-4">
                <h3 className="serif text-4xl">Главный экран</h3>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Маленькая строка сверху
                  <input className={inputClass} value={content.hero.eyebrow} onChange={(event) => updateContent({ hero: { ...content.hero, eyebrow: event.target.value } })} />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Заголовок
                  <textarea className={textareaClass} value={content.hero.title} onChange={(event) => updateContent({ hero: { ...content.hero, title: event.target.value } })} />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Подзаголовок
                  <textarea className={textareaClass} value={content.hero.subtitle} onChange={(event) => updateContent({ hero: { ...content.hero, subtitle: event.target.value } })} />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Текст кнопки
                  <input className={inputClass} value={content.hero.cta} onChange={(event) => updateContent({ hero: { ...content.hero, cta: event.target.value } })} />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Кнопка в финале скролла
                  <input className={inputClass} value={content.hero.finalCta} onChange={(event) => updateContent({ hero: { ...content.hero, finalCta: event.target.value } })} />
                </label>
              </div>

              <div className="grid gap-4">
                <h3 className="serif text-4xl">О студии</h3>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Заголовок
                  <textarea className={textareaClass} value={content.about.title} onChange={(event) => updateContent({ about: { ...content.about, title: event.target.value } })} />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Текст
                  <textarea className={textareaClass} value={content.about.text} onChange={(event) => updateContent({ about: { ...content.about, text: event.target.value } })} />
                </label>
                <label className="grid gap-2 text-sm text-[#cbc9c8]">
                  Цифры, формат: число|суффикс|подпись
                  <textarea
                    className={textareaClass}
                    value={statsToLines(content.about.stats)}
                    onChange={(event) => updateContent({ about: { ...content.about, stats: linesToStats(event.target.value) } })}
                  />
                </label>
                <div className="border border-[#e7e3e0]/10 bg-[#080706]/50 p-4 text-sm leading-6 text-[#a69c96]">
                  Пример строки для цифр: <span className="text-[#e7e3e0]">8|+|лет в дизайне</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
