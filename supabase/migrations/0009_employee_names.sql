-- ============================================================================
-- Migration 0009 — Correct employee display names
-- ============================================================================
update public.profiles p
   set full_name = v.full_name
  from (values
        ('srihari.test@example.com',   'SriHari'),
        ('niharikahari00@gmail.com',   'Niharika'),
        ('greeshmadasari9@gmail.com',  'Greeshma'),
        ('yamini.test@example.com',    'Yamini'),
        ('laasya.test@example.com',    'LaasyaSri')
       ) as v(email, full_name)
  join auth.users u on lower(u.email) = lower(v.email)
 where p.id = u.id;

select u.email, p.full_name, p.role
  from auth.users u
  join public.profiles p on p.id = u.id
 where lower(u.email) in (
   'srihari.test@example.com', 'niharikahari00@gmail.com',
   'greeshmadasari9@gmail.com', 'yamini.test@example.com', 'laasya.test@example.com'
 )
 order by u.email;