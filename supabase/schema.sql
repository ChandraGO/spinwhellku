-- participants: daftar nama & poin
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points int not null default 0,
  created_at timestamptz not null default now()
);

-- config: setelan global (jadwal, jumlah spin, hadiah, allow same winner)
create table if not exists config (
  id int primary key default 1,
  scheduled_at_utc timestamptz,
  spins_count int not null default 1,
  prize_title text not null default 'Hadiah',
  allow_same_winner boolean not null default true,
  last_run_at timestamptz
);

insert into config (id) values (1)
on conflict (id) do nothing;

-- winners: hasil pemenang setiap event
create table if not exists winners (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete set null,
  participant_name text,
  points int,
  prize_title text,
  run_at timestamptz not null default now(),
  run_key text not null
);

create unique index if not exists winners_run_key_id_unique
on winners(run_key, id);

-- optional: cegah eksekusi dobel per event
create unique index if not exists winners_run_key_once_guard on winners(run_key)
where false; -- placeholder, gunakan check di API (lebih fleksibel)
