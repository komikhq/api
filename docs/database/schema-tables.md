# Skema Database

Dokumen ini merangkum 20 tabel yang diekspor dari `src/db/schema/index.ts`. Nama tabel dan kolom mengikuti nama fisik PostgreSQL; tipe dan batasan mengikuti deklarasi Drizzle saat ini.

Notasi: `PK` = primary key, `FK` = foreign key, `NN` = NOT NULL, `UQ` = unique, `TZ` = timestamp with time zone. Kolom tanpa `NN` bersifat nullable. Default ditulis setelah batasan.

## Akun dan Identitas

### `user`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `text` | PK |
| `name` | `text` | NN |
| `email` | `text` | NN, UQ |
| `email_verified` | `boolean` | NN, default `false` |
| `image` | `text` | |
| `username` | `text` | UQ |
| `role` | `text` | NN, default `'user'` |
| `created_at` | `timestamp` | NN, default `now()` |
| `updated_at` | `timestamp` | NN, default `now()` |

### `session`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `text` | PK |
| `user_id` | `text` | NN, FK -> `user.id`, ON DELETE CASCADE |
| `token` | `text` | NN, UQ |
| `expires_at` | `timestamp` | NN |
| `ip_address` | `text` | |
| `user_agent` | `text` | |
| `created_at` | `timestamp` | NN, default `now()` |
| `updated_at` | `timestamp` | NN, default `now()` |

### `account`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `text` | PK |
| `user_id` | `text` | NN, FK -> `user.id`, ON DELETE CASCADE |
| `account_id` | `text` | NN |
| `provider_id` | `text` | NN |
| `password` | `text` | |
| `access_token` | `text` | |
| `refresh_token` | `text` | |
| `id_token` | `text` | |
| `access_token_expires_at` | `timestamp` | |
| `refresh_token_expires_at` | `timestamp` | |
| `scope` | `text` | |
| `issuer` | `text` | |
| `created_at` | `timestamp` | NN, default `now()` |
| `updated_at` | `timestamp` | NN, default `now()` |

### `verification`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `text` | PK |
| `identifier` | `text` | NN |
| `value` | `text` | NN |
| `expires_at` | `timestamp` | NN |
| `created_at` | `timestamp` | NN, default `now()` |
| `updated_at` | `timestamp` | NN, default `now()` |

## Katalog Komik

### `comics`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `varchar(255)` | NN |
| `slug` | `varchar(255)` | NN, UQ |
| `synopsis` | `text` | |
| `cover_url` | `text` | NN |
| `banner_url` | `text` | |
| `alternate_titles` | `text[]` | NN, default array kosong |
| `type` | `varchar(20)` | NN, default `'manga'` |
| `status` | `varchar(20)` | NN, default `'ongoing'` |
| `access_tier` | `varchar(20)` | NN, default `'free'` |
| `total_chapters` | `integer` | NN, default `0` |
| `total_views` | `integer` | NN, default `0` |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

### `genres`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `varchar(50)` | NN, UQ |
| `slug` | `varchar(60)` | NN, UQ |
| `description` | `text` | |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

### `creators`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `varchar(255)` | NN |
| `slug` | `varchar(255)` | NN, UQ |
| `bio` | `text` | |
| `avatar_url` | `text` | |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

### `comic_genres`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `comic_id` | `uuid` | PK (gabungan), FK -> `comics.id`, ON DELETE CASCADE |
| `genre_id` | `uuid` | PK (gabungan), FK -> `genres.id`, ON DELETE CASCADE |

### `comic_creators`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `comic_id` | `uuid` | PK (gabungan), FK -> `comics.id`, ON DELETE CASCADE |
| `creator_id` | `uuid` | PK (gabungan), FK -> `creators.id`, ON DELETE CASCADE |
| `role` | `varchar(50)` | PK (gabungan), NN, default `'author'` |

## Bab dan Aktivitas Membaca

### `chapters`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `comic_id` | `uuid` | NN, FK -> `comics.id`, ON DELETE CASCADE |
| `chapter_number` | `numeric(7,2)` | NN |
| `title` | `varchar(255)` | |
| `slug` | `varchar(255)` | NN |
| `total_pages` | `integer` | NN, default `0` |
| `access_tier` | `varchar(20)` | |
| `is_early_access` | `boolean` | NN, default `false` |
| `free_release_at` | `timestamptz` | |
| `published_at` | `timestamptz` | NN, default `now()` |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

Unique index: `(comic_id, chapter_number)`.

### `chapter_pages`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `chapter_id` | `uuid` | NN, FK -> `chapters.id`, ON DELETE CASCADE |
| `page_number` | `integer` | NN |
| `image_url` | `text` | NN |
| `width` | `integer` | |
| `height` | `integer` | |
| `created_at` | `timestamptz` | NN, default `now()` |

Unique index: `(chapter_id, page_number)`.

### `reading_histories`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `text` | NN, FK -> `user.id`, ON DELETE CASCADE |
| `comic_id` | `uuid` | NN, FK -> `comics.id`, ON DELETE CASCADE |
| `chapter_id` | `uuid` | NN, FK -> `chapters.id`, ON DELETE CASCADE |
| `last_read_page` | `integer` | NN, default `1` |
| `snapshot_total_pages` | `integer` | NN |
| `is_completed` | `boolean` | NN, default `false` |
| `last_read_at` | `timestamptz` | NN, default `now()` |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

Unique index: `(user_id, chapter_id)`.

### `bookmarks`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `text` | NN, FK -> `user.id`, ON DELETE CASCADE |
| `comic_id` | `uuid` | NN, FK -> `comics.id`, ON DELETE CASCADE |
| `status` | `varchar(20)` | NN, default `'reading'` |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

Unique index: `(user_id, comic_id)`.

### `ratings`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `text` | NN, FK -> `user.id`, ON DELETE CASCADE |
| `comic_id` | `uuid` | NN, FK -> `comics.id`, ON DELETE CASCADE |
| `score` | `integer` | NN |
| `review_text` | `text` | |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

Unique index: `(user_id, comic_id)`.

### `user_subscriptions`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `text` | NN, FK -> `user.id`, ON DELETE CASCADE |
| `tier` | `varchar(20)` | NN |
| `starts_at` | `timestamptz` | NN |
| `expires_at` | `timestamptz` | NN |
| `is_active` | `boolean` | NN, default `true` |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

### `comic_view_logs`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `comic_id` | `uuid` | NN, FK -> `comics.id`, ON DELETE CASCADE |
| `chapter_id` | `uuid` | NN, FK -> `chapters.id`, ON DELETE CASCADE |
| `user_id` | `text` | FK -> `user.id`, ON DELETE SET NULL |
| `ip_hash` | `varchar(64)` | |
| `viewed_at` | `timestamptz` | NN, default `now()` |

Index: `(comic_id, viewed_at)` dan `(chapter_id, viewed_at)`.

## Komentar

### `comments`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `chapter_id` | `uuid` | FK -> `chapters.id`, ON DELETE CASCADE |
| `comic_id` | `uuid` | NN, FK -> `comics.id`, ON DELETE CASCADE |
| `user_id` | `text` | FK -> `user.id`, ON DELETE CASCADE |
| `guest_name` | `text` | |
| `guest_email` | `text` | |
| `is_spoiler` | `boolean` | NN, default `false` |
| `root_id` | `uuid` | FK -> `comments.id`, ON DELETE CASCADE |
| `parent_id` | `uuid` | FK -> `comments.id`, ON DELETE CASCADE |
| `reply_to_user_id` | `text` | FK -> `user.id`, ON DELETE SET NULL |
| `depth` | `integer` | NN, default `1` |
| `page_number` | `integer` | |
| `content` | `text` | NN |
| `like_count` | `integer` | NN, default `0` |
| `reply_count` | `integer` | NN, default `0` |
| `is_edited` | `boolean` | NN, default `false` |
| `is_deleted` | `boolean` | NN, default `false` |
| `created_at` | `timestamptz` | NN, default `now()` |
| `updated_at` | `timestamptz` | NN, default `now()` |

### `comment_likes`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `comment_id` | `uuid` | PK (gabungan), NN, FK -> `comments.id`, ON DELETE CASCADE |
| `user_id` | `text` | PK (gabungan), NN, FK -> `user.id`, ON DELETE CASCADE |
| `is_like` | `boolean` | NN, default `true` |
| `created_at` | `timestamptz` | NN, default `now()` |

### `comment_mentions`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `comment_id` | `uuid` | PK (gabungan), NN, FK -> `comments.id`, ON DELETE CASCADE |
| `mentioned_user_id` | `text` | PK (gabungan), NN, FK -> `user.id`, ON DELETE CASCADE |
| `created_at` | `timestamptz` | NN, default `now()` |

### `comment_reports`

| Kolom | Tipe PostgreSQL | Batasan / default |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `comment_id` | `uuid` | NN, FK -> `comments.id`, ON DELETE CASCADE |
| `reporter_user_id` | `text` | FK -> `user.id`, ON DELETE SET NULL |
| `reporter_guest_name` | `text` | |
| `reporter_guest_email` | `text` | |
| `reason` | `varchar(50)` | NN; nilai aplikasi: `SPAM`, `HARASSMENT`, `SPOILER`, `NSFW`, `OTHER` |
| `details` | `text` | |
| `status` | `varchar(20)` | NN, default `'PENDING'`; nilai aplikasi: `PENDING`, `RESOLVED`, `DISMISSED` |
| `created_at` | `timestamptz` | NN, default `now()` |