# Santos Supabase transfer checklist

Datum pripreme: 2026-09-08  
Trenutni vlasnicki nalog: `web.wise018@gmail.com`  
Supabase project ref: `jmnuuekizaljlqdeupqr`

## Preporuceni nacin prenosa

Koristiti Supabase **Project Transfer** iz postojece organizacije u novu organizaciju
klijenta. Ne praviti novi projekat i ne kopirati bazu, osim ako klijent zahteva drugu
regiju. In-place transfer zadrzava bazu, Auth korisnike, Storage fajlove, project URL i
API kljuceve, pa aplikacija ne bi trebalo da zahteva promenu Supabase environment
varijabli.

## Sta klijent treba da uradi

1. Da napravi/licno poseduje Supabase nalog.
2. Da napravi novu Supabase organizaciju na svom nalogu, npr. `Santos & Santorini`.
3. Da izabere plan organizacije i, ako je potreban placeni plan, doda svoju karticu i
   billing podatke.
4. U Organization Settings > Team da pozove `web.wise018@gmail.com` u svoju
   organizaciju. Za transfer je dovoljno clanstvo, ali je prakticno privremeno dati
   Owner ulogu do zavrsetka primopredaje.
5. Da javi tacan naziv nove organizacije i potvrdi da je poziv prihvacen.
6. Da ne pravi novi Supabase projekat i da ne salje lozinke, service-role kljuceve ili
   karticne podatke porukom.

## Provera pre transfera (izvrsava trenutni vlasnik)

- [ ] Trenutni nalog je Owner izvorne organizacije.
- [ ] `web.wise018@gmail.com` je clan ciljne organizacije klijenta.
- [ ] Nema aktivne GitHub integration konekcije na Supabase projektu.
- [ ] Nema project-scoped roles vezanih za projekat (Team/Enterprise).
- [ ] Nema podesenih Log Drains.
- [ ] Klijentov plan podrzava trenutne dodatke i potrosnju projekta.
- [ ] Sacuvan je svezi backup baze pre prenosa.
- [ ] Zabelezeni su Auth URL Configuration, OAuth provider podesavanja, Edge Function
      secrets, custom domain i eventualni add-ons.

## Poznati inventar (read-only provera 2026-09-08)

- Auth Admin API: dostupan; 3 korisnika.
- Storage bucket-i: `fabrics` (public), `buttons` (public), `linings` (public),
  `site-config` (private), `products` (public), `site-assets` (private).
- Aktivne kljucne tabele: `fabrics`, `buttons`, `linings`, `orders`,
  `button_positions`, `catalog_products`, `catalog_product_media`, `content_posts`,
  `content_post_categories`, `content_post_category_links`, `integration_sync_runs`,
  `integration_sync_items`, `integration_stock_delta_state`,
  `integration_stock_raw_files`, `integration_stock_raw_rows`,
  `integration_ananas_product_state`, `integration_ananas_discount_state`,
  `integration_stock_sync_log`.
- `site_data` nije prisutna u exposed `public` API schema; kod ima fallback ponasanje.

## Izvrsenje transfera

1. Supabase Dashboard > Santos projekat > Project Settings > General.
2. Izabrati **Transfer project**.
3. Kao target izabrati klijentovu organizaciju i potvrditi transfer.
4. Racunati na moguc prekid od 1-2 minuta ako se projekat prebacuje sa placenog na
   Free plan.

## Provera posle transfera

- [ ] Produkcijski sajt se otvara i katalog ucitava.
- [ ] Registracija/prijava i OAuth callback rade.
- [ ] Admin moze da cita i menja katalog.
- [ ] Test porudzbina se upisuje u `orders`.
- [ ] Upload i prikaz fajlova rade za public i private bucket-e.
- [ ] Cron/integracije rade i Edge Function secrets su prisutni, ako se koriste.
- [ ] Klijent vidi projekat, Usage, Billing i invoices u svojoj organizaciji.
- [ ] Klijent je Owner; prethodni vlasnik se spusta na dogovorenu ulogu ili uklanja.
- [ ] Po zavrsetku primopredaje rotirati server-side tajne koje vise ne treba da zna
      prethodni vlasnik (service-role/secret kljuc po potrebi i ostale spoljne API tajne),
      pa ih azurirati na hostingu. Public/publishable key nije tajna.

## Billing granica

Izvorna organizacija ostaje odgovorna za potrosnju nastalu do trenutka transfera.
Ciljna organizacija klijenta placa potrosnju nastalu posle transfera. Ranije nastali
racuni ili overage ne nestaju transferom.
