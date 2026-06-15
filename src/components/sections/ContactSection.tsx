"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { pricingPlans } from "@/content/pricing";
import { trackEvent } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const schema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z.string().regex(/^(\+7|8)\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, "Укажите российский телефон"),
  email: z.string().email("Укажите email"),
  objectType: z.string().min(1, "Выберите тип объекта"),
  area: z.string().min(1, "Укажите площадь"),
  city: z.string().min(2, "Укажите город"),
  budget: z.string().min(1, "Выберите бюджет"),
  service: z.string().min(1, "Выберите услугу"),
  startDate: z.string().min(1, "Укажите срок"),
  comment: z.string().optional(),
  agreement: z.boolean().refine(Boolean, "Нужно согласие"),
  website: z.string().max(0),
});

type FormValues = z.infer<typeof schema>;

const inputClass = "min-h-12 w-full border border-[#e7e3e0]/15 bg-[#080706]/55 px-4 text-[#e7e3e0] outline-none focus:border-[#e7e3e0]/55";
const TRAIL_KEY = "adv_activity_trail";
const UTM_KEY = "adv_utm";

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed || fallback;
  } catch {
    return fallback;
  }
}

function getLeadSource(activityTrail: Array<{ name: string; path: string }>) {
  const action = activityTrail.find((item) => ["price_select", "portfolio_open", "hero_cta_click", "phone_click"].includes(item.name));
  if (action?.name === "price_select") return "Выбор тарифа";
  if (action?.name === "portfolio_open") return "Портфолио";
  if (action?.name === "phone_click") return "Телефон";
  if (action?.name === "hero_cta_click") return "Главный экран";
  return activityTrail[0]?.path || "Форма сайта";
}

export function ContactSection() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: pricingPlans[0].title, agreement: false, website: "" },
  });

  useEffect(() => {
    const handler = (event: Event) => setValue("service", (event as CustomEvent<string>).detail);
    window.addEventListener("pricing:selected", handler);
    return () => window.removeEventListener("pricing:selected", handler);
  }, [setValue]);

  const onSubmit = async (data: FormValues) => {
    trackEvent("contact_form_submit");
    const activityTrail = readStoredJson<Array<{ name: string; path: string; createdAt: string; payload?: Record<string, string | number | boolean> }>>(TRAIL_KEY, []);
    const utm = readStoredJson<Record<string, string>>(UTM_KEY, {});
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        activityTrail,
        source: getLeadSource(activityTrail),
        utm,
      }),
    });
    if (!response.ok) throw new Error("Не удалось отправить заявку");
    setSuccess(true);
  };

  const FieldError = ({ name }: { name: keyof FormValues }) => errors[name] ? <p className="mt-2 text-sm text-[#e7b7a3]">{errors[name]?.message}</p> : null;

  return (
    <section id="contact" className="section bg-[#11100f]">
      <div className="container grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Contact"
          title={"Давайте создадим пространство,\nкоторое будет вашим."}
          text="Расскажите немного о будущем интерьере. Мы свяжемся с вами, уточним детали и предложим оптимальный формат работы."
        />
        <form className="glass grid gap-5 p-5 md:p-8" onSubmit={handleSubmit(onSubmit)} onFocus={() => trackEvent("contact_form_start")}>
          {success ? (
            <div className="py-10">
              <h3 className="serif text-4xl">Заявка отправлена</h3>
              <p className="mt-4 leading-7 text-[#cbc9c8]">Спасибо. Заявка сохранена в CRM, и мы свяжемся с вами после уточнения деталей.</p>
            </div>
          ) : (
            <>
              <input className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />
              <div className="grid gap-5 md:grid-cols-2">
                <label>Имя<input className={inputClass} {...register("name")} /></label>
                <label>Телефон<input className={inputClass} placeholder="+7 900 000-00-00" {...register("phone")} /></label>
                <label>Email<input className={inputClass} type="email" {...register("email")} /></label>
                <label>Тип объекта<select className={inputClass} {...register("objectType")}><option value="">Выберите</option><option>Квартира</option><option>Дом</option><option>Апартаменты</option><option>Коммерческое помещение</option><option>Другое</option></select></label>
                <label>Площадь<input className={inputClass} placeholder="86 м²" {...register("area")} /></label>
                <label>Город<input className={inputClass} {...register("city")} /></label>
                <label>Бюджет<select className={inputClass} {...register("budget")}><option value="">Выберите</option><option>до 3 млн ₽</option><option>3–7 млн ₽</option><option>7–15 млн ₽</option><option>от 15 млн ₽</option><option>пока не определен</option></select></label>
                <label>Выбранная услуга<select className={inputClass} {...register("service")}>{pricingPlans.map((plan) => <option key={plan.id}>{plan.title}</option>)}</select></label>
                <label>Желаемый срок начала<input className={inputClass} {...register("startDate")} /></label>
                <label>Планировка<input className={inputClass} type="file" /></label>
              </div>
              <label>Комментарий<textarea className={`${inputClass} min-h-32 py-3`} {...register("comment")} /></label>
              <label className="flex gap-3 text-sm leading-6 text-[#cbc9c8]"><input type="checkbox" {...register("agreement")} /> Согласен на обработку персональных данных</label>
              <div className="grid gap-1">
                {Object.keys(errors).map((key) => <FieldError key={key} name={key as keyof FormValues} />)}
              </div>
              <Button disabled={isSubmitting} className="w-full">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить заявку"}</Button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
