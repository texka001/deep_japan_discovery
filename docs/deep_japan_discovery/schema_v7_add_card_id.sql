-- Add card_id column to spots table
ALTER TABLE public.spots ADD COLUMN card_id BIGINT;

-- Create a function to generate a random 8-digit number (10000000 to 99999999)
CREATE OR REPLACE FUNCTION generate_card_id() RETURNS BIGINT AS $$
BEGIN
    RETURN floor(random() * (99999999 - 10000000 + 1) + 10000000)::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with unique random IDs
DO $$
DECLARE
    r RECORD;
    new_id BIGINT;
    done BOOLEAN;
BEGIN
    FOR r IN SELECT spot_id FROM public.spots WHERE card_id IS NULL LOOP
        done := FALSE;
        WHILE NOT done LOOP
            new_id := generate_card_id();
            -- Check for collision (unlikely but possible)
            IF NOT EXISTS (SELECT 1 FROM public.spots WHERE card_id = new_id) THEN
                UPDATE public.spots SET card_id = new_id WHERE spot_id = r.spot_id;
                done := TRUE;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Add limits and constraints
ALTER TABLE public.spots ALTER COLUMN card_id SET NOT NULL;
ALTER TABLE public.spots ADD CONSTRAINT spots_card_id_unique UNIQUE (card_id);
ALTER TABLE public.spots ADD CONSTRAINT spots_card_id_check CHECK (card_id BETWEEN 10000000 AND 99999999);

-- Function to automatically assign card_id on insert if not provided
CREATE OR REPLACE FUNCTION set_card_id_trigger() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.card_id IS NULL THEN
        LOOP
            NEW.card_id := generate_card_id();
            IF NOT EXISTS (SELECT 1 FROM public.spots WHERE card_id = NEW.card_id) THEN
                EXIT;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before insert
CREATE TRIGGER ensure_card_id
BEFORE INSERT ON public.spots
FOR EACH ROW
EXECUTE FUNCTION set_card_id_trigger();
