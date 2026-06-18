# ADV Interiors CMS roadmap

Goal: edit site content from `/admin` without changing code, pushing GitHub commits, or redeploying for routine updates.

## Phase 1: Portfolio CMS

- Store projects in Supabase.
- Add, edit, archive, and reorder portfolio projects from admin.
- Edit project fields: slug, title, city, area, year, type, description, works, cover, gallery, layout, characteristics, SEO title, SEO description.
- Keep code fallback content so the site still renders if Supabase is unavailable.

## Phase 2: Media Library

- Use Supabase Storage for project images.
- Upload cover images, gallery images, and layout files from admin.
- Reuse uploaded files across projects.

## Phase 3: Site Text CMS

- Edit homepage hero, about, services, process, FAQ, pricing notes, contacts, footer/legal texts.
- Store structured content blocks in Supabase.

## Phase 4: SEO CMS

- Edit title, description, canonical, OpenGraph image, project SEO fields, sitemap visibility.
- Add safe previews before publishing.

## Phase 5: Publishing Workflow

- Draft/published statuses.
- Preview unpublished edits.
- Simple change history for projects and key text blocks.
