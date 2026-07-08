-- ============================================================================
-- تألق (Talluq) — مخطط قاعدة بيانات Supabase (مسار الإنتاج)
-- ----------------------------------------------------------------------------
-- كل المبالغ بالهللة (عدد صحيح): 10000 = 100.00 ﷼.
-- المبدأ الأمني: العميل لا يكتب في bookings/wallets/payments مباشرة —
-- القيود المالية تتم عبر دوال SECURITY DEFINER و Edge Functions.
-- شغّل هذا الملف في محرّر SQL بلوحة Supabase (أو عبر supabase db push).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------- الأنواع (Enums) -----------------------------
do $$ begin
  create type booking_status  as enum ('pending','confirmed','completed','cancelled','no_show');
  create type payment_status  as enum ('initiated','paid','failed','refunded');
  create type payment_type    as enum ('full','deposit');
  create type location_type   as enum ('salon','home');
  create type wallet_direction as enum ('credit','debit');
  create type wallet_tx_type  as enum
    ('refund_credit','booking_payment','topup','withdrawal','promo_credit','chargeback_debit','admin_adjustment');
  create type refund_method   as enum ('wallet','card');
exception when duplicate_object then null; end $$;

-- ------------------------------ الجداول ------------------------------------

-- ملف المستخدم (مرتبط بـ auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  phone       text,
  full_name   text,
  city        text,
  created_at  timestamptz not null default now()
);

-- الصالونات
create table if not exists public.salons (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users on delete set null,
  name          text not null,
  tagline       text,
  audience      text,           -- men | women | kids | family
  city          text not null,
  rating        numeric(2,1) default 0,
  reviews_count int default 0,
  home_service  boolean default false,
  featured      boolean default false,
  created_at    timestamptz not null default now()
);

-- الخدمات (مرتبطة بالصالون — قائمة صاحب الصالون تُنشر للعملاء)
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  salon_id    uuid not null references public.salons on delete cascade,
  name        text not null,
  price       int not null check (price >= 0),   -- هللة
  duration    int not null check (duration > 0), -- دقائق
  active      boolean default true,
  created_at  timestamptz not null default now()
);

-- الحلاقون
create table if not exists public.barbers (
  id        uuid primary key default gen_random_uuid(),
  salon_id  uuid not null references public.salons on delete cascade,
  name      text not null,
  title     text
);

-- الحجوزات
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users on delete cascade,
  salon_id       uuid not null references public.salons on delete restrict,
  service_id     uuid references public.services on delete set null,
  barber_id      uuid references public.barbers on delete set null,
  description    text,
  scheduled_at   timestamptz not null,
  location_type  location_type not null default 'salon',
  address        text,
  total_amount   int not null check (total_amount >= 0),
  deposit_amount int not null default 0 check (deposit_amount >= 0),
  status         booking_status not null default 'pending',
  created_at     timestamptz not null default now()
);

-- المحافظ
create table if not exists public.wallets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users on delete cascade,
  balance     int not null default 0,   -- هللة
  currency    text not null default 'SAR',
  updated_at  timestamptz not null default now()
);

-- حركات المحفظة
create table if not exists public.wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  wallet_id   uuid not null references public.wallets on delete cascade,
  amount      int not null check (amount >= 0),  -- موجب دائماً؛ الاتجاه في direction
  direction   wallet_direction not null,
  tx_type     wallet_tx_type not null,
  description text,
  created_at  timestamptz not null default now()
);

-- معاملات الدفع (Moyasar)
create table if not exists public.payment_transactions (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references public.bookings on delete cascade,
  user_id             uuid not null references auth.users on delete cascade,
  amount              int not null,             -- هللة
  payment_type        payment_type not null default 'full',
  status              payment_status not null default 'initiated',
  moyasar_payment_id  text,
  created_at          timestamptz not null default now()
);

-- الاستردادات
create table if not exists public.refunds (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings on delete cascade,
  amount      int not null,
  method      refund_method not null,
  status      text not null default 'completed',
  created_at  timestamptz not null default now()
);

-- ------------------------------ الفهارس ------------------------------------
create index if not exists idx_bookings_user       on public.bookings(user_id, scheduled_at desc);
create index if not exists idx_services_salon       on public.services(salon_id) where active;
create index if not exists idx_wallet_tx_wallet      on public.wallet_transactions(wallet_id, created_at desc);
create index if not exists idx_payments_booking      on public.payment_transactions(booking_id);

-- ============================================================================
-- سياسات RLS — كل مستخدم يرى بياناته فقط؛ الصالونات والخدمات عامة للقراءة.
-- ============================================================================
alter table public.profiles             enable row level security;
alter table public.salons               enable row level security;
alter table public.services             enable row level security;
alter table public.barbers              enable row level security;
alter table public.bookings             enable row level security;
alter table public.wallets              enable row level security;
alter table public.wallet_transactions  enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.refunds              enable row level security;

-- قراءة عامة للكتالوج
create policy "salons readable"   on public.salons   for select using (true);
create policy "services readable" on public.services for select using (true);
create policy "barbers readable"  on public.barbers  for select using (true);

-- صاحب الصالون يدير خدماته
create policy "owner manages services" on public.services for all
  using (exists (select 1 from public.salons s where s.id = services.salon_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.salons s where s.id = services.salon_id and s.owner_id = auth.uid()));

-- الملف الشخصي
create policy "own profile" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

-- الحجوزات: العميل يقرأ حجوزاته وينشئها؛ التحديث المالي عبر الدوال فقط
create policy "read own bookings"   on public.bookings for select using (user_id = auth.uid());
create policy "create own bookings" on public.bookings for insert with check (user_id = auth.uid());

-- المحفظة وحركاتها: قراءة فقط للمالك (الكتابة عبر SECURITY DEFINER)
create policy "read own wallet"    on public.wallets for select using (user_id = auth.uid());
create policy "read own wallet tx" on public.wallet_transactions for select
  using (exists (select 1 from public.wallets w where w.id = wallet_transactions.wallet_id and w.user_id = auth.uid()));

-- معاملات الدفع: قراءة فقط للمالك
create policy "read own payments" on public.payment_transactions for select using (user_id = auth.uid());
create policy "read own refunds"  on public.refunds for select
  using (exists (select 1 from public.bookings b where b.id = refunds.booking_id and b.user_id = auth.uid()));

-- ============================================================================
-- الدوال (تُستدعى من services/bookingService.ts و walletService.ts)
-- ============================================================================

-- إنشاء محفظة تلقائياً عند إنشاء ملف مستخدم
create or replace function public.ensure_wallet()
returns trigger language plpgsql security definer as $$
begin
  insert into public.wallets(user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists trg_ensure_wallet on public.profiles;
create trigger trg_ensure_wallet after insert on public.profiles
  for each row execute function public.ensure_wallet();

-- معاينة الاسترداد حسب السياسة والوقت المتبقي (يستدعيها previewRefund)
create or replace function public.evaluate_refund(p_booking_id uuid, p_reason text default 'customer_cancellation')
returns table (refund_amount int, refund_percentage int, paid_amount int, hours_remaining numeric)
language plpgsql security definer as $$
declare
  v_paid    int;
  v_hours   numeric;
  v_pct     int;
begin
  select coalesce(sum(amount),0) into v_paid
    from public.payment_transactions
    where booking_id = p_booking_id and status = 'paid';

  select extract(epoch from (scheduled_at - now()))/3600 into v_hours
    from public.bookings where id = p_booking_id;

  -- السياسة: قبل 24 ساعة استرداد كامل، قبل 6 ساعات 50%، وإلا لا استرداد
  v_pct := case when v_hours >= 24 then 100 when v_hours >= 6 then 50 else 0 end;

  refund_amount     := (v_paid * v_pct) / 100;
  refund_percentage := v_pct;
  paid_amount       := v_paid;
  hours_remaining   := greatest(v_hours, 0);
  return next;
end $$;

-- تنفيذ الإلغاء والاسترداد للمحفظة ذرّياً (يستدعيها Edge Function refund-payment)
create or replace function public.process_cancellation(p_booking_id uuid)
returns public.refunds language plpgsql security definer as $$
declare
  v_user uuid;
  v_wallet uuid;
  v_amount int;
  v_refund public.refunds;
begin
  select user_id into v_user from public.bookings where id = p_booking_id;
  if v_user is null then raise exception 'booking not found'; end if;

  select refund_amount into v_amount from public.evaluate_refund(p_booking_id);

  update public.bookings set status = 'cancelled' where id = p_booking_id;

  if v_amount > 0 then
    select id into v_wallet from public.wallets where user_id = v_user;
    update public.wallets set balance = balance + v_amount, updated_at = now() where id = v_wallet;
    insert into public.wallet_transactions(wallet_id, amount, direction, tx_type, description)
      values (v_wallet, v_amount, 'credit', 'refund_credit', 'استرداد إلغاء حجز');
  end if;

  insert into public.refunds(booking_id, amount, method, status)
    values (p_booking_id, v_amount, 'wallet', 'completed')
    returning * into v_refund;

  return v_refund;
end $$;
