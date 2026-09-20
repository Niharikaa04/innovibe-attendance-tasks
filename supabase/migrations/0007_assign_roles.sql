UPDATE public.profiles p
SET role = v.role
FROM (
    VALUES
        ('srihari.test@example.com', 'ceo'),
        ('niharikahari00@gmail.com', 'employee'),
        ('greeshmadasari9@gmail.com', 'employee'),
        ('yamini.test@example.com', 'employee'),
        ('laasya.test@example.com', 'employee')
) AS v(email, role)
JOIN auth.users u
    ON LOWER(u.email) = LOWER(v.email)
WHERE p.id = u.id;

SELECT
    u.email,
    p.full_name,
    p.role
FROM auth.users u
JOIN public.profiles p
    ON p.id = u.id
WHERE LOWER(u.email) IN (
    'srihari.test@example.com',
    'niharikahari00@gmail.com',
    'greeshmadasari9@gmail.com',
    'yamini.test@example.com',
    'laasya.test@example.com'
)
ORDER BY u.email;