SELECT
    tc.table_name, 
    kcu.column_name, 
    rc.delete_rule 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND kcu.table_name = 'spots' -- Wait, kcu.table_name is the referencing table usually? No.
    -- JOIN condition for referencing table:
    -- referencing table = tc.table_name
    -- referenced table = ccu.table_name (need to join constraint_column_usage)
    -- actually easier logic:
    
    AND EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage AS ccu
        WHERE ccu.constraint_name = tc.constraint_name
        AND ccu.table_name = 'spots'
    );
