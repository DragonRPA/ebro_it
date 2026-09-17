-- ==================================================
-- Supabase Bulk Upsert: 53 Equipment Model Specifications
-- Generated at: 2026-08-27
-- ==================================================

INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-001', 'JCPT0607DCS', 20, '배터리, 5.6 M, 적재 240 kg', 'DINGLI', '배터리', '5.6 M', '3.6 M',
    '880 Kg', '240 kg', '1.44x 0.76 x 1.90 M', '1.29x 0.70 M', '° 15 %', '4 Km/h',
    '031-334-5296', '140 kg', '100 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-002', 'JCPT0807AC', 20, '배터리, 7.8 M, 적재 230 kg', 'DINGLI', '배터리', '7.8 M', '6 M',
    '1,630 Kg', '230 kg', '1.86 x 0.76 x 2.02 M', '1.67 x 0.74 M', '25 %', '4.5 Km/h',
    '031-334-5296', '117 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-003', 'JCPT1008AC', 32, '배터리, 10 M, 적재 230 kg', 'DINGLI', '배터리', '10 M', '8 M',
    '2,230 Kg', '230 kg', '2.48 x 0.83 x 2.36 M', '2.27 x 0.81 M', '% 25 %', '5 Km/h',
    '031-334-5296', '117 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-004', 'JCPT1012AC', 32, '배터리, 10.0 M, 적재 450 kg', 'DINGLI', '배터리', '10.0 M', '8.0 M',
    '2,710 Kg', '450 kg', '2.48 x 1.15 x 2.36 M', '1.15 x 2.27 M', '% 25 %', '5 Km/h',
    '031-334-5296', '337 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-005', 'S1008AC+', 32, '배터리, 10 M, 적재 272 kg', 'DINGLI', '배터리', '10 M', '8 M',
    '2,230 Kg', '272 kg', '2.48 x 0.83 x 2.36 M', '2.27 x 0.81 M', '% 25 %', '6 Km/h',
    '031-334-5296', '159 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-006', 'S1012AC+', 32, '배터리, 10 M, 적재 450 kg', 'DINGLI', '배터리', '10 M', '8 M',
    '2,750 Kg', '450 kg', '2.48 x 1.15 x 2.36 M', '2.27 x 1.12 M', '% 25 %', '3 Km/h',
    '031-334-5296', '337 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-007', 'JCPT1212AC', 39, '배터리, 12.0 M, 적재 320 kg', 'DINGLI', '배터리', '12.0 M', '10.0 M',
    '3,060 Kg', '320 kg', '2.48 x 1.15 x 2.49 M', '2.27 x 1.12 M', '% 25 %', '3.5 Km/h',
    '031-334-5296', '207 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-008', 'S1212AC+', 39, '배터리, 12 M, 적재 408 kg', 'DINGLI', '배터리', '12 M', '10 M',
    '3,060 Kg', '408 kg', '2.48 x 1.15 x 2.49 M', '2.27 x 1.12 M', '% 25 %', '3 Km/h',
    '031-334-5296', '295 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-009', 'JCPT1412AC', 45, '배터리, 13.8 M, 적재 320 kg', 'DINGLI', '배터리', '13.8 M', '11.8 M',
    '2,990 Kg', '320 kg', '2.84 x 1.19 x 2.62 M', '2.48 x 2.62 M', '% 25 %', '3.5 Km/h',
    '031-334-5296', '207 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-010', 'S1412AC+', 45, '배터리, 13.8 M, 적재 408 kg', 'DINGLI', '배터리', '13.8 M', '11.8 M',
    '3,250 Kg', '408 kg', 'M', '2.27 x 1.12 M', '25 %', '6.0 Km/h',
    '031-334-5296', '295 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-011', 'JCPT1614ACZ', 53, '배터리, 15.7 M, 적재 350 kg', 'DINGLI', '배터리', '15.7 M', '13.7 M',
    '3,470 Kg', '350 kg', '2.84 x 1.39 x 2.62 M', '2.64 x 1.12 M', '% 25 %', '3 Km/h',
    '031-334-5296', '237 kg', '113 kg', '16.0 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-012', 'S1612AC+', 53, '배터리, 15.7 M, 적재 363 kg', 'DINGLI', '배터리', '15.7 M', '13.7 M',
    '3,520 Kg', '363 kg', '2.84 x 1.25 x 2.62 M', '2.64 x 1.12 M', '% 25 %', '6 Km/h',
    '031-334-5296', '227 kg', '136 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-013', 'S1614AC+', 53, '배터리, 15.7 M, 적재 363 kg', 'DINGLI', '배터리', '15.7 M', '13.7 M',
    '3,500 Kg', '363 kg', '2.84 x 1.39 x 2.62 M', '2.64 x 1.12 M', '% 25 %', '5.5 Km/h',
    '031-334-5296', '250 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-014', 'GS-1330m', 13, '배터리, 5.7 M, 적재 227 kg', 'GENIE', '배터리', '5.7 M', '3.9 M',
    '902 Kg', '227 kg', '1.41 x 0.78 x 1.83 M', '1.26 x 0.67 M', '25 %', '4 Km/h',
    '031-334-5296', '136 kg', '91 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-015', 'GS-1432', 14, '배터리, 6.3 M, 적재 227 kg', 'GENIE', '배터리', '6.3 M', '4.3 M',
    '900 Kg', '227 kg', '1.40 x 0.81 x 1.88 M', '1.40 x 0.78 M', '25 %', '4 Km/h',
    '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-016', 'GS-1930', 19, '배터리, 7.8 M, 적재 227 kg', 'GENIE', '배터리', '7.8 M', '5.8 M',
    '1226 Kg', '227 kg', '1.83 x 0.77 x 2.16 M', '1.64 x 0.76 M', '25 %', '4 Km/h',
    '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-017', 'GS-1930 E', 19, '배터리, 7.8 M, 적재 227 kg', 'GENIE', '배터리', '7.8 M', '5.8 M',
    '1,498 Kg', '227 kg', '1.83 x 0.76 x 2.10 M', '1.63 x 0.76 M', '% 25 %', '4 Km/h',
    '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-018', 'GS-2632', 26, '배터리, 9.9 M, 적재 227 kg', 'GENIE', '배터리', '9.9 M', '7.9 M',
    '2,003 Kg', '227 kg', '2.44 x 0.81 x 2.26 M', '2.26 x 0.84 M', '25 %', '3.5 Km/h',
    '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-019', 'GS-2632 E', 26, '배터리, 10 M, 적재 227 kg', 'GENIE', '배터리', '10 M', '8 M',
    '2,145 Kg', '227 kg', '2.44 x 0.82 x 2.31 M', '2.26 x 0.84 M', '% 25 %', '3.2 Km/h',
    '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-020', 'GS-2646', 26, '배터리, 9.92 M, 적재 454 kg', 'GENIE', '배터리', '9.92 M', '7.92 M',
    '1,956 Kg', '454 kg', '2.44 x 1.18 x 2.31 M', '2.26 x 1.18 M', '25 %', '3.5 Km/h',
    '031-334-5296', '341 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-021', 'GS-2646 E', 26, '배터리, 10 M, 적재 454 kg', 'GENIE', '배터리', '10 M', '8 M',
    '1,997 Kg', '454 kg', '2.44 x 1.17 x 2.26 M', '2.26 x 1.15 M', '% 25 %', '3.5 Km/h',
    '031-334-5296', '341 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-022', 'GS-3246', 32, '배터리, 11.8 M, 적재 205 kg', 'GENIE', '배터리', '11.8 M', '9.8 M',
    '2367 Kg', '205 kg', '2.44 x 1.18 x 2.44 M', '2.26 x 1.18 M', '25 %', '3.2 Km/h',
    '031-334-5296', '113 kg', '', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-023', 'GS-3246 E', 32, '배터리, 11.7 M, 적재 318 kg', 'GENIE', '배터리', '11.7 M', '9.7 M',
    '2,374 Kg', '318 kg', '2.44 x 1.17 x 2.39 M', '2.26 x 1.16 M', '% 25 %', '3.5 Km/h',
    '031-334-5296', '205 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-024', 'GS-4046', 40, '배터리, 13.7 M, 적재 350 kg', 'GENIE', '배터리', '13.7 M', '11.9 M',
    '3,184 Kg', '350 kg', '2.48 x 1.17 x 2.57 M', '2.26 x 1.16 M', '25 %', '3.2 Km/h',
    '031-334-5296', '237 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-025', 'GS-4047', 40, '배터리, 13.7 M, 적재 350 kg', 'GENIE', '배터리', '13.7 M', '11.7 M',
    '3,260 Kg', '350 kg', '2.48 x 1.19 x 2.54 M', '2.26 x 1.16 M', '% 25 %', '3.2 Km/h',
    '031-334-5296', '237 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-026', 'GS-4069DC', 40, '배터리, 14.3 M, 적재 363 kg', 'GENIE', '배터리', '14.3 M', '12.3 M',
    '4,933 Kg', '363 kg', '3.12 x 1.6 x 2.74 M', '2.79 x 1.6 M', '19 ° %', '7.2 Km/h',
    '031-334-5296', '250 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-027', 'Z-45/25J', 45, '배터리, 15.9 M, 적재 227 kg', 'GENIE', '배터리', '15.9 M', '13.9 M',
    '7,400 Kg', '227 kg', '6.83 x 1.79 x 2.0 M', '1.83 x 0.76 M', '30 %', '4.8 Km/h',
    '031-334-5296', '227 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-028', 'GS-4655', 46, '배터리, 15.95 M, 적재 349 kg', 'GENIE', '배터리', '15.95 M', '13.95 M',
    '3,701 Kg', '349 kg', '3.11 x 1.41 x 2.77 M', '2.84 x 1.35 M', '% 25 %', '4 Km/h',
    '031-334-5296', '213 kg', '136 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-029', 'GS-5390RT', 53, '디젤, 18 M, 적재 680 kg', 'GENIE', '디젤', '18 M', '16.15 M',
    '7,537 Kg', '680 kg', '4.88 x 2.29 x 3.15 M', '3.98 x 1.83 M', '12 %', '8 Km/h',
    '031-334-5296', '460 kg', '110 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-030', 'STAR-6', 15, '배터리, 5.8 M, 적재 230 kg', 'HAULOTTE', '배터리', '5.8 M', '3.8 M',
    '880 Kg', '230 kg', '1.4 x 0.79 x 1.75 M', '1.38 x 0.77 M', '% 25 %', '4.5 Km/h',
    '031-334-5296', '110 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-031', 'OPTIMUM 8', 20, '배터리, 7.77 M, 적재 230 kg', 'HAULOTTE', '배터리', '7.77 M', '5.77 M',
    '1,590 Kg', '230 kg', '1.9 x 0.79 x 1.88 M', '2.59 x 0.74 M', '25 %', '4.5 Km/h',
    '031-334-5296', '120 kg', '110 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-032', '1230ES', 12, '배터리, 5.7 M, 적재 230 kg', 'JLG', '배터리', '5.7 M', '3.7 M',
    '790 Kg', '230 kg', '1.37 x 0.76 x 1.65 M', '1.25 x 0.68 M', '25 %', '3.2 Km/h',
    '031-334-5296', '230 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-033', 'ES1330L', 13, '배터리, 5.8 M, 적재 227 kg', 'JLG', '배터리', '5.8 M', '3.8 M',
    '900 Kg', '227 kg', '1.8 x 0.6 x 1.4 M', '1.3 x 0.6 M', '° 25 %', '3.8 Km/h',
    '031-334-5296', '112 kg', '115 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-034', '1532R', 15, '배터리, 6.6 M, 적재 270 kg', 'JLG', '배터리', '6.6 M', '4.6 M',
    '1,079 Kg', '270 kg', '1.74 x 0.81 x 1.90 M', '1.74x 0.81 M', '° 14 %', '3 Km/h',
    '031-334-5296', '150 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-035', 'R1532i', 15, '배터리, 6.6 M, 적재 275 kg', 'JLG', '배터리', '6.6 M', '4.6 M',
    '1,085 Kg', '275 kg', '1.74 x 0.81 x 1.90 M', '1.74x 0.81 M', '° 14 %', '3 Km/h',
    '031-334-5296', '155 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-036', '1930ES', 19, '배터리, 7.7 M, 적재 230 kg', 'JLG', '배터리', '7.7 M', '5.7 M',
    '1,230 Kg', '230 kg', '1.87 x 0.76 x 1.99 M', '1.87x 0.76 M', '° 14 %', '4.8 Km/h',
    '031-334-5296', '117 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-037', 'ES2646', 26, '배터리, 9.92 M, 적재 545 kg', 'JLG', '배터리', '9.92 M', '7.92 M',
    '2,401 Kg', '545 kg', '2.28 x 1.17 x 2.4 M', '1.1 x 2.1 M', '% 30 %', '3.2 Km/h',
    '031-334-5296', '425 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-038', '4069LE', 40, '배터리, 14 M, 적재 360 kg', 'JLG', '배터리', '14 M', '12 M',
    '4,790 Kg', '360 kg', '3.15 x 1.75 x 2.84 M', '2.92x 1.65 M', '° 19 %', '4.8 Km/h',
    '031-334-5296', '247 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-039', 'JLG-E600JP', 60, '배터리, 20.1 M, 적재 227 kg', 'JLG', '배터리', '20.1 M', '18.3 M',
    '7,663 Kg', '227 kg', '10.16 x 2.41 x 2.54 M', '1.83 x 0.76 M', '30 %', '3 Km/h',
    '031-334-5296', '227 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-040', 'S0808E', 26, '배터리, 10 M, 적재 230 kg', 'LGMG', '배터리', '10 M', '8 M',
    '2,200 Kg', '230 kg', '2.45 x 0.83 x 2.32 M', '2.26 x 0.81 M', '% 25 %', '변동 Km/h',
    '031-334-5296', '113 kg', '117 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-041', 'S0812E', 26, '배터리, 10 M, 적재 450 kg', 'LGMG', '배터리', '10 M', '8 M',
    '2,300 Kg', '450 kg', '2.49 x 1.18 x 2.36 M', '2.26 x 1.12 M', '% 25 %', '3 Km/h',
    '031-334-5296', '340 kg', '110 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-042', 'S1012E', 32, '배터리, 12.0 M, 적재 320 kg', 'LGMG', '배터리', '12.0 M', '10.0 M',
    '2,600 Kg', '320 kg', 'x 1.18 x 2.49 M', '1.18 x 2.26 M', '% 25 %', '3.5 Km/h',
    '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-043', 'S1212E', 39, '배터리, 14.0 M, 적재 320 kg', 'LGMG', '배터리', '14.0 M', '12.0 M',
    '3,000 Kg', '320 kg', '2.49 x 1.18 x 2.63 M', '1.18 x 2.26 M', '25 %', '3.5 Km/h',
    '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-044', 'S1413E', 45, '배터리, 15.8 M, 적재 320 kg', 'LGMG', '배터리', '15.8 M', '13.8 M',
    '3,500 Kg', '320 kg', '2.8 x 1.3 x 2.74 M', '2.64 x 1.12 M', '25 %', '4.5 Km/h',
    '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-045', 'SR1623E', 53, '배터리, 17.9 M, 적재 680 kg', 'LGMG', '배터리', '17.9 M', '15.9 M',
    '8,200 Kg', '680 kg', '4.9 x 2.3 x 3.23 M', '3.98 x 1.83 M', '% 40 %', '변동 Km/h',
    '031-334-5296', '450 kg', '230 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-046', 'MS10.4', 34, 'AC 110~220V, 11.9 M, 적재 159 kg', 'MANLIFT', 'AC 110~220V', '11.9 M', '10.06 M',
    '389 Kg', '159 kg', '1.46 x 0.74 x 1.97 M', '0.68 x 0.66 M', '-', '-',
    '031-334-5296', '159 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-047', 'MS11.8', 38, 'AC 110~220V, 13.8 M, 적재 136 kg', 'MANLIFT', 'AC 110~220V', '13.8 M', '11.8 M',
    '458 Kg', '136 kg', '1.53 x 0.74 x 1.97 M', '0.68 x 0.66 M', '-', '-',
    '031-334-5296', '136 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-048', 'GTJZ0608ME', 20, '배터리, 7.8 M, 적재 230 kg', 'Sinoboom', '배터리', '7.8 M', '5.8 M',
    '1,575 Kg', '230 kg', '1.80 x 0.81 x 2.04 M', '1.64 x 0.76 M', '25 %', '4 Km/h',
    '031-334-5296', '110 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-049', 'GTJZ1012E', 32, '배터리, 12 M, 적재 320 kg', 'Sinoboom', '배터리', '12 M', '10 M',
    '2,815 Kg', '320 kg', '2.45 x 1.17 x 2.48 M', '2.30 x 1.15 M', '25 %', '4 Km/h',
    '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-050', 'GTJZ0808E', 26, '배터리, 10.1 M, 적재 250 kg', '기연리프트', '배터리', '10.1 M', '8.1 M',
    '2,265 Kg', '250 kg', '2.46 x 0.83 x 2.36 M', '2.30x 0.80 M', '% 25 %', '4 Km/h',
    '031-334-5296', '137 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-051', 'GTJZ0812E', 26, '배터리, 10.1 M, 적재 450 kg', '기연리프트', '배터리', '10.1 M', '8.1 M',
    '2,715 Kg', '450 kg', '2.45 x 1.17 x 2.36 M', '2.30x 1.15 M', '% 25 %', '4 Km/h',
    '031-334-5296', '330 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-052', 'GTJZ1212E', 39, '배터리, 13.9 M, 적재 320 kg', '기연리프트', '배터리', '13.9 M', '11.9 M',
    '3,210 Kg', '320 kg', '2.45 x 1.17 x 2.60 M', '2.30 x 1.15 M', '% 25 %', '4 Km/h',
    '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;
INSERT INTO products (
    id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
    weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
    "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
) VALUES (
    'prod-053', '1414E Plus', 45, '배터리, 15.8 M, 적재 350 kg', '기연리프트', '배터리', '15.8 M', '13.8 M',
    '3,660 Kg', '350 kg', '2.78 x 1.41 x 2.6 M', '2.64 x 1.3 M', '% 25 %', '4 Km/h',
    '031-334-5296', '230 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
)
ON CONFLICT ("modelName") DO UPDATE SET
    feet = EXCLUDED.feet,
    spec = EXCLUDED.spec,
    manufacturer = EXCLUDED.manufacturer,
    "powerSource" = EXCLUDED."powerSource",
    "workingHeight" = EXCLUDED."workingHeight",
    "platformHeight" = EXCLUDED."platformHeight",
    weight = EXCLUDED.weight,
    "capacityPreExt" = EXCLUDED."capacityPreExt",
    "machineDimensions" = EXCLUDED."machineDimensions",
    "platformDimensions" = EXCLUDED."platformDimensions",
    gradeability = EXCLUDED.gradeability,
    speed = EXCLUDED.speed,
    "asContact" = EXCLUDED."asContact",
    "capacityPostExtMain" = EXCLUDED."capacityPostExtMain",
    "capacityPostExtDeck" = EXCLUDED."capacityPostExtDeck",
    "maxWindSpeed" = EXCLUDED."maxWindSpeed",
    "updatedAt" = NOW()::text;

NOTIFY pgrst, 'reload schema';