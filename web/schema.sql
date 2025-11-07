-- QR-Gen Studio Database Schema
-- PostgreSQL 17+

-- Enable UUID extension for UUIDv7 support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main QR table
CREATE TABLE IF NOT EXISTS qr (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('single', 'multi')),
    default_destination_url TEXT,
    editor_token_hash VARCHAR(255) UNIQUE NOT NULL,
    editor_password_hash TEXT,
    style_id UUID,
    ecc_level VARCHAR(1) NOT NULL DEFAULT 'M' CHECK (ecc_level IN ('L', 'M', 'Q', 'H')),
    quiet_zone_modules INTEGER NOT NULL DEFAULT 4,
    module_style VARCHAR(20) NOT NULL DEFAULT 'square' CHECK (module_style IN ('square', 'rounded', 'dot')),
    eye_style VARCHAR(20) NOT NULL DEFAULT 'square' CHECK (eye_style IN ('square', 'rounded')),
    fg_color VARCHAR(20) NOT NULL DEFAULT '#000000',
    bg_color VARCHAR(20) NOT NULL DEFAULT '#FFFFFF',
    gradient_json JSONB,
    hero_image TEXT,
    logo_object_key TEXT,
    logo_size_ratio DECIMAL(3,2) DEFAULT 0.20,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_published_at TIMESTAMPTZ
);

-- QR destinations
CREATE TABLE IF NOT EXISTS qr_destination (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_id UUID NOT NULL REFERENCES qr(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    image_object_key TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QR scan events for analytics
CREATE TABLE IF NOT EXISTS qr_scan_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_id UUID NOT NULL REFERENCES qr(id) ON DELETE CASCADE,
    public_slug_snapshot VARCHAR(255) NOT NULL,
    user_agent_hash VARCHAR(255),
    ip_hash VARCHAR(255),
    country_iso VARCHAR(2),
    city_name VARCHAR(255),
    referrer_domain VARCHAR(500),
    device_category VARCHAR(20) CHECK (device_category IN ('mobile', 'tablet', 'desktop')),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Short links
CREATE TABLE IF NOT EXISTS short_link (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    owner_device_key_hash VARCHAR(255) NOT NULL,
    redirect_code INTEGER NOT NULL DEFAULT 302 CHECK (redirect_code IN (301, 302)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'))
);

-- Short link click events
CREATE TABLE IF NOT EXISTS short_click_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    short_link_id UUID NOT NULL REFERENCES short_link(id) ON DELETE CASCADE,
    user_agent_hash VARCHAR(255),
    ip_hash VARCHAR(255),
    country_iso VARCHAR(2),
    city_name VARCHAR(255),
    referrer_domain VARCHAR(500),
    device_category VARCHAR(20) CHECK (device_category IN ('mobile', 'tablet', 'desktop')),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blocked URLs for safety
CREATE TABLE IF NOT EXISTS blocked_url (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url_hash VARCHAR(255) UNIQUE NOT NULL,
    reason TEXT,
    source VARCHAR(50) NOT NULL CHECK (source IN ('webrisk', 'manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File objects (for R2 tracking)
CREATE TABLE IF NOT EXISTS file_object (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_key TEXT UNIQUE NOT NULL,
    mime_type VARCHAR(100),
    bytes BIGINT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploader_hint TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_slug ON qr(slug);
CREATE INDEX IF NOT EXISTS idx_qr_editor_token ON qr(editor_token_hash);
CREATE INDEX IF NOT EXISTS idx_qr_status ON qr(status);
CREATE INDEX IF NOT EXISTS idx_qr_destination_qr_id ON qr_destination(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_event_qr_id ON qr_scan_event(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_event_ts ON qr_scan_event(ts);
CREATE INDEX IF NOT EXISTS idx_short_link_slug ON short_link(slug);
CREATE INDEX IF NOT EXISTS idx_short_click_event_link_id ON short_click_event(short_link_id);
CREATE INDEX IF NOT EXISTS idx_blocked_url_hash ON blocked_url(url_hash);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_qr_updated_at BEFORE UPDATE ON qr
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_destination_updated_at BEFORE UPDATE ON qr_destination
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_short_link_updated_at BEFORE UPDATE ON short_link
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

