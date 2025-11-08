'use server';

import { revalidatePath } from 'next/cache';
import { query, queryOne, transaction } from '@/lib/db';
import { sha256Hash } from '@/lib/utils';
import { Destination, SavedShortLink } from '@/lib/types';

interface ShortLinkRow {
  id: string;
  title: string;
  slug: string;
  target_url: string;
  hero_image: string | null;
  origin: string | null;
  created_at: Date | null;
}

interface ShortLinkDestinationRow {
  id: string;
  title: string;
  url: string;
  position: number;
  image_object_key: string | null;
}

interface CreateShortLinkInput {
  title: string;
  slug: string;
  editorToken: string;
  destinations: Array<Destination>;
  heroImage?: string;
  origin?: string;
}

interface CreateShortLinkResult {
  success: boolean;
  id?: string;
  slug?: string;
  createdAt?: string;
  editorToken?: string;
  error?: string;
}

function normalizeDestinations(destinations: Array<Destination>) {
  return destinations
    .map((destination, index) => ({
      id: destination.id || `dest-${index}-${Date.now()}`,
      title: destination.title?.trim() || `Destination ${index + 1}`,
      url: destination.url?.trim() || '',
      position: typeof destination.position === 'number' ? destination.position : index,
      image: destination.image || null,
    }))
    .filter((destination) => destination.url);
}

export async function createShortLink(input: CreateShortLinkInput): Promise<CreateShortLinkResult> {
  const slug = input.slug.trim().toLowerCase();
  const destinations = normalizeDestinations(input.destinations);

  if (!destinations.length) {
    return { success: false, error: 'At least one destination is required.' };
  }

  const editorTokenHash = sha256Hash(input.editorToken);
  const firstDestinationUrl = destinations[0]?.url ?? null;

  try {
    const result = await transaction<{ shortLinkId: string; createdAt: string }>(async (client) => {
      const existing = await client.query(
        `SELECT id FROM short_link WHERE editor_token_hash = $1`,
        [editorTokenHash]
      );

      let shortLinkId: string;
      let createdAt: string;

      if (existing.rowCount) {
        shortLinkId = existing.rows[0].id;

        await client.query(
          `UPDATE short_link
             SET title = $1,
                 slug = $2,
                 target_url = $3,
                 hero_image = $4,
                 origin = $5,
                 redirect_code = 302,
                 status = 'active',
                 updated_at = NOW()
           WHERE id = $6`,
          [
            input.title.trim(),
            slug,
            firstDestinationUrl,
            input.heroImage || null,
            input.origin || null,
            shortLinkId,
          ]
        );

        await client.query(`DELETE FROM short_link_destination WHERE short_link_id = $1`, [
          shortLinkId,
        ]);

        const createdRow = await client.query<{ created_at: Date | null }>(
          `SELECT created_at FROM short_link WHERE id = $1`,
          [shortLinkId]
        );
        const createdValue = createdRow.rows[0]?.created_at;
        createdAt = createdValue instanceof Date ? createdValue.toISOString() : new Date().toISOString();
      } else {
        const insert = await client.query<{ id: string; created_at: Date | null }>(
          `INSERT INTO short_link (
              title,
              slug,
              target_url,
              owner_device_key_hash,
              editor_token_hash,
              redirect_code,
              hero_image,
              origin,
              status
            )
           VALUES ($1, $2, $3, $4, $5, 302, $6, $7, 'active')
           RETURNING id, created_at`,
          [
            input.title.trim(),
            slug,
            firstDestinationUrl,
            null,
            editorTokenHash,
            input.heroImage || null,
            input.origin || null,
          ]
        );

        shortLinkId = insert.rows[0].id;
        const createdValue = insert.rows[0].created_at;
        createdAt = createdValue instanceof Date ? createdValue.toISOString() : new Date().toISOString();
      }

      for (const destination of destinations) {
        await client.query(
          `INSERT INTO short_link_destination (short_link_id, title, url, position, image_object_key)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            shortLinkId,
            destination.title,
            destination.url,
            destination.position,
            destination.image || null,
          ]
        );
      }

      return { shortLinkId, createdAt };
    });

    revalidatePath('/short/new');
    revalidatePath(`/${slug}`);
    revalidatePath(`/slp/${slug}`);
    revalidatePath(`/short/edit/${input.editorToken}`);

    return {
      success: true,
      id: result.shortLinkId,
      slug,
      createdAt: result.createdAt,
      editorToken: input.editorToken,
    };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return {
        success: false,
        error: 'Slug already in use. Generate a new one and try again.',
      };
    }

    console.error('[createShortLink] Error:', error);
    return {
      success: false,
      error: 'Failed to create short link.',
    };
  }
}

export async function getShortLinkBySlug(slug: string) {
  const shortLink = await queryOne<ShortLinkRow>(
    `SELECT id, title, slug, target_url, hero_image, origin
     FROM short_link
     WHERE slug = $1 AND status = 'active'`,
    [slug]
  );

  if (!shortLink) {
    return null;
  }

  const destinations = await query<ShortLinkDestinationRow>(
    `SELECT id, title, url, position, image_object_key
     FROM short_link_destination
     WHERE short_link_id = $1
     ORDER BY position`,
    [shortLink.id]
  );

  const mappedDestinations = destinations.map((destination) => ({
    id: destination.id,
    title: destination.title,
    url: destination.url,
    position: destination.position,
    image: destination.image_object_key || undefined,
  }));

  return {
    id: shortLink.id,
    title: shortLink.title,
    slug: shortLink.slug,
    targetUrl: shortLink.target_url,
    mode: mappedDestinations.length > 1 ? 'multi' : 'single',
    heroImage: shortLink.hero_image,
    origin: shortLink.origin,
    destinations: mappedDestinations,
  };
}

export async function getShortLinkByEditorToken(editorToken: string): Promise<SavedShortLink | null> {
  const tokenHash = sha256Hash(editorToken);

  const shortLink = await queryOne<ShortLinkRow>(
    `SELECT id, title, slug, target_url, hero_image, origin, created_at
     FROM short_link
     WHERE editor_token_hash = $1 AND status = 'active'`,
    [tokenHash]
  );

  if (!shortLink) {
    return null;
  }

  const destinations = await query<ShortLinkDestinationRow>(
    `SELECT id, title, url, position, image_object_key
     FROM short_link_destination
     WHERE short_link_id = $1
     ORDER BY position`,
    [shortLink.id]
  );

  return {
    id: shortLink.id,
    title: shortLink.title,
    slug: shortLink.slug,
    editorToken,
    editorUrl: `/short/edit/${editorToken}`,
    createdAt:
      shortLink.created_at instanceof Date ? shortLink.created_at.toISOString() : new Date().toISOString(),
    origin: shortLink.origin || undefined,
    heroImage: shortLink.hero_image || undefined,
    destinations: destinations.map((destination) => ({
      id: destination.id,
      title: destination.title,
      url: destination.url,
      position: destination.position,
      image: destination.image_object_key || undefined,
    })),
  };
}

