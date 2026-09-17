-- ==============================================================================
-- [기연리프트 ERP] 전사 4대 운영 테이블 완전 무손실 컬럼 재배치 DDL
-- 파일 위치: scripts/reorganize_tables_zero_loss.sql
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 0. [전 테이블 모든 컬럼 선제 방어] 누락 컬럼 일괄 사전 생성 (IF NOT EXISTS)
-- ------------------------------------------------------------------------------

-- 0-1. assets 컬럼 확보
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "vendorAssetNo" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "serialNo" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "modelName" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "manufactureYear" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "ownerType" TEXT DEFAULT 'OWNED';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS supplier TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "rentStart" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "rentEnd" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "actualRentReturnDate" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "monthlyRentFee" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "dailyRentFee" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "currentCustomerId" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "currentSiteId" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "contractStart" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "contractEnd" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "acquisitionDate" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "acquisitionPrice" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "depreciationMonths" INTEGER;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "residualValueRate" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "accumDepreciation" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "bookValue" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "cumRentalFee" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "cumRepairCost" DOUBLE PRECISION;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'AVAILABLE';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;

-- 0-2. deliveries 컬럼 확보
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "contractId" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "assetIds" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'OUTBOUND';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "dispatchCategory" TEXT DEFAULT '출고';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "transportVendorId" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "transportCompany" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "driverName" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "driverContact" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "vehicleNo" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "vehicleType" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "assignedVehicles" JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "pickupType" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "pickupVendorName" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "originAddress" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "loadingDate" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "loadingTimeSlot" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "loadingTime" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "dropoffType" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "viaDropoffName" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "viaDropoffAddress" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "destinationAddress" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "unloadingDate" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "unloadingTimeSlot" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "unloadingTime" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "expectedCost" DOUBLE PRECISION;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "deliveryCost" DOUBLE PRECISION;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "finalCost" DOUBLE PRECISION;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "deliveryCostConfirmed" DOUBLE PRECISION;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "purchaseBillId" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "isCostSettled" BOOLEAN;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "requestDate" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "rawText" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "closingMemo" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;

-- 0-3. receivables 컬럼 확보
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "contractId" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "vendorName" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "assetNo" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'OTHER';
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "occurredDate" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "internalDescription" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "billedAmount" DOUBLE PRECISION;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "repairId" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE receivables ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;

-- 0-4. repairs 컬럼 확보
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "ticketNo" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "workCategory" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "workLocation" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "stockSource" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "repairType" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "maintenanceType" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "assetId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "assetNo" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "modelName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "contractId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "targetContractStatus" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "siteId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "siteName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "locationDetail" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "reporterName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "reporterContact" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "issueCategory" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "issueDescription" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "errorCode" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "mechanicId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "assignedMechanicId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "mechanicName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "preferredNavApp" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "requestDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "scheduleDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "visitDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "repairDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "completedDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "outboundDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'REQUESTED';
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "resolutionType" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "unresolvedReason" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "nextAction" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "actionTaken" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "partsUsed" JSONB;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "collectedParts" JSONB;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "timelineLogs" JSONB;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "billableType" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "billableAmount" DOUBLE PRECISION;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "billableToCustomer" BOOLEAN;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "totalCost" DOUBLE PRECISION;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "costTotal" DOUBLE PRECISION;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "billingAmount" DOUBLE PRECISION;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "laborHours" DOUBLE PRECISION;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "isCustomerFault" BOOLEAN;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "faultImageUrl" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "evidenceImages" TEXT[];
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "beforeImage" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "afterImage" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "estimateFileUrl" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "customerSignature" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "customerConfirmName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "parentRepairId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "parentTicketId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "revisitRepairId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "revisitTicketId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "revisitDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "revisitReason" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "exchangeSuggested" BOOLEAN;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "inboundNo" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "defectsJson" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "billingId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "purchaseBillId" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;


-- ------------------------------------------------------------------------------
-- 1. assets (자산 마스터) 정돈된 테이블 생성 & 안전 데이터 복제
-- ------------------------------------------------------------------------------
CREATE TABLE assets_new (
    id                    TEXT PRIMARY KEY,
    "assetNo"             TEXT NOT NULL UNIQUE,
    "vendorAssetNo"       TEXT,
    "serialNo"            TEXT,
    "modelName"           TEXT REFERENCES products("modelName") ON UPDATE CASCADE,
    manufacturer          TEXT,
    "manufactureYear"     TEXT,
    "ownerType"           TEXT CHECK ("ownerType" IN ('OWNED', 'RENTED')) NOT NULL,
    "vendorId"            TEXT REFERENCES vendors(id) ON DELETE SET NULL,
    supplier              TEXT,
    "rentStart"           TEXT,
    "rentEnd"             TEXT,
    "actualRentReturnDate" TEXT,
    "monthlyRentFee"      DOUBLE PRECISION DEFAULT 0,
    "dailyRentFee"        DOUBLE PRECISION DEFAULT 0,
    "currentCustomerId"   TEXT REFERENCES customers(id) ON DELETE SET NULL,
    "currentSiteId"       TEXT REFERENCES customer_sites(id) ON DELETE SET NULL,
    "contractStart"       TEXT,
    "contractEnd"         TEXT,
    "acquisitionDate"     TEXT,
    "acquisitionPrice"    DOUBLE PRECISION DEFAULT 0,
    "depreciationMonths"  INTEGER DEFAULT 60,
    "residualValueRate"   DOUBLE PRECISION DEFAULT 0,
    "accumDepreciation"   DOUBLE PRECISION DEFAULT 0,
    "bookValue"           DOUBLE PRECISION DEFAULT 0,
    "cumRentalFee"        DOUBLE PRECISION DEFAULT 0,
    "cumRepairCost"       DOUBLE PRECISION DEFAULT 0,
    status                TEXT CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'RENTED', 'REPAIRING', 'RENTED_RETURNED', 'SOLD')) NOT NULL DEFAULT 'AVAILABLE',
    memo                  TEXT,
    note                  TEXT,
    "createdAt"           TEXT NOT NULL,
    "updatedAt"           TEXT NOT NULL
);

INSERT INTO assets_new (
    id, "assetNo", "vendorAssetNo", "serialNo", "modelName", manufacturer, "manufactureYear", 
    "ownerType", "vendorId", supplier, "rentStart", "rentEnd", "actualRentReturnDate", 
    "monthlyRentFee", "dailyRentFee", "currentCustomerId", "currentSiteId", "contractStart", 
    "contractEnd", "acquisitionDate", "acquisitionPrice", "depreciationMonths", "residualValueRate", 
    "accumDepreciation", "bookValue", "cumRentalFee", "cumRepairCost", status, memo, note, "createdAt", "updatedAt"
)
SELECT 
    id::text,
    "assetNo"::text,
    "vendorAssetNo"::text,
    "serialNo"::text,
    "modelName"::text,
    manufacturer::text,
    "manufactureYear"::text,
    COALESCE("ownerType"::text, 'OWNED'),
    "vendorId"::text,
    supplier::text,
    "rentStart"::text,
    "rentEnd"::text,
    "actualRentReturnDate"::text,
    COALESCE(NULLIF(regexp_replace("monthlyRentFee"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("dailyRentFee"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    "currentCustomerId"::text,
    "currentSiteId"::text,
    "contractStart"::text,
    "contractEnd"::text,
    "acquisitionDate"::text,
    COALESCE(NULLIF(regexp_replace("acquisitionPrice"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("depreciationMonths"::text, '[^0-9.-]', '', 'g'), '')::integer, 60),
    COALESCE(NULLIF(regexp_replace("residualValueRate"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("accumDepreciation"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("bookValue"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("cumRentalFee"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("cumRepairCost"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(status::text, 'AVAILABLE'),
    memo::text,
    note::text,
    COALESCE("createdAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    COALESCE("updatedAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
FROM assets;


-- ------------------------------------------------------------------------------
-- 2. deliveries (배차 대장) 정돈된 테이블 생성 & 안전 데이터 복제
-- ------------------------------------------------------------------------------
CREATE TABLE deliveries_new (
    id                    TEXT PRIMARY KEY,
    "contractId"          TEXT REFERENCES contracts(id) ON DELETE SET NULL,
    "assetIds"            TEXT,
    type                  TEXT CHECK (type IN ('OUTBOUND', 'INBOUND', 'EXCHANGE', 'MOVEMENT', 'RETURN')) NOT NULL,
    "dispatchCategory"    TEXT CHECK ("dispatchCategory" IN ('출고', '입고', '반납', '정비', '이동', '교환')) DEFAULT '출고',
    "transportVendorId"   TEXT REFERENCES vendors(id) ON DELETE SET NULL,
    "transportCompany"    TEXT,
    "driverName"          TEXT,
    "driverContact"       TEXT,
    "vehicleNo"           TEXT,
    "vehicleType"         TEXT,
    "assignedVehicles"    JSONB DEFAULT '[]'::jsonb,
    "pickupType"          TEXT CHECK ("pickupType" IN ('HQ_YARD', 'VENDOR_YARD', 'CUSTOMER_SITE', 'YARD', 'VENDOR')) DEFAULT 'HQ_YARD',
    "pickupVendorName"    TEXT,
    "originAddress"       TEXT,
    "loadingDate"         TEXT,
    "loadingTimeSlot"     TEXT DEFAULT '오전',
    "loadingTime"         TEXT,
    "dropoffType"         TEXT CHECK ("dropoffType" IN ('SINGLE', 'MULTI_STOP')) DEFAULT 'SINGLE',
    "viaDropoffName"      TEXT,
    "viaDropoffAddress"   TEXT,
    "destinationAddress"  TEXT,
    "unloadingDate"       TEXT,
    "unloadingTimeSlot"   TEXT DEFAULT '오전',
    "unloadingTime"       TEXT,
    "expectedCost"        DOUBLE PRECISION DEFAULT 0,
    "deliveryCost"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalCost"           DOUBLE PRECISION DEFAULT 0,
    "deliveryCostConfirmed" DOUBLE PRECISION DEFAULT 0,
    "purchaseBillId"      TEXT,
    "isCostSettled"       BOOLEAN DEFAULT FALSE,
    status                TEXT CHECK (status IN ('PENDING', 'REQUESTED', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED')) NOT NULL DEFAULT 'PENDING',
    "requestDate"         TEXT NOT NULL,
    "rawText"             TEXT,
    memo                  TEXT,
    "closingMemo"         TEXT,
    "createdAt"           TEXT NOT NULL,
    "updatedAt"           TEXT NOT NULL
);

INSERT INTO deliveries_new (
    id, "contractId", "assetIds", type, "dispatchCategory", "transportVendorId", "transportCompany",
    "driverName", "driverContact", "vehicleNo", "vehicleType", "assignedVehicles",
    "pickupType", "pickupVendorName", "originAddress", "loadingDate", "loadingTimeSlot", "loadingTime",
    "dropoffType", "viaDropoffName", "viaDropoffAddress", "destinationAddress", "unloadingDate", "unloadingTimeSlot", "unloadingTime",
    "expectedCost", "deliveryCost", "finalCost", "deliveryCostConfirmed", "purchaseBillId", "isCostSettled",
    status, "requestDate", "rawText", memo, "closingMemo", "createdAt", "updatedAt"
)
SELECT 
    id::text,
    "contractId"::text,
    "assetIds"::text,
    COALESCE(type::text, 'OUTBOUND'),
    COALESCE("dispatchCategory"::text, '출고'),
    "transportVendorId"::text,
    "transportCompany"::text,
    "driverName"::text,
    "driverContact"::text,
    "vehicleNo"::text,
    "vehicleType"::text,
    CASE 
        WHEN "assignedVehicles" IS NULL OR "assignedVehicles"::text = '' THEN '[]'::jsonb 
        ELSE "assignedVehicles"::text::jsonb 
    END,
    COALESCE("pickupType"::text, 'HQ_YARD'),
    "pickupVendorName"::text,
    "originAddress"::text,
    "loadingDate"::text,
    COALESCE("loadingTimeSlot"::text, '오전'),
    "loadingTime"::text,
    COALESCE("dropoffType"::text, 'SINGLE'),
    "viaDropoffName"::text,
    "viaDropoffAddress"::text,
    "destinationAddress"::text,
    "unloadingDate"::text,
    COALESCE("unloadingTimeSlot"::text, '오전'),
    "unloadingTime"::text,
    COALESCE(NULLIF(regexp_replace("expectedCost"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("deliveryCost"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("finalCost"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("deliveryCostConfirmed"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    "purchaseBillId"::text,
    COALESCE(NULLIF("isCostSettled"::text, '')::boolean, FALSE),
    COALESCE(status::text, 'PENDING'),
    COALESCE("requestDate"::text, TO_CHAR(NOW(), 'YYYY-MM-DD')),
    "rawText"::text,
    memo::text,
    "closingMemo"::text,
    COALESCE("createdAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    COALESCE("updatedAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
FROM deliveries;


-- ------------------------------------------------------------------------------
-- 3. receivables (외상미수금 대장) 정돈된 테이블 생성 & 안전 데이터 복제
-- ------------------------------------------------------------------------------
CREATE TABLE receivables_new (
    id                    TEXT PRIMARY KEY,
    "contractId"          TEXT REFERENCES contracts(id) ON DELETE SET NULL,
    "customerId"          TEXT REFERENCES customers(id) ON DELETE SET NULL,
    "vendorName"          TEXT,
    "assetNo"             TEXT,
    type                  TEXT CHECK (type IN ('TRANSPORT', 'REPAIR', 'CLEANING', 'OTHER', 'VENDOR_CLAIM')) NOT NULL,
    "occurredDate"        TEXT NOT NULL,
    "internalDescription" TEXT NOT NULL,
    "displayName"         TEXT,
    "totalAmount"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billedAmount"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    status                TEXT CHECK (status IN ('PENDING', 'PARTIAL', 'CLEARED')) NOT NULL DEFAULT 'PENDING',
    "repairId"            TEXT REFERENCES repairs(id) ON DELETE SET NULL,
    CONSTRAINT chk_billed_lte_total CHECK ("billedAmount" <= "totalAmount"),
    "createdAt"           TEXT NOT NULL,
    "updatedAt"           TEXT NOT NULL
);

INSERT INTO receivables_new (
    id, "contractId", "customerId", "vendorName", "assetNo", type, "occurredDate",
    "internalDescription", "displayName", "totalAmount", "billedAmount", status, "repairId", "createdAt", "updatedAt"
)
SELECT 
    id::text,
    "contractId"::text,
    "customerId"::text,
    "vendorName"::text,
    "assetNo"::text,
    COALESCE(type::text, 'OTHER'),
    COALESCE("occurredDate"::text, TO_CHAR(NOW(), 'YYYY-MM-DD')),
    COALESCE("internalDescription"::text, '미수 항목'),
    "displayName"::text,
    COALESCE(NULLIF(regexp_replace("totalAmount"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("billedAmount"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(status::text, 'PENDING'),
    "repairId"::text,
    COALESCE("createdAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    COALESCE("updatedAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
FROM receivables;


-- ------------------------------------------------------------------------------
-- 4. repairs (정비 및 현장 AS 대장) 정돈된 테이블 생성 & 안전 데이터 복제
-- ------------------------------------------------------------------------------
CREATE TABLE repairs_new (
    id                    TEXT PRIMARY KEY,
    "ticketNo"            TEXT,
    "workCategory"        TEXT DEFAULT 'FIELD_AS',
    "workLocation"        TEXT DEFAULT 'SITE',
    "stockSource"         TEXT DEFAULT 'VEHICLE_VAN',
    source                TEXT DEFAULT 'DIRECT_INTAKE',
    "repairType"          TEXT NOT NULL DEFAULT 'INTERNAL',
    "maintenanceType"     TEXT,
    priority              TEXT DEFAULT 'NORMAL',
    "assetId"             TEXT REFERENCES assets(id) ON DELETE SET NULL,
    "assetNo"             TEXT,
    "modelName"           TEXT,
    "contractId"          TEXT REFERENCES contracts(id) ON DELETE SET NULL,
    "targetContractStatus" TEXT,
    "customerId"          TEXT REFERENCES customers(id) ON DELETE SET NULL,
    "customerName"        TEXT,
    "siteId"              TEXT REFERENCES customer_sites(id) ON DELETE SET NULL,
    "siteName"            TEXT,
    "locationDetail"      TEXT,
    "reporterName"        TEXT,
    "reporterContact"     TEXT,
    "issueCategory"       TEXT,
    "issueDescription"    TEXT,
    details               TEXT,
    "errorCode"           TEXT,
    "mechanicId"          TEXT REFERENCES users(id) ON DELETE SET NULL,
    "assignedMechanicId"  TEXT,
    "mechanicName"        TEXT,
    "vendorId"            TEXT REFERENCES vendors(id) ON DELETE SET NULL,
    "preferredNavApp"     TEXT DEFAULT 'TMAP',
    "requestDate"         TEXT NOT NULL,
    "scheduleDate"        TEXT,
    "visitDate"           TEXT,
    "repairDate"          TEXT,
    "completedDate"       TEXT,
    "outboundDate"        TEXT,
    status                TEXT NOT NULL DEFAULT 'REQUESTED',
    "resolutionType"      TEXT,
    "unresolvedReason"    TEXT,
    "nextAction"          TEXT,
    "actionTaken"         TEXT,
    "partsUsed"           JSONB DEFAULT '[]'::jsonb,
    "collectedParts"      JSONB DEFAULT '[]'::jsonb,
    "timelineLogs"        JSONB DEFAULT '[]'::jsonb,
    "billableType"        TEXT DEFAULT 'FREE',
    "billableAmount"      DOUBLE PRECISION DEFAULT 0,
    "billableToCustomer"  BOOLEAN NOT NULL DEFAULT FALSE,
    "totalCost"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costTotal"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingAmount"       DOUBLE PRECISION,
    "laborHours"          DOUBLE PRECISION,
    "isCustomerFault"     BOOLEAN NOT NULL DEFAULT FALSE,
    "faultImageUrl"       TEXT,
    "evidenceImages"      TEXT[],
    "beforeImage"         TEXT,
    "afterImage"          TEXT,
    "estimateFileUrl"     TEXT,
    "customerSignature"   TEXT,
    "customerConfirmName" TEXT,
    "parentRepairId"      TEXT,
    "parentTicketId"      TEXT,
    "revisitRepairId"     TEXT,
    "revisitTicketId"     TEXT,
    "revisitDate"         TEXT,
    "revisitReason"       TEXT,
    "exchangeSuggested"   BOOLEAN DEFAULT FALSE,
    "inboundNo"           TEXT,
    "defectsJson"         TEXT,
    "billingId"           TEXT,
    "purchaseBillId"      TEXT,
    memo                  TEXT,
    "createdAt"           TEXT NOT NULL,
    "updatedAt"           TEXT NOT NULL
);

INSERT INTO repairs_new (
    id, "ticketNo", "workCategory", "workLocation", "stockSource", source, "repairType", "maintenanceType", priority,
    "assetId", "assetNo", "modelName", "contractId", "targetContractStatus", "customerId", "customerName", "siteId", "siteName", "locationDetail",
    "reporterName", "reporterContact", "issueCategory", "issueDescription", details, "errorCode",
    "mechanicId", "assignedMechanicId", "mechanicName", "vendorId", "preferredNavApp",
    "requestDate", "scheduleDate", "visitDate", "repairDate", "completedDate", "outboundDate", status,
    "resolutionType", "unresolvedReason", "nextAction", "actionTaken", "partsUsed", "collectedParts", "timelineLogs",
    "billableType", "billableAmount", "billableToCustomer", "totalCost", "costTotal", "billingAmount", "laborHours", "isCustomerFault",
    "faultImageUrl", "evidenceImages", "beforeImage", "afterImage", "estimateFileUrl", "customerSignature", "customerConfirmName",
    "parentRepairId", "parentTicketId", "revisitRepairId", "revisitTicketId", "revisitDate", "revisitReason", "exchangeSuggested",
    "inboundNo", "defectsJson", "billingId", "purchaseBillId", memo, "createdAt", "updatedAt"
)
SELECT 
    id::text,
    "ticketNo"::text,
    COALESCE("workCategory"::text, 'FIELD_AS'),
    COALESCE("workLocation"::text, 'SITE'),
    COALESCE("stockSource"::text, 'VEHICLE_VAN'),
    COALESCE(source::text, 'DIRECT_INTAKE'),
    COALESCE("repairType"::text, 'INTERNAL'),
    "maintenanceType"::text,
    COALESCE(priority::text, 'NORMAL'),
    "assetId"::text,
    "assetNo"::text,
    "modelName"::text,
    "contractId"::text,
    "targetContractStatus"::text,
    "customerId"::text,
    "customerName"::text,
    "siteId"::text,
    "siteName"::text,
    "locationDetail"::text,
    "reporterName"::text,
    "reporterContact"::text,
    "issueCategory"::text,
    "issueDescription"::text,
    details::text,
    "errorCode"::text,
    "mechanicId"::text,
    "assignedMechanicId"::text,
    "mechanicName"::text,
    "vendorId"::text,
    COALESCE("preferredNavApp"::text, 'TMAP'),
    COALESCE("requestDate"::text, TO_CHAR(NOW(), 'YYYY-MM-DD')),
    "scheduleDate"::text,
    "visitDate"::text,
    "repairDate"::text,
    "completedDate"::text,
    "outboundDate"::text,
    COALESCE(status::text, 'REQUESTED'),
    "resolutionType"::text,
    "unresolvedReason"::text,
    "nextAction"::text,
    "actionTaken"::text,
    CASE WHEN "partsUsed" IS NULL OR "partsUsed"::text = '' THEN '[]'::jsonb ELSE "partsUsed"::text::jsonb END,
    CASE WHEN "collectedParts" IS NULL OR "collectedParts"::text = '' THEN '[]'::jsonb ELSE "collectedParts"::text::jsonb END,
    CASE WHEN "timelineLogs" IS NULL OR "timelineLogs"::text = '' THEN '[]'::jsonb ELSE "timelineLogs"::text::jsonb END,
    COALESCE("billableType"::text, 'FREE'),
    COALESCE(NULLIF(regexp_replace("billableAmount"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF("billableToCustomer"::text, '')::boolean, FALSE),
    COALESCE(NULLIF(regexp_replace("totalCost"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    COALESCE(NULLIF(regexp_replace("costTotal"::text, '[^0-9.-]', '', 'g'), '')::double precision, 0),
    NULLIF(regexp_replace("billingAmount"::text, '[^0-9.-]', '', 'g'), '')::double precision,
    NULLIF(regexp_replace("laborHours"::text, '[^0-9.-]', '', 'g'), '')::double precision,
    COALESCE(NULLIF("isCustomerFault"::text, '')::boolean, FALSE),
    "faultImageUrl"::text,
    "evidenceImages",
    "beforeImage"::text,
    "afterImage"::text,
    "estimateFileUrl"::text,
    "customerSignature"::text,
    "customerConfirmName"::text,
    "parentRepairId"::text,
    "parentTicketId"::text,
    "revisitRepairId"::text,
    "revisitTicketId"::text,
    "revisitDate"::text,
    "revisitReason"::text,
    COALESCE(NULLIF("exchangeSuggested"::text, '')::boolean, FALSE),
    "inboundNo"::text,
    "defectsJson"::text,
    "billingId"::text,
    "purchaseBillId"::text,
    memo::text,
    COALESCE("createdAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    COALESCE("updatedAt"::text, TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
FROM repairs;


-- ------------------------------------------------------------------------------
-- 5. 원자적 테이블 교체 (Atomic Swap)
-- ------------------------------------------------------------------------------
DROP TABLE assets CASCADE;
ALTER TABLE assets_new RENAME TO assets;

DROP TABLE deliveries CASCADE;
ALTER TABLE deliveries_new RENAME TO deliveries;

DROP TABLE receivables CASCADE;
ALTER TABLE receivables_new RENAME TO receivables;

DROP TABLE repairs CASCADE;
ALTER TABLE repairs_new RENAME TO repairs;


-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) 및 접근 정책 일괄 재연결
-- ------------------------------------------------------------------------------
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anon_all" ON assets;
DROP POLICY IF EXISTS "allow_auth_all" ON assets;
CREATE POLICY "allow_anon_all" ON assets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all" ON assets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_all" ON deliveries;
DROP POLICY IF EXISTS "allow_auth_all" ON deliveries;
CREATE POLICY "allow_anon_all" ON deliveries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all" ON deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_all" ON receivables;
DROP POLICY IF EXISTS "allow_auth_all" ON receivables;
CREATE POLICY "allow_anon_all" ON receivables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all" ON receivables FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_all" ON repairs;
DROP POLICY IF EXISTS "allow_auth_all" ON repairs;
CREATE POLICY "allow_anon_all" ON repairs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all" ON repairs FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
