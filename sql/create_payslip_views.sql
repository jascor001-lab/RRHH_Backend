CREATE TABLE IF NOT EXISTS recursoshumanos.payslip_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  dni VARCHAR NOT NULL,
  nombre VARCHAR,
  object_key VARCHAR NOT NULL,
  year VARCHAR NOT NULL,
  month VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payslip_views_period
  ON recursoshumanos.payslip_views (year, month);

CREATE INDEX IF NOT EXISTS idx_payslip_views_dni
  ON recursoshumanos.payslip_views (dni);

CREATE INDEX IF NOT EXISTS idx_payslip_views_viewed_at
  ON recursoshumanos.payslip_views (viewed_at DESC);
