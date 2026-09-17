var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/migrate_run.ts
var import_fs = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);

// src/services/db.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseUrl = "https://wywgkikkjgbnlljkkmnz.supabase.co";
var supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU";
var supabase = supabaseUrl && supabaseAnonKey ? (0, import_supabase_js.createClient)(supabaseUrl, supabaseAnonKey) : null;
function normalizeCustomerName(name) {
  if (!name) return "";
  return String(name).replace(/주식회사|\(주\)|\(주\)|㈜|\(유\)|유한회사|\(합\)|합자회사|사단법인|재단법인/gi, "").replace(/[\s\(\)\[\]._\-]/g, "").toLowerCase();
}
function calculateAssetDepreciation(asset, asOfDate = /* @__PURE__ */ new Date()) {
  const cost = asset.acquisitionPrice || 0;
  if (cost <= 0 || !asset.acquisitionDate || !asset.depreciationMonths || asset.depreciationMonths <= 0) {
    return {
      accumDepreciation: asset.accumDepreciation || 0,
      bookValue: asset.bookValue ?? cost,
      elapsedMonths: 0,
      monthlyDepreciation: 0
    };
  }
  const residualRate = asset.residualValueRate ?? 0;
  const residualValue = Math.round(cost * (residualRate / 100));
  const depreciableAmount = cost - residualValue;
  const monthlyDepn = depreciableAmount / asset.depreciationMonths;
  let targetDate = asOfDate;
  if (asset.status === "SOLD" && asset.disposalDate) {
    const parsedDisposal = new Date(asset.disposalDate);
    if (!isNaN(parsedDisposal.getTime())) {
      targetDate = parsedDisposal;
    }
  }
  const acqDate = new Date(asset.acquisitionDate);
  if (isNaN(acqDate.getTime())) {
    return {
      accumDepreciation: asset.accumDepreciation || 0,
      bookValue: asset.bookValue ?? cost,
      elapsedMonths: 0,
      monthlyDepreciation: 0
    };
  }
  let yearsDiff = targetDate.getFullYear() - acqDate.getFullYear();
  let monthsDiff = targetDate.getMonth() - acqDate.getMonth();
  let totalElapsed = yearsDiff * 12 + monthsDiff;
  if (targetDate.getDate() < acqDate.getDate() && totalElapsed > 0) {
    totalElapsed -= 1;
  }
  if (totalElapsed < 0) totalElapsed = 0;
  const effectiveElapsed = Math.min(totalElapsed, asset.depreciationMonths);
  const accumDepn = Math.min(cost - residualValue, Math.round(monthlyDepn * effectiveElapsed));
  const bookVal = Math.max(residualValue, cost - accumDepn);
  return {
    accumDepreciation: accumDepn,
    bookValue: bookVal,
    elapsedMonths: effectiveElapsed,
    monthlyDepreciation: Math.round(monthlyDepn)
  };
}
var generateMockProducts = () => {
  return [
    {
      "id": "prod-001",
      "modelName": "JCPT0607DCS",
      "feet": 20,
      "spec": "\uBC30\uD130\uB9AC, 5.6 M, \uC801\uC7AC 240 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "5.6 M",
      "platformHeight": "3.6 M",
      "weight": "880 Kg",
      "capacityPreExt": "240 kg",
      "machineDimensions": "1.44x 0.76 x 1.90 M",
      "platformDimensions": "1.29x 0.70 M",
      "gradeability": "\xB0 15 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "140 kg",
      "capacityPostExtDeck": "100 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-002",
      "modelName": "JCPT0807AC",
      "feet": 20,
      "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 230 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "7.8 M",
      "platformHeight": "6 M",
      "weight": "1,630 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "1.86 x 0.76 x 2.02 M",
      "platformDimensions": "1.67 x 0.74 M",
      "gradeability": "25 %",
      "speed": "4.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "117 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-003",
      "modelName": "JCPT1008AC",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 230 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "2,230 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "2.48 x 0.83 x 2.36 M",
      "platformDimensions": "2.27 x 0.81 M",
      "gradeability": "% 25 %",
      "speed": "5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "117 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-004",
      "modelName": "JCPT1012AC",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 10.0 M, \uC801\uC7AC 450 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10.0 M",
      "platformHeight": "8.0 M",
      "weight": "2,710 Kg",
      "capacityPreExt": "450 kg",
      "machineDimensions": "2.48 x 1.15 x 2.36 M",
      "platformDimensions": "1.15 x 2.27 M",
      "gradeability": "% 25 %",
      "speed": "5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "337 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-005",
      "modelName": "S1008AC+",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 272 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "2,230 Kg",
      "capacityPreExt": "272 kg",
      "machineDimensions": "2.48 x 0.83 x 2.36 M",
      "platformDimensions": "2.27 x 0.81 M",
      "gradeability": "% 25 %",
      "speed": "6 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "159 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-006",
      "modelName": "S1012AC+",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 450 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "2,750 Kg",
      "capacityPreExt": "450 kg",
      "machineDimensions": "2.48 x 1.15 x 2.36 M",
      "platformDimensions": "2.27 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "337 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-007",
      "modelName": "JCPT1212AC",
      "feet": 39,
      "spec": "\uBC30\uD130\uB9AC, 12.0 M, \uC801\uC7AC 320 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "12.0 M",
      "platformHeight": "10.0 M",
      "weight": "3,060 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "2.48 x 1.15 x 2.49 M",
      "platformDimensions": "2.27 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "207 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-008",
      "modelName": "S1212AC+",
      "feet": 39,
      "spec": "\uBC30\uD130\uB9AC, 12 M, \uC801\uC7AC 408 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "12 M",
      "platformHeight": "10 M",
      "weight": "3,060 Kg",
      "capacityPreExt": "408 kg",
      "machineDimensions": "2.48 x 1.15 x 2.49 M",
      "platformDimensions": "2.27 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "295 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-009",
      "modelName": "JCPT1412AC",
      "feet": 45,
      "spec": "\uBC30\uD130\uB9AC, 13.8 M, \uC801\uC7AC 320 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "13.8 M",
      "platformHeight": "11.8 M",
      "weight": "2,990 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "2.84 x 1.19 x 2.62 M",
      "platformDimensions": "2.48 x 2.62 M",
      "gradeability": "% 25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "207 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-010",
      "modelName": "S1412AC+",
      "feet": 45,
      "spec": "\uBC30\uD130\uB9AC, 13.8 M, \uC801\uC7AC 408 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "13.8 M",
      "platformHeight": "11.8 M",
      "weight": "3,250 Kg",
      "capacityPreExt": "408 kg",
      "machineDimensions": "M",
      "platformDimensions": "2.27 x 1.12 M",
      "gradeability": "25 %",
      "speed": "6.0 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "295 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-011",
      "modelName": "JCPT1614ACZ",
      "feet": 53,
      "spec": "\uBC30\uD130\uB9AC, 15.7 M, \uC801\uC7AC 350 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.7 M",
      "platformHeight": "13.7 M",
      "weight": "3,470 Kg",
      "capacityPreExt": "350 kg",
      "machineDimensions": "2.84 x 1.39 x 2.62 M",
      "platformDimensions": "2.64 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "237 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "16.0 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-012",
      "modelName": "S1612AC+",
      "feet": 53,
      "spec": "\uBC30\uD130\uB9AC, 15.7 M, \uC801\uC7AC 363 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.7 M",
      "platformHeight": "13.7 M",
      "weight": "3,520 Kg",
      "capacityPreExt": "363 kg",
      "machineDimensions": "2.84 x 1.25 x 2.62 M",
      "platformDimensions": "2.64 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "6 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "227 kg",
      "capacityPostExtDeck": "136 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-013",
      "modelName": "S1614AC+",
      "feet": 53,
      "spec": "\uBC30\uD130\uB9AC, 15.7 M, \uC801\uC7AC 363 kg",
      "manufacturer": "DINGLI",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.7 M",
      "platformHeight": "13.7 M",
      "weight": "3,500 Kg",
      "capacityPreExt": "363 kg",
      "machineDimensions": "2.84 x 1.39 x 2.62 M",
      "platformDimensions": "2.64 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "5.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "250 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-014",
      "modelName": "GS-1330m",
      "feet": 13,
      "spec": "\uBC30\uD130\uB9AC, 5.7 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "5.7 M",
      "platformHeight": "3.9 M",
      "weight": "902 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "1.41 x 0.78 x 1.83 M",
      "platformDimensions": "1.26 x 0.67 M",
      "gradeability": "25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "136 kg",
      "capacityPostExtDeck": "91 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-015",
      "modelName": "GS-1432",
      "feet": 14,
      "spec": "\uBC30\uD130\uB9AC, 6.3 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "6.3 M",
      "platformHeight": "4.3 M",
      "weight": "900 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "1.40 x 0.81 x 1.88 M",
      "platformDimensions": "1.40 x 0.78 M",
      "gradeability": "25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "114 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-016",
      "modelName": "GS-1930",
      "feet": 19,
      "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "7.8 M",
      "platformHeight": "5.8 M",
      "weight": "1226 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "1.83 x 0.77 x 2.16 M",
      "platformDimensions": "1.64 x 0.76 M",
      "gradeability": "25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "114 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-017",
      "modelName": "GS-1930 E",
      "feet": 19,
      "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "7.8 M",
      "platformHeight": "5.8 M",
      "weight": "1,498 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "1.83 x 0.76 x 2.10 M",
      "platformDimensions": "1.63 x 0.76 M",
      "gradeability": "% 25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "114 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-018",
      "modelName": "GS-2632",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 9.9 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "9.9 M",
      "platformHeight": "7.9 M",
      "weight": "2,003 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "2.44 x 0.81 x 2.26 M",
      "platformDimensions": "2.26 x 0.84 M",
      "gradeability": "25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "114 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-019",
      "modelName": "GS-2632 E",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "2,145 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "2.44 x 0.82 x 2.31 M",
      "platformDimensions": "2.26 x 0.84 M",
      "gradeability": "% 25 %",
      "speed": "3.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "114 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-020",
      "modelName": "GS-2646",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 9.92 M, \uC801\uC7AC 454 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "9.92 M",
      "platformHeight": "7.92 M",
      "weight": "1,956 Kg",
      "capacityPreExt": "454 kg",
      "machineDimensions": "2.44 x 1.18 x 2.31 M",
      "platformDimensions": "2.26 x 1.18 M",
      "gradeability": "25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "341 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-021",
      "modelName": "GS-2646 E",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 454 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "1,997 Kg",
      "capacityPreExt": "454 kg",
      "machineDimensions": "2.44 x 1.17 x 2.26 M",
      "platformDimensions": "2.26 x 1.15 M",
      "gradeability": "% 25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "341 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-022",
      "modelName": "GS-3246",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 11.8 M, \uC801\uC7AC 205 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "11.8 M",
      "platformHeight": "9.8 M",
      "weight": "2367 Kg",
      "capacityPreExt": "205 kg",
      "machineDimensions": "2.44 x 1.18 x 2.44 M",
      "platformDimensions": "2.26 x 1.18 M",
      "gradeability": "25 %",
      "speed": "3.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "113 kg",
      "capacityPostExtDeck": "",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-023",
      "modelName": "GS-3246 E",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 11.7 M, \uC801\uC7AC 318 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "11.7 M",
      "platformHeight": "9.7 M",
      "weight": "2,374 Kg",
      "capacityPreExt": "318 kg",
      "machineDimensions": "2.44 x 1.17 x 2.39 M",
      "platformDimensions": "2.26 x 1.16 M",
      "gradeability": "% 25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "205 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-024",
      "modelName": "GS-4046",
      "feet": 40,
      "spec": "\uBC30\uD130\uB9AC, 13.7 M, \uC801\uC7AC 350 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "13.7 M",
      "platformHeight": "11.9 M",
      "weight": "3,184 Kg",
      "capacityPreExt": "350 kg",
      "machineDimensions": "2.48 x 1.17 x 2.57 M",
      "platformDimensions": "2.26 x 1.16 M",
      "gradeability": "25 %",
      "speed": "3.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "237 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-025",
      "modelName": "GS-4047",
      "feet": 40,
      "spec": "\uBC30\uD130\uB9AC, 13.7 M, \uC801\uC7AC 350 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "13.7 M",
      "platformHeight": "11.7 M",
      "weight": "3,260 Kg",
      "capacityPreExt": "350 kg",
      "machineDimensions": "2.48 x 1.19 x 2.54 M",
      "platformDimensions": "2.26 x 1.16 M",
      "gradeability": "% 25 %",
      "speed": "3.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "237 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-026",
      "modelName": "GS-4069DC",
      "feet": 40,
      "spec": "\uBC30\uD130\uB9AC, 14.3 M, \uC801\uC7AC 363 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "14.3 M",
      "platformHeight": "12.3 M",
      "weight": "4,933 Kg",
      "capacityPreExt": "363 kg",
      "machineDimensions": "3.12 x 1.6 x 2.74 M",
      "platformDimensions": "2.79 x 1.6 M",
      "gradeability": "19 \xB0 %",
      "speed": "7.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "250 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-027",
      "modelName": "Z-45/25J",
      "feet": 45,
      "spec": "\uBC30\uD130\uB9AC, 15.9 M, \uC801\uC7AC 227 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.9 M",
      "platformHeight": "13.9 M",
      "weight": "7,400 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "6.83 x 1.79 x 2.0 M",
      "platformDimensions": "1.83 x 0.76 M",
      "gradeability": "30 %",
      "speed": "4.8 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "227 kg",
      "capacityPostExtDeck": "-",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-028",
      "modelName": "GS-4655",
      "feet": 46,
      "spec": "\uBC30\uD130\uB9AC, 15.95 M, \uC801\uC7AC 349 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.95 M",
      "platformHeight": "13.95 M",
      "weight": "3,701 Kg",
      "capacityPreExt": "349 kg",
      "machineDimensions": "3.11 x 1.41 x 2.77 M",
      "platformDimensions": "2.84 x 1.35 M",
      "gradeability": "% 25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "213 kg",
      "capacityPostExtDeck": "136 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-029",
      "modelName": "GS-5390RT",
      "feet": 53,
      "spec": "\uB514\uC824, 18 M, \uC801\uC7AC 680 kg",
      "manufacturer": "GENIE",
      "powerSource": "\uB514\uC824",
      "workingHeight": "18 M",
      "platformHeight": "16.15 M",
      "weight": "7,537 Kg",
      "capacityPreExt": "680 kg",
      "machineDimensions": "4.88 x 2.29 x 3.15 M",
      "platformDimensions": "3.98 x 1.83 M",
      "gradeability": "12 %",
      "speed": "8 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "460 kg",
      "capacityPostExtDeck": "110 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-030",
      "modelName": "STAR-6",
      "feet": 15,
      "spec": "\uBC30\uD130\uB9AC, 5.8 M, \uC801\uC7AC 230 kg",
      "manufacturer": "HAULOTTE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "5.8 M",
      "platformHeight": "3.8 M",
      "weight": "880 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "1.4 x 0.79 x 1.75 M",
      "platformDimensions": "1.38 x 0.77 M",
      "gradeability": "% 25 %",
      "speed": "4.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "110 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-031",
      "modelName": "OPTIMUM 8",
      "feet": 20,
      "spec": "\uBC30\uD130\uB9AC, 7.77 M, \uC801\uC7AC 230 kg",
      "manufacturer": "HAULOTTE",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "7.77 M",
      "platformHeight": "5.77 M",
      "weight": "1,590 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "1.9 x 0.79 x 1.88 M",
      "platformDimensions": "2.59 x 0.74 M",
      "gradeability": "25 %",
      "speed": "4.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "120 kg",
      "capacityPostExtDeck": "110 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-032",
      "modelName": "1230ES",
      "feet": 12,
      "spec": "\uBC30\uD130\uB9AC, 5.7 M, \uC801\uC7AC 230 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "5.7 M",
      "platformHeight": "3.7 M",
      "weight": "790 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "1.37 x 0.76 x 1.65 M",
      "platformDimensions": "1.25 x 0.68 M",
      "gradeability": "25 %",
      "speed": "3.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "230 kg",
      "capacityPostExtDeck": "-",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-033",
      "modelName": "ES1330L",
      "feet": 13,
      "spec": "\uBC30\uD130\uB9AC, 5.8 M, \uC801\uC7AC 227 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "5.8 M",
      "platformHeight": "3.8 M",
      "weight": "900 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "1.8 x 0.6 x 1.4 M",
      "platformDimensions": "1.3 x 0.6 M",
      "gradeability": "\xB0 25 %",
      "speed": "3.8 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "112 kg",
      "capacityPostExtDeck": "115 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-034",
      "modelName": "1532R",
      "feet": 15,
      "spec": "\uBC30\uD130\uB9AC, 6.6 M, \uC801\uC7AC 270 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "6.6 M",
      "platformHeight": "4.6 M",
      "weight": "1,079 Kg",
      "capacityPreExt": "270 kg",
      "machineDimensions": "1.74 x 0.81 x 1.90 M",
      "platformDimensions": "1.74x 0.81 M",
      "gradeability": "\xB0 14 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "150 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-035",
      "modelName": "R1532i",
      "feet": 15,
      "spec": "\uBC30\uD130\uB9AC, 6.6 M, \uC801\uC7AC 275 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "6.6 M",
      "platformHeight": "4.6 M",
      "weight": "1,085 Kg",
      "capacityPreExt": "275 kg",
      "machineDimensions": "1.74 x 0.81 x 1.90 M",
      "platformDimensions": "1.74x 0.81 M",
      "gradeability": "\xB0 14 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "155 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-036",
      "modelName": "1930ES",
      "feet": 19,
      "spec": "\uBC30\uD130\uB9AC, 7.7 M, \uC801\uC7AC 230 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "7.7 M",
      "platformHeight": "5.7 M",
      "weight": "1,230 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "1.87 x 0.76 x 1.99 M",
      "platformDimensions": "1.87x 0.76 M",
      "gradeability": "\xB0 14 %",
      "speed": "4.8 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "117 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-037",
      "modelName": "ES2646",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 9.92 M, \uC801\uC7AC 545 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "9.92 M",
      "platformHeight": "7.92 M",
      "weight": "2,401 Kg",
      "capacityPreExt": "545 kg",
      "machineDimensions": "2.28 x 1.17 x 2.4 M",
      "platformDimensions": "1.1 x 2.1 M",
      "gradeability": "% 30 %",
      "speed": "3.2 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "425 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-038",
      "modelName": "4069LE",
      "feet": 40,
      "spec": "\uBC30\uD130\uB9AC, 14 M, \uC801\uC7AC 360 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "14 M",
      "platformHeight": "12 M",
      "weight": "4,790 Kg",
      "capacityPreExt": "360 kg",
      "machineDimensions": "3.15 x 1.75 x 2.84 M",
      "platformDimensions": "2.92x 1.65 M",
      "gradeability": "\xB0 19 %",
      "speed": "4.8 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "247 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-039",
      "modelName": "JLG-E600JP",
      "feet": 60,
      "spec": "\uBC30\uD130\uB9AC, 20.1 M, \uC801\uC7AC 227 kg",
      "manufacturer": "JLG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "20.1 M",
      "platformHeight": "18.3 M",
      "weight": "7,663 Kg",
      "capacityPreExt": "227 kg",
      "machineDimensions": "10.16 x 2.41 x 2.54 M",
      "platformDimensions": "1.83 x 0.76 M",
      "gradeability": "30 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "227 kg",
      "capacityPostExtDeck": "-",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-040",
      "modelName": "S0808E",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 230 kg",
      "manufacturer": "LGMG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "2,200 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "2.45 x 0.83 x 2.32 M",
      "platformDimensions": "2.26 x 0.81 M",
      "gradeability": "% 25 %",
      "speed": "\uBCC0\uB3D9 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "113 kg",
      "capacityPostExtDeck": "117 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-041",
      "modelName": "S0812E",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 450 kg",
      "manufacturer": "LGMG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10 M",
      "platformHeight": "8 M",
      "weight": "2,300 Kg",
      "capacityPreExt": "450 kg",
      "machineDimensions": "2.49 x 1.18 x 2.36 M",
      "platformDimensions": "2.26 x 1.12 M",
      "gradeability": "% 25 %",
      "speed": "3 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "340 kg",
      "capacityPostExtDeck": "110 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-042",
      "modelName": "S1012E",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 12.0 M, \uC801\uC7AC 320 kg",
      "manufacturer": "LGMG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "12.0 M",
      "platformHeight": "10.0 M",
      "weight": "2,600 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "x 1.18 x 2.49 M",
      "platformDimensions": "1.18 x 2.26 M",
      "gradeability": "% 25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "200 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-043",
      "modelName": "S1212E",
      "feet": 39,
      "spec": "\uBC30\uD130\uB9AC, 14.0 M, \uC801\uC7AC 320 kg",
      "manufacturer": "LGMG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "14.0 M",
      "platformHeight": "12.0 M",
      "weight": "3,000 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "2.49 x 1.18 x 2.63 M",
      "platformDimensions": "1.18 x 2.26 M",
      "gradeability": "25 %",
      "speed": "3.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "200 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-044",
      "modelName": "S1413E",
      "feet": 45,
      "spec": "\uBC30\uD130\uB9AC, 15.8 M, \uC801\uC7AC 320 kg",
      "manufacturer": "LGMG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.8 M",
      "platformHeight": "13.8 M",
      "weight": "3,500 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "2.8 x 1.3 x 2.74 M",
      "platformDimensions": "2.64 x 1.12 M",
      "gradeability": "25 %",
      "speed": "4.5 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "200 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-045",
      "modelName": "SR1623E",
      "feet": 53,
      "spec": "\uBC30\uD130\uB9AC, 17.9 M, \uC801\uC7AC 680 kg",
      "manufacturer": "LGMG",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "17.9 M",
      "platformHeight": "15.9 M",
      "weight": "8,200 Kg",
      "capacityPreExt": "680 kg",
      "machineDimensions": "4.9 x 2.3 x 3.23 M",
      "platformDimensions": "3.98 x 1.83 M",
      "gradeability": "% 40 %",
      "speed": "\uBCC0\uB3D9 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "450 kg",
      "capacityPostExtDeck": "230 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-046",
      "modelName": "MS10.4",
      "feet": 34,
      "spec": "AC 110~220V, 11.9 M, \uC801\uC7AC 159 kg",
      "manufacturer": "MANLIFT",
      "powerSource": "AC 110~220V",
      "workingHeight": "11.9 M",
      "platformHeight": "10.06 M",
      "weight": "389 Kg",
      "capacityPreExt": "159 kg",
      "machineDimensions": "1.46 x 0.74 x 1.97 M",
      "platformDimensions": "0.68 x 0.66 M",
      "gradeability": "-",
      "speed": "-",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "159 kg",
      "capacityPostExtDeck": "-",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-047",
      "modelName": "MS11.8",
      "feet": 38,
      "spec": "AC 110~220V, 13.8 M, \uC801\uC7AC 136 kg",
      "manufacturer": "MANLIFT",
      "powerSource": "AC 110~220V",
      "workingHeight": "13.8 M",
      "platformHeight": "11.8 M",
      "weight": "458 Kg",
      "capacityPreExt": "136 kg",
      "machineDimensions": "1.53 x 0.74 x 1.97 M",
      "platformDimensions": "0.68 x 0.66 M",
      "gradeability": "-",
      "speed": "-",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "136 kg",
      "capacityPostExtDeck": "-",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-048",
      "modelName": "GTJZ0608ME",
      "feet": 20,
      "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 230 kg",
      "manufacturer": "Sinoboom",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "7.8 M",
      "platformHeight": "5.8 M",
      "weight": "1,575 Kg",
      "capacityPreExt": "230 kg",
      "machineDimensions": "1.80 x 0.81 x 2.04 M",
      "platformDimensions": "1.64 x 0.76 M",
      "gradeability": "25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "110 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-049",
      "modelName": "GTJZ1012E",
      "feet": 32,
      "spec": "\uBC30\uD130\uB9AC, 12 M, \uC801\uC7AC 320 kg",
      "manufacturer": "Sinoboom",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "12 M",
      "platformHeight": "10 M",
      "weight": "2,815 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "2.45 x 1.17 x 2.48 M",
      "platformDimensions": "2.30 x 1.15 M",
      "gradeability": "25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "200 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-050",
      "modelName": "GTJZ0808E",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 10.1 M, \uC801\uC7AC 250 kg",
      "manufacturer": "\uAE30\uC5F0\uB9AC\uD504\uD2B8",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10.1 M",
      "platformHeight": "8.1 M",
      "weight": "2,265 Kg",
      "capacityPreExt": "250 kg",
      "machineDimensions": "2.46 x 0.83 x 2.36 M",
      "platformDimensions": "2.30x 0.80 M",
      "gradeability": "% 25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "137 kg",
      "capacityPostExtDeck": "113 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-051",
      "modelName": "GTJZ0812E",
      "feet": 26,
      "spec": "\uBC30\uD130\uB9AC, 10.1 M, \uC801\uC7AC 450 kg",
      "manufacturer": "\uAE30\uC5F0\uB9AC\uD504\uD2B8",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "10.1 M",
      "platformHeight": "8.1 M",
      "weight": "2,715 Kg",
      "capacityPreExt": "450 kg",
      "machineDimensions": "2.45 x 1.17 x 2.36 M",
      "platformDimensions": "2.30x 1.15 M",
      "gradeability": "% 25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "330 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-052",
      "modelName": "GTJZ1212E",
      "feet": 39,
      "spec": "\uBC30\uD130\uB9AC, 13.9 M, \uC801\uC7AC 320 kg",
      "manufacturer": "\uAE30\uC5F0\uB9AC\uD504\uD2B8",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "13.9 M",
      "platformHeight": "11.9 M",
      "weight": "3,210 Kg",
      "capacityPreExt": "320 kg",
      "machineDimensions": "2.45 x 1.17 x 2.60 M",
      "platformDimensions": "2.30 x 1.15 M",
      "gradeability": "% 25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "200 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    },
    {
      "id": "prod-053",
      "modelName": "1414E Plus",
      "feet": 45,
      "spec": "\uBC30\uD130\uB9AC, 15.8 M, \uC801\uC7AC 350 kg",
      "manufacturer": "\uAE30\uC5F0\uB9AC\uD504\uD2B8",
      "powerSource": "\uBC30\uD130\uB9AC",
      "workingHeight": "15.8 M",
      "platformHeight": "13.8 M",
      "weight": "3,660 Kg",
      "capacityPreExt": "350 kg",
      "machineDimensions": "2.78 x 1.41 x 2.6 M",
      "platformDimensions": "2.64 x 1.3 M",
      "gradeability": "% 25 %",
      "speed": "4 Km/h",
      "asContact": "031-334-5296",
      "capacityPostExtMain": "230 kg",
      "capacityPostExtDeck": "120 kg",
      "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
      "isActive": true,
      "createdAt": "2026-08-27T00:00:00.000Z"
    }
  ];
};
var generateMockCustomers = () => {
  const customers = [];
  const contacts = [];
  const sites = [];
  for (let i = 1; i <= 20; i++) {
    const custId = `cust-${i}`;
    customers.push({
      id: custId,
      name: `(\uC8FC)\uB300\uD604\uD14C\uD06C ${i}\uD638\uC810`,
      bizRegNo: `123-45-00${i.toString().padStart(3, "0")}`,
      isClosed: false,
      address: `\uC11C\uC6B8\uC2DC \uAC15\uB0A8\uAD6C \uD14C\uD5E4\uB780\uB85C ${i}\uBC88\uAE38`,
      representative: `\uB300\uD45C\uC790${i}`,
      repContact: `010-1234-${i.toString().padStart(4, "0")}`,
      repEmail: `ceo${i}@example.com`,
      bizType: "\uAC74\uC124 \uBC0F \uC784\uB300\uC5C5",
      bizItem: "\uACE0\uC18C\uC791\uC5C5\uB300 \uC678",
      transactionStatus: "ALLOWED",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const contactCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 1; j <= contactCount; j++) {
      contacts.push({
        id: `contact-${i}-${j}`,
        customerId: custId,
        name: `\uAE40\uB2F4\uB2F9${i}-${j}`,
        position: "\uB300\uB9AC",
        contact: `010-9999-${i}${j}`,
        email: `contact${i}_${j}@example.com`,
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const siteCount = Math.floor(Math.random() * 2) + 2;
    for (let j = 1; j <= siteCount; j++) {
      sites.push({
        id: `site-${i}-${j}`,
        customerId: custId,
        name: `\uAC15\uB0A8 \uB798\uBBF8\uC548 \uACF5\uC0AC\uD604\uC7A5 ${i}-${j}\uAD6C\uC5ED`,
        address: `\uACBD\uAE30\uB3C4 \uBD84\uB2F9\uAD6C \uD310\uAD50\uB85C ${i}-${j}`,
        contactName: `\uC774\uC18C\uC7A5${i}-${j}`,
        contact: `010-8888-${i}${j}`,
        email: `site${i}_${j}@example.com`,
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  return { customers, contacts, sites };
};
var generateMockAssets = (products) => {
  const assets = [];
  for (let i = 1; i <= 100; i++) {
    const prod = products[i % products.length];
    assets.push({
      id: `asset-${i}`,
      modelName: prod.modelName,
      assetNo: `EQ-${i.toString().padStart(4, "0")}`,
      ownerType: "OWNED",
      status: "AVAILABLE",
      acquisitionDate: "2023-01-01",
      acquisitionPrice: 15e6,
      depreciationMonths: 60,
      residualValueRate: 10,
      accumDepreciation: 0,
      bookValue: 15e6,
      cumRentalFee: 0,
      cumRepairCost: 0,
      maintenanceScore: 0,
      // 기본 이상무 (0점)
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const extraModels = [
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "GS3246",
    "1012E",
    "1012E",
    "1012E",
    "1012E",
    "1012E",
    "1012E",
    "1012E",
    "1012E",
    "1012E",
    "1012E"
  ];
  for (let i = 0; i < extraModels.length; i++) {
    const assetId = 101 + i;
    assets.push({
      id: `asset-${assetId}`,
      modelName: extraModels[i],
      assetNo: `EQ-${assetId.toString().padStart(4, "0")}`,
      ownerType: "OWNED",
      status: "AVAILABLE",
      acquisitionDate: "2023-01-01",
      acquisitionPrice: 15e6,
      depreciationMonths: 60,
      residualValueRate: 10,
      accumDepreciation: 0,
      bookValue: 15e6,
      cumRentalFee: 0,
      cumRepairCost: 0,
      maintenanceScore: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  assets.push({
    id: "asset-rent-1",
    modelName: "GS3246",
    assetNo: "RENT-0001",
    ownerType: "RENTED",
    status: "RENTED",
    renter: "AJ\uB124\uD2B8\uC6CD\uC2A4",
    rentStart: "2026-05-01",
    rentEnd: "2026-07-10",
    monthlyRentFee: 35e4,
    dailyRentFee: 15e3,
    currentCustomerId: "cust-1",
    currentSiteId: "site-1-1",
    contractStart: "2026-05-05",
    contractEnd: "2026-07-20",
    monthlyRentalFee: 5e5,
    dailyRentalFee: 2e4,
    cumRentalFee: 1e6,
    cumRepairCost: 0,
    maintenanceScore: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  assets.push({
    id: "asset-rent-2",
    modelName: "1012E",
    assetNo: "RENT-0002",
    ownerType: "RENTED",
    status: "RENTED_RETURNED",
    renter: "\uD55C\uAD6D\uC885\uD569\uB80C\uD0C8",
    rentStart: "2026-06-01",
    rentEnd: "2026-07-12",
    actualRentReturnDate: "2026-07-18",
    monthlyRentFee: 4e5,
    dailyRentFee: 18e3,
    cumRentalFee: 0,
    cumRepairCost: 0,
    maintenanceScore: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  assets.push({
    id: "asset-rent-3",
    modelName: "GS3246",
    assetNo: "RENT-0003",
    ownerType: "RENTED",
    status: "AVAILABLE",
    renter: "AJ\uB124\uD2B8\uC6CD\uC2A4",
    rentStart: "2026-06-10",
    rentEnd: "2026-08-30",
    monthlyRentFee: 3e5,
    dailyRentFee: 12e3,
    cumRentalFee: 0,
    cumRepairCost: 0,
    maintenanceScore: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return assets;
};
var generateMockContracts = (customers, contacts, sites, assets) => {
  const contracts = [];
  const contractAssets = [];
  let assetIdx = 0;
  for (let i = 1; i <= 11; i++) {
    const cust = customers[i % customers.length];
    const custContacts = contacts.filter((c) => c.customerId === cust.id);
    const custSites = sites.filter((s) => s.customerId === cust.id);
    const contractId = `contract-${i}`;
    let startDate = "2026-07-01";
    let endDate = "2026-12-31";
    if (i === 4 || i === 5) {
      startDate = "2026-07-10";
    } else if (i === 6) {
      startDate = "2026-06-15";
      endDate = "2026-07-20";
    } else if (i === 8) {
      startDate = "2026-07-15";
      endDate = "2026-07-25";
    }
    let billingDay = 30;
    let statementClosingDay = 25;
    if (i === 1 || i === 6) {
      billingDay = 20;
      statementClosingDay = 15;
    } else if (i === 2 || i === 8) {
      billingDay = 25;
      statementClosingDay = 20;
    } else if (i === 3 || i === 9) {
      billingDay = 20;
      statementClosingDay = 20;
    } else if (i === 4) {
      billingDay = 10;
      statementClosingDay = 5;
    } else if (i === 5) {
      billingDay = 28;
      statementClosingDay = 20;
    } else if (i === 10) {
      billingDay = 20;
      statementClosingDay = 15;
    }
    contracts.push({
      id: contractId,
      contractNo: `CTR-2026-${i.toString().padStart(3, "0")}`,
      customerId: cust.id,
      contactId: custContacts[0]?.id,
      siteId: custSites[0]?.id,
      startDate,
      endDate,
      billingDay,
      statementClosingDay,
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const count = i % 2 + 1;
    for (let j = 0; j < count; j++) {
      if (assetIdx >= assets.length) break;
      const asset = assets[assetIdx];
      asset.status = "RENTED";
      asset.currentCustomerId = cust.id;
      asset.currentSiteId = custSites[0]?.id;
      asset.contractStart = startDate;
      asset.contractEnd = endDate;
      asset.billingDay = billingDay;
      const monthlyRentalFee = 3e5 + (i + j) % 5 * 15e4;
      const dailyRentalFee = Math.floor(monthlyRentalFee / 30);
      asset.monthlyRentalFee = monthlyRentalFee;
      asset.dailyRentalFee = dailyRentalFee;
      contractAssets.push({
        id: `ca-${contractId}-${j}`,
        contractId,
        assetId: asset.id,
        monthlyRentalFee,
        dailyRentalFee,
        startDate,
        endDate,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      assetIdx++;
    }
  }
  return { contracts, contractAssets };
};
var mockDataProducts = generateMockProducts();
var mockDataCust = generateMockCustomers();
var mockDataAssets = generateMockAssets(mockDataProducts);
var mockDataCont = generateMockContracts(mockDataCust.customers, mockDataCust.contacts, mockDataCust.sites, mockDataAssets);
var SEED_USERS = [];
var SEED_DEPARTMENTS = [];
var SEED_PERMISSIONS = [];
var SEED_PRODUCTS = mockDataProducts;
var SEED_CUSTOMERS = mockDataCust.customers;
var SEED_CONTACTS = mockDataCust.contacts;
var SEED_SITES = mockDataCust.sites;
var SEED_ASSETS = mockDataAssets;
var SEED_CONSUMABLES = [];
var SEED_CONSUMABLE_LOGS = [];
var SEED_CONSUMABLE_PURCHASES = [];
var SEED_CONTRACTS = mockDataCont.contracts;
var SEED_CONTRACT_ASSETS = mockDataCont.contractAssets;
var SEED_DELIVERIES = [];
var SEED_TRANSPORT_COMPANIES = [
  { id: "TC-001", name: "\uB300\uD55C\uBB3C\uB958", businessNo: "123-45-67890", contact: "1588-0001", memo: "\uC8FC\uC694 \uD30C\uD2B8\uB108", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "TC-002", name: "\uBBFC\uAD6D\uC6B4\uC218", businessNo: "234-56-78901", contact: "1588-0002", memo: "", createdAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var SEED_TRANSPORT_DRIVERS = [
  { id: "TD-001", companyId: "TC-001", driverName: "\uD64D\uAE38\uB3D9", driverContact: "010-1111-1111", vehicleNo: "\uC11C\uC6B882\uAC00 1111", vehicleType: "5\uD1A4 \uC140\uD504\uB85C\uB354", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "TD-002", companyId: "TC-002", driverName: "\uD64D\uAE38\uB3D9", driverContact: "010-2222-2222", vehicleNo: "\uACBD\uAE3099\uBC14 2222", vehicleType: "1\uD1A4 \uD654\uBB3C\uCC28", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "TD-003", companyId: "TC-001", driverName: "\uAE40\uAE30\uC0AC", driverContact: "010-3333-3333", vehicleNo: "\uC11C\uC6B882\uAC00 3333", vehicleType: "2.5\uD1A4", createdAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var SEED_BILLINGS = [];
var SEED_BILLING_DETAILS = [];
var SEED_PAYMENTS = [];
var SEED_VENDORS = [
  { id: "V-001", name: "\uAC00\uB098\uC678\uC8FC\uC815\uBE44", type: "REPAIR", bizRegNo: "111-22-33333", contactName: "\uAE40\uC815\uBE44", contact: "010-9999-9999", memo: "\uACBD\uAE30 \uC11C\uBD80\uAD8C \uC678\uC8FC\uC218\uB9AC\uACF5\uC7A5", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "V-002", name: "\uB098\uB77C\uC815\uBE44\uC13C\uD130", type: "REPAIR", bizRegNo: "222-33-44444", contactName: "\uC774\uC218\uB9AC", contact: "010-8888-8888", memo: "\uD638\uB0A8\uAD8C \uC678\uC8FC\uC218\uB9AC\uACF5\uC7A5", createdAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var SEED_REPAIRS = [
  {
    id: "REP-001",
    assetId: "asset-own-1",
    repairType: "EXTERNAL",
    vendorId: "V-001",
    requestDate: "2026-07-15",
    status: "IN_PROGRESS",
    details: "\uB9AC\uD504\uD2B8 \uC720\uC555 \uD638\uC2A4 \uB204\uC720\uB85C \uC678\uC8FC \uC785\uACE0",
    totalCost: 25e4,
    billableToCustomer: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "REP-002",
    assetId: "asset-own-2",
    repairType: "EXTERNAL",
    vendorId: "V-002",
    requestDate: "2026-07-18",
    status: "PENDING",
    details: "\uBA54\uC778\uBCF4\uB4DC \uD1B5\uC2E0 \uC5D0\uB7EC \uC678\uC8FC \uC758\uB8B0",
    totalCost: 45e4,
    billableToCustomer: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_REPAIR_CONSUMABLES = [];
var SEED_CONTRACT_HISTORY = [];
var SEED_TODOS = [];
var SEED_BANK_TRANSACTIONS = [
  { id: "bt-1", bankName: "\uC6B0\uB9AC\uC740\uD589", accountNumber: "XXXX-XX-XXXXXXX01", transactionDate: "2026-07-20 09:30:15", senderName: "\uB300\uD604\uD14C\uD06C", counterparty: "\uB300\uD604\uD14C\uD06C", depositAmount: 105e4, withdrawAmount: 0, balance: 1355e4, memo: "\uBCF4\uD1B5\uC608\uAE08\uC785\uAE08", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "bt-2", bankName: "\uC6B0\uB9AC\uC740\uD589", accountNumber: "XXXX-XX-XXXXXXX01", transactionDate: "2026-07-20 10:15:22", senderName: "\uC8FC\uC2DD\uD68C\uC0AC\uAE30\uC5F0", counterparty: "\uC8FC\uC2DD\uD68C\uC0AC\uAE30\uC5F0", depositAmount: 6e5, withdrawAmount: 0, balance: 1415e4, memo: "7\uC6D4\uBD84\uACB0\uC81C", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "bt-3", bankName: "\uC6B0\uB9AC\uC740\uD589", accountNumber: "XXXX-XX-XXXXXXX01", transactionDate: "2026-07-20 11:00:00", senderName: "\uAC70\uB798\uC0C1\uB300\uBC29", counterparty: "\uAC70\uB798\uC0C1\uB300\uBC29", depositAmount: 3e5, withdrawAmount: 0, balance: 1445e4, memo: "\uC784\uB300\uB8CC \uC1A1\uAE08", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "bt-4", bankName: "\uC6B0\uB9AC\uC740\uD589", accountNumber: "XXXX-XX-XXXXXXX01", transactionDate: "2026-07-20 13:45:10", senderName: "\uD604\uC7A5\uAC00\uC124", counterparty: "\uD604\uC7A5\uAC00\uC124", depositAmount: 0, withdrawAmount: 15e4, balance: 143e5, memo: "\uC720\uB958\uBE44 \uC9C0\uCD9C", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "bt-5", bankName: "\uC6B0\uB9AC\uC740\uD589", accountNumber: "XXXX-XX-XXXXXXX01", transactionDate: "2026-07-22 16:30:00", senderName: "\uAE30\uC5F0\uC0B0\uC5C5", counterparty: "\uAE30\uC5F0\uC0B0\uC5C5", depositAmount: 45e4, withdrawAmount: 0, balance: 1475e4, memo: "\uB80C\uD0C8\uB8CC", createdAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var SEED_BANK_MATCHING_RULES = [
  { id: "bmr-1", senderName: "\uC8FC\uC2DD\uD68C\uC0AC\uAE30\uC5F0", customerId: "cust-1", createdAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var SEED_GOOGLE_CONFIG = [
  {
    id: "default-config",
    googleEmail: "",
    googlePassword: "",
    gmailAppPassword: "",
    contractFolder: "\uB80C\uD0C8\uACC4\uC57D\uC11C_\uC99D\uBE59",
    consumableFolder: "\uC18C\uBAA8\uD488\uB0A9\uD488\uC99D\uBE59",
    deliveryFolder: "\uCD9C\uACE0\uC758\uB8B0_\uC99D\uBE59",
    maintenanceFolder: "\uC815\uBE44\uBCF4\uACE0\uC11C_\uC99D\uBE59",
    isDevMode: false,
    currentInsuranceStartDate: "2026-03-05",
    currentInsuranceEndDate: "2027-03-05",
    nextInsuranceStartDate: "2027-03-05",
    nextInsuranceEndDate: "2028-03-05",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_CASH_FLOW_SNAPSHOTS = [
  {
    id: "snap-1",
    snapshotDate: "2026-07-20",
    startingBalance: 1735e4,
    projectedInflow: 382e5,
    projectedOpex: 285e5,
    projectedCapex: 45e6,
    projectedFinalBalance: -1795e4,
    notes: "7\uC6D4 \uC815\uAE30 \uACE0\uC18C\uC791\uC5C5\uB300 2\uB300 \uCD94\uAC00 CAPEX \uCDE8\uB4DD\uC5D0 \uB530\uB978 \uC77C\uC2DC\uC801 \uC720\uB3D9\uC131 \uBD80\uC871 \uC608\uC0C1",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_ANNUAL_LEAVE_QUOTAS = [
  {
    id: "quota-1",
    userId: "usr-admin",
    periodStart: "2026-01-01",
    periodEnd: "2026-12-31",
    grantedDays: 15,
    memo: "2026\uB144 \uC815\uAE30 \uBD80\uC5EC \uC5F0\uCC28",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "quota-2",
    userId: "usr-sales1",
    periodStart: "2026-03-15",
    periodEnd: "2027-03-14",
    grantedDays: 15,
    memo: "\uC785\uC0AC\uC77C \uC8FC\uAE30 \uC5F0\uCC28 \uBD80\uC5EC",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_LEAVE_USAGES = [
  {
    id: "leave-1",
    userId: "usr-sales1",
    leaveType: "ANNUAL",
    usedDays: 1,
    startDate: "2026-06-10",
    endDate: "2026-06-10",
    reason: "\uAC1C\uC778 \uC0AC\uC720 \uD734\uAC00",
    status: "APPROVED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "leave-2",
    userId: "usr-sales1",
    leaveType: "HALF_PM",
    usedDays: 0.5,
    startDate: "2026-07-20",
    endDate: "2026-07-20",
    reason: "\uBCD1\uC6D0 \uC9C4\uB8CC (\uC624\uD6C4 \uBC18\uCC28)",
    status: "APPROVED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_OVERTIME_RECORDS = [
  {
    id: "ot-1",
    userId: "usr-sales1",
    startDateTime: "2026-08-01 18:00",
    hours: 2.5,
    workDetail: "\uAE34\uAE09 \uCD9C\uACE0 \uC7A5\uBE44 \uC815\uBE44 \uBC0F \uC57C\uAC04 \uBC30\uCC28 \uB300\uAE30",
    status: "APPROVED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var SEED_INSPECTION_CHECKLIST_ITEMS = [];
var SEED_BANK_INITIAL_BALANCES = [
  { id: "bank-init-\uC6B0\uB9AC\uC740\uD589", bankName: "\uC6B0\uB9AC\uC740\uD589", accountNumber: "XXXX-XX-XXXXXXX01", initialBalance: 0, updatedAt: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "bank-init-\uC2E0\uD55C\uC740\uD589", bankName: "\uC2E0\uD55C\uC740\uD589", accountNumber: "XXX-XXXXXXXXX-XX", initialBalance: 0, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }
];
var ALL_DB_KEYS = [
  "users",
  "departments",
  "permissions",
  "customers",
  "contacts",
  "sites",
  "products",
  "assets",
  "consumables",
  "consumableLogs",
  "consumablePurchases",
  "contracts",
  "contractAssets",
  "contractHistory",
  "deliveries",
  "transportCompanies",
  "transportDrivers",
  "vendors",
  "billings",
  "billingDetails",
  "payments",
  "paymentDepositLinks",
  "repairs",
  "repairConsumables",
  "todos",
  "bankTransactions",
  "bankMatchingRules",
  "bankInitialBalances",
  "googleConfigs",
  "assetInOutLogs",
  "cashFlowSnapshots",
  "outboundInspections",
  "depreciationLogs",
  "purchaseSettlements",
  "purchaseSettlementItems",
  "settlementPaymentLogs",
  "externalLeases",
  "annualLeaveQuotas",
  "leaveUsages",
  "overtimeRecords",
  "payrollClosings",
  "inspectionChecklistItems",
  "prepaidTransactions",
  "delinquencyActionLogs",
  "mechanicConsumableStocks",
  "receivables"
];
var LocalDB = class {
  get(key, seed) {
    const val = localStorage.getItem(`erp_${key}`);
    if (!val) {
      localStorage.setItem(`erp_${key}`, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(val);
  }
  set(key, data) {
    localStorage.setItem(`erp_${key}`, JSON.stringify(data));
  }
  get users() {
    return this.get("users", SEED_USERS);
  }
  set users(val) {
    this.set("users", val);
  }
  get departments() {
    return this.get("departments", SEED_DEPARTMENTS);
  }
  set departments(val) {
    this.set("departments", val);
  }
  get permissions() {
    const raw = this.get("permissions", SEED_PERMISSIONS);
    const validUserIds = new Set(this.users.map((u) => u.id));
    const cleanPermissions = raw.filter((p) => p && p.userId && validUserIds.has(p.userId));
    if (cleanPermissions.length !== raw.length) {
      this.set("permissions", cleanPermissions);
    }
    return cleanPermissions;
  }
  set permissions(val) {
    const validUserIds = new Set(this.users.map((u) => u.id));
    const cleanVals = (val || []).filter((p) => p && p.userId && validUserIds.has(p.userId));
    this.set("permissions", cleanVals);
  }
  get customers() {
    return this.get("customers", SEED_CUSTOMERS);
  }
  set customers(val) {
    this.set("customers", val);
  }
  get contacts() {
    return this.get("contacts", SEED_CONTACTS);
  }
  set contacts(val) {
    this.set("contacts", val);
  }
  get sites() {
    return this.get("sites", SEED_SITES);
  }
  set sites(val) {
    this.set("sites", val);
  }
  get products() {
    return this.get("products", SEED_PRODUCTS);
  }
  set products(val) {
    this.set("products", val);
  }
  get assets() {
    return this.get("assets", SEED_ASSETS);
  }
  set assets(val) {
    this.set("assets", val);
  }
  get inspectionChecklistItems() {
    return this.get("inspectionChecklistItems", SEED_INSPECTION_CHECKLIST_ITEMS);
  }
  set inspectionChecklistItems(val) {
    this.set("inspectionChecklistItems", val);
  }
  get consumables() {
    return this.get("consumables", SEED_CONSUMABLES);
  }
  set consumables(val) {
    this.set("consumables", val);
  }
  get consumableLogs() {
    return this.get("consumableLogs", SEED_CONSUMABLE_LOGS);
  }
  set consumableLogs(val) {
    this.set("consumableLogs", val);
  }
  get consumablePurchases() {
    return this.get("consumablePurchases", SEED_CONSUMABLE_PURCHASES);
  }
  set consumablePurchases(val) {
    this.set("consumablePurchases", val);
  }
  get mechanicConsumableStocks() {
    return this.get("mechanicConsumableStocks", []);
  }
  set mechanicConsumableStocks(val) {
    this.set("mechanicConsumableStocks", val);
  }
  get contracts() {
    return this.get("contracts", SEED_CONTRACTS);
  }
  set contracts(val) {
    this.set("contracts", val);
  }
  get contractAssets() {
    return this.get("contractAssets", SEED_CONTRACT_ASSETS);
  }
  set contractAssets(val) {
    this.set("contractAssets", val);
  }
  get contractHistory() {
    return this.get("contractHistory", SEED_CONTRACT_HISTORY);
  }
  set contractHistory(val) {
    this.set("contractHistory", val);
  }
  get deliveries() {
    return this.get("deliveries", SEED_DELIVERIES);
  }
  set deliveries(val) {
    this.set("deliveries", val);
  }
  get transportCompanies() {
    return this.get("transportCompanies", SEED_TRANSPORT_COMPANIES);
  }
  set transportCompanies(val) {
    this.set("transportCompanies", val);
  }
  get transportDrivers() {
    return this.get("transportDrivers", SEED_TRANSPORT_DRIVERS);
  }
  set transportDrivers(val) {
    this.set("transportDrivers", val);
  }
  get billings() {
    return this.get("billings", SEED_BILLINGS);
  }
  set billings(val) {
    this.set("billings", val);
  }
  get billingDetails() {
    return this.get("billingDetails", SEED_BILLING_DETAILS);
  }
  set billingDetails(val) {
    this.set("billingDetails", val);
  }
  get receivables() {
    return this.get("receivables", []);
  }
  set receivables(val) {
    this.set("receivables", val);
  }
  get payments() {
    return this.get("payments", SEED_PAYMENTS);
  }
  set payments(val) {
    this.set("payments", val);
  }
  get paymentDepositLinks() {
    return this.get("paymentDepositLinks", []);
  }
  set paymentDepositLinks(val) {
    this.set("paymentDepositLinks", val);
  }
  get annualLeaveQuotas() {
    return this.get("annualLeaveQuotas", SEED_ANNUAL_LEAVE_QUOTAS);
  }
  set annualLeaveQuotas(val) {
    this.set("annualLeaveQuotas", val);
  }
  get leaveUsages() {
    return this.get("leaveUsages", SEED_LEAVE_USAGES);
  }
  set leaveUsages(val) {
    this.set("leaveUsages", val);
  }
  get overtimeRecords() {
    return this.get("overtimeRecords", SEED_OVERTIME_RECORDS);
  }
  set overtimeRecords(val) {
    this.set("overtimeRecords", val);
  }
  get payrollClosings() {
    return this.get("payrollClosings", []);
  }
  set payrollClosings(val) {
    this.set("payrollClosings", val);
  }
  get repairs() {
    return this.get("repairs", SEED_REPAIRS);
  }
  set repairs(val) {
    this.set("repairs", val);
  }
  get vendors() {
    return this.get("vendors", SEED_VENDORS);
  }
  set vendors(val) {
    this.set("vendors", val);
  }
  get repairConsumables() {
    return this.get("repairConsumables", SEED_REPAIR_CONSUMABLES);
  }
  set repairConsumables(val) {
    this.set("repairConsumables", val);
  }
  get todos() {
    return this.get("todos", SEED_TODOS);
  }
  set todos(val) {
    this.set("todos", val);
  }
  get bankTransactions() {
    return this.get("bankTransactions", SEED_BANK_TRANSACTIONS);
  }
  set bankTransactions(val) {
    this.set("bankTransactions", val);
  }
  get bankMatchingRules() {
    return this.get("bankMatchingRules", SEED_BANK_MATCHING_RULES);
  }
  set bankMatchingRules(val) {
    this.set("bankMatchingRules", val);
  }
  get bankInitialBalances() {
    return this.get("bankInitialBalances", SEED_BANK_INITIAL_BALANCES);
  }
  set bankInitialBalances(val) {
    this.set("bankInitialBalances", val);
  }
  get googleConfigs() {
    return this.get("googleConfigs", []);
  }
  set googleConfigs(val) {
    this.set("googleConfigs", val);
  }
  get assetInOutLogs() {
    return this.get("assetInOutLogs", []);
  }
  set assetInOutLogs(val) {
    this.set("assetInOutLogs", val);
  }
  get cashFlowSnapshots() {
    return this.get("cashFlowSnapshots", SEED_CASH_FLOW_SNAPSHOTS);
  }
  set cashFlowSnapshots(val) {
    this.set("cashFlowSnapshots", val);
  }
  get outboundInspections() {
    return this.get("outboundInspections", []);
  }
  set outboundInspections(val) {
    this.set("outboundInspections", val);
  }
  // 💡 [Zero Silent Failures / 1000-Row Pagination Bug Fix]
  // Supabase의 기본 select('*')는 최대 1000건까지만 반환합니다.
  // 데이터가 1000건을 초과하면 이후 생성된 데이터가 프론트엔드에 동기화되지 않고 무음 누락(Silent Drop)되는 심각한 결함이 있었습니다.
  // 이를 해결하기 위해 while 문과 range()를 사용하여 테이블의 모든 레코드를 페이지네이션으로 100% 무누락 조회합니다.
  async fetchAllFromSupabase(tableName) {
    if (!supabase) return [];
    let allData = [];
    let page = 0;
    const pageSize = 1e3;
    while (true) {
      const { data, error } = await supabase.from(tableName).select("*").range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) {
        throw error;
      }
      if (!data || data.length === 0) {
        break;
      }
      allData = allData.concat(data);
      if (data.length < pageSize) {
        break;
      }
      page++;
    }
    return allData;
  }
  get depreciationLogs() {
    return this.get("depreciationLogs", []);
  }
  set depreciationLogs(val) {
    this.set("depreciationLogs", val);
  }
  get purchaseSettlements() {
    return this.get("purchaseSettlements", []);
  }
  set purchaseSettlements(val) {
    this.set("purchaseSettlements", val);
  }
  get purchaseSettlementItems() {
    return this.get("purchaseSettlementItems", []);
  }
  set purchaseSettlementItems(val) {
    this.set("purchaseSettlementItems", val);
  }
  get settlementPaymentLogs() {
    return this.get("settlementPaymentLogs", []);
  }
  set settlementPaymentLogs(val) {
    this.set("settlementPaymentLogs", val);
  }
  get externalLeases() {
    return this.get("externalLeases", []);
  }
  set externalLeases(val) {
    this.set("externalLeases", val);
  }
  get prepaidTransactions() {
    return this.get("prepaidTransactions", []);
  }
  set prepaidTransactions(val) {
    this.set("prepaidTransactions", val);
  }
  get delinquencyActionLogs() {
    return this.get("delinquencyActionLogs", []);
  }
  set delinquencyActionLogs(val) {
    this.set("delinquencyActionLogs", val);
  }
  // Supabase 테이블 맵핑
  mapToSupabaseTable(key) {
    const mapping = {
      prepaidTransactions: "prepaid_transactions",
      delinquencyActionLogs: "delinquency_action_logs",
      users: "users",
      departments: "departments",
      permissions: "permissions",
      customers: "customers",
      contacts: "customer_contacts",
      sites: "customer_sites",
      products: "products",
      assets: "assets",
      consumables: "consumables",
      consumableLogs: "consumable_logs",
      consumablePurchases: "consumable_purchases",
      contracts: "contracts",
      contractAssets: "contract_assets",
      contractHistory: "contract_history",
      deliveries: "deliveries",
      transportCompanies: "transport_companies",
      transportDrivers: "transport_drivers",
      billings: "billings",
      billingDetails: "billing_details",
      payments: "payments",
      paymentDepositLinks: "payment_deposit_links",
      repairs: "repairs",
      repairConsumables: "repair_consumables",
      bankTransactions: "bank_transactions",
      bankMatchingRules: "bank_matching_rules",
      bankInitialBalances: "bank_initial_balances",
      assetInOutLogs: "asset_inout_logs",
      googleConfigs: "google_configs",
      vendors: "vendors",
      cashFlowSnapshots: "cash_flow_snapshots",
      outboundInspections: "outbound_inspections",
      depreciationLogs: "depreciation_logs",
      purchaseSettlements: "purchase_settlements",
      purchaseSettlementItems: "purchase_settlement_items",
      settlementPaymentLogs: "settlement_payment_logs",
      externalLeases: "external_leases",
      inspectionChecklistItems: "inspection_checklist_items",
      mechanicConsumableStocks: "mechanic_consumable_stocks",
      receivables: "receivables",
      annualLeaveQuotas: "annual_leave_quotas",
      leaveUsages: "leave_usages",
      overtimeRecords: "overtime_records",
      payrollClosings: "payroll_closings"
    };
    return mapping[key] || key;
  }
  // 비동기 쓰기 큐
  pendingWrites = [];
  async awaitPendingWrites() {
    if (!this.pendingWrites || this.pendingWrites.length === 0) return;
    try {
      await Promise.all(this.pendingWrites);
    } catch (err) {
      console.error("Supabase pending write error:", err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError")) {
        throw new Error(`\uC6D0\uACA9 Supabase DB \uD1B5\uC2E0 \uC7A5\uC560 (Failed to fetch):

\uC778\uD130\uB137 \uB124\uD2B8\uC6CC\uD06C \uC5F0\uACB0 \uC0C1\uD0DC, \uC0AC\uB0B4 \uBC29\uD654\uBCBD \uC815\uCC45 \uB610\uB294 Supabase \uC11C\uBC84 \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.
(\uB85C\uCEEC \uB370\uC774\uD130\uB294 \uC548\uC804\uD558\uAC8C \uBCF4\uC874\uB418\uC5C8\uC2B5\uB2C8\uB2E4.)`);
      }
      throw err;
    } finally {
      this.pendingWrites = [];
    }
  }
  isSupabaseConnected() {
    return !!supabase;
  }
  normalizePayloadKeys(item) {
    if (!item || typeof item !== "object") return item;
    if (Array.isArray(item)) {
      return item.map((i) => this.normalizePayloadKeys(i));
    }
    const normalized = { ...item };
    if (normalized.user_id) {
      if (!normalized.userId) normalized.userId = normalized.user_id;
      delete normalized.user_id;
    }
    if (normalized.salesperson_id) {
      if (!normalized.salespersonId) normalized.salespersonId = normalized.salesperson_id;
      delete normalized.salesperson_id;
    }
    if (normalized.requester_id) {
      if (!normalized.requesterId) normalized.requesterId = normalized.requester_id;
      delete normalized.requester_id;
    }
    if (normalized.mechanic_id) {
      if (!normalized.mechanicId) normalized.mechanicId = normalized.mechanic_id;
      delete normalized.mechanic_id;
    }
    if (normalized.customer_id) {
      if (!normalized.customerId) normalized.customerId = normalized.customer_id;
      delete normalized.customer_id;
    }
    if (normalized.site_id) {
      if (!normalized.siteId) normalized.siteId = normalized.site_id;
      delete normalized.site_id;
    }
    if (normalized.contract_id) {
      if (!normalized.contractId) normalized.contractId = normalized.contract_id;
      delete normalized.contract_id;
    }
    if (normalized.contract_start) {
      if (!normalized.contractStart) normalized.contractStart = normalized.contract_start;
      delete normalized.contract_start;
    }
    if (normalized.contract_end) {
      if (!normalized.contractEnd) normalized.contractEnd = normalized.contract_end;
      delete normalized.contract_end;
    }
    if (normalized.current_customer_id) {
      if (!normalized.currentCustomerId) normalized.currentCustomerId = normalized.current_customer_id;
      delete normalized.current_customer_id;
    }
    if (normalized.current_site_id) {
      if (!normalized.currentSiteId) normalized.currentSiteId = normalized.current_site_id;
      delete normalized.current_site_id;
    }
    if (normalized.asset_id) {
      if (!normalized.assetId) normalized.assetId = normalized.asset_id;
      delete normalized.asset_id;
    }
    return normalized;
  }
  // 단일 테이블만 Supabase에서 pull (메뉴 전환 시 관련 테이블만 선택적 로딩용)
  /**
   * Supabase PostgREST 기본 1,000건 제한을 극복하여 대용량 테이블(billing_details 등)의 전체 레코드를 무누락 전수 로드합니다.
   */
  async fetchAllRowsFromSupabase(tableName) {
    if (!supabase) return null;
    const PAGE_SIZE = 1e3;
    let allRows = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase.from(tableName).select("*").range(from, from + PAGE_SIZE - 1);
      if (error) {
        console.warn(`[db.ts] Supabase fetchAllRows failed for ${tableName} (range ${from}-${from + PAGE_SIZE - 1}):`, error);
        if (allRows.length > 0) return allRows;
        return null;
      }
      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return allRows;
  }
  // 단일 테이블만 Supabase에서 pull (메뉴 전환 시 관련 테이블만 선택적 로딩용)
  async pullTableFromSupabase(key) {
    if (!supabase) return null;
    try {
      const tableName = this.mapToSupabaseTable(key);
      const data = await this.fetchAllRowsFromSupabase(tableName);
      if (data !== null) {
        const normalizedData = this.normalizePayloadKeys(data);
        this.set(key, normalizedData);
        return normalizedData;
      }
      return null;
    } catch (e) {
      console.warn(`pullTableFromSupabase exception for ${key}:`, e);
      return null;
    }
  }
  async pullFromSupabase() {
    if (!supabase) return;
    if (this.pendingWrites.length > 0) {
      try {
        await Promise.all(this.pendingWrites);
      } catch (err) {
        console.error("Error waiting for pending writes:", err);
      }
      this.pendingWrites = [];
    }
    ALL_DB_KEYS.forEach((key) => {
      this.set(key, []);
    });
    const tables = ALL_DB_KEYS;
    try {
      const results = await Promise.all(
        tables.map(async (key) => {
          try {
            const tableName = this.mapToSupabaseTable(key);
            const data = await this.fetchAllRowsFromSupabase(tableName);
            if (data === null) {
              console.warn(`Supabase pull failed for table ${tableName}`);
              return { key, data: null };
            }
            return { key, data: this.normalizePayloadKeys(data) };
          } catch (e) {
            console.warn(`Supabase pull failed for key ${key}:`, e);
            return { key, data: null };
          }
        })
      );
      results.forEach(({ key, data }) => {
        if (data !== null) {
          this.set(key, data);
        }
      });
    } catch (err) {
      console.error("Supabase pullFromSupabase failed, falling back to local cache:", err);
      throw err;
    }
  }
  generateNextId(key, list, extraData) {
    if (key === "inboundNo") {
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0].replace(/-/g, "");
      const prefix2 = `INB-${todayStr}-`;
      let maxNum2 = 0;
      list.forEach((item) => {
        const checkStr = item.inboundNo || item.id;
        if (checkStr && typeof checkStr === "string" && checkStr.startsWith(prefix2)) {
          const numPart = parseInt(checkStr.replace(prefix2, ""), 10);
          if (!isNaN(numPart) && numPart > maxNum2) maxNum2 = numPart;
        }
      });
      return `${prefix2}${String(maxNum2 + 1).padStart(3, "0")}`;
    }
    if (key === "billings") {
      let ymStr = "";
      if (extraData && typeof extraData.billingYm === "string") {
        ymStr = extraData.billingYm.replace("-", "").trim().slice(2, 6);
      } else if (extraData && typeof extraData.billingDate === "string") {
        ymStr = extraData.billingDate.replace("-", "").trim().slice(2, 6);
      }
      if (!ymStr || ymStr.length !== 4) {
        const now = /* @__PURE__ */ new Date();
        ymStr = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0");
      }
      const billPrefix = `BILL-${ymStr}`;
      let maxNum2 = 0;
      list.forEach((item) => {
        if (!item || !item.id) return;
        if (item.id.startsWith(billPrefix)) {
          const numPart = parseInt(item.id.replace(billPrefix, ""), 10);
          if (!isNaN(numPart) && numPart > maxNum2) {
            maxNum2 = numPart;
          }
        }
      });
      return `${billPrefix}${String(maxNum2 + 1).padStart(4, "0")}`;
    }
    let prefix = "";
    switch (key) {
      case "products":
        prefix = "PROD-";
        break;
      case "customers":
        prefix = "CUST-";
        break;
      case "assets":
        prefix = "ASSET-";
        break;
      case "sites":
        prefix = "SITE-";
        break;
      case "contacts":
        prefix = "CONT-";
        break;
      case "contracts":
        prefix = "CONTR-";
        break;
      case "vendors":
        prefix = "VND-";
        break;
      case "deliveries":
        prefix = "DLV-";
        break;
      case "repairs":
        prefix = "REP-";
        break;
      case "billings":
        prefix = "BILL-";
        break;
      case "billingDetails":
        prefix = "BDET-";
        break;
      case "payments":
        prefix = "PAY-";
        break;
      case "paymentDepositLinks":
        prefix = "PDL-";
        break;
      case "todos":
        prefix = "TODO-";
        break;
      case "bankMatchingRules":
        prefix = "RULE-";
        break;
      case "bankTransactions":
        prefix = "TXN-";
        break;
      case "departments":
        prefix = "DEPT-";
        break;
      case "users":
        prefix = "USR-";
        break;
      case "permissions":
        prefix = "PERM-";
        break;
      case "consumables":
        prefix = "CSM-";
        break;
      case "consumableLogs":
        prefix = "CLOG-";
        break;
      case "consumablePurchases":
        prefix = "CPRC-";
        break;
      case "contractAssets":
        prefix = "CAST-";
        break;
      case "contractHistory":
        prefix = "CHST-";
        break;
      case "assetInOutLogs":
        prefix = "AIOG-";
        break;
      case "cashFlowSnapshots":
        prefix = "CFSN-";
        break;
      case "transportCompanies":
        prefix = "TCOM-";
        break;
      case "transportDrivers":
        prefix = "TDRV-";
        break;
      case "outboundInspections":
        prefix = "OIN-";
        break;
      case "inspectionChecklistItems":
        prefix = "CHK-";
        break;
      case "depreciationLogs":
        prefix = "DEP-";
        break;
      case "receivables":
        prefix = "RCV-";
        break;
      default:
        prefix = key.slice(0, 4).toUpperCase() + "-";
    }
    let maxNum = 0;
    const regex = new RegExp(`^${prefix}(\\d+)`, "i");
    const fallbackRegex = new RegExp(`^${key.slice(0, 4)}-(\\d+)`, "i");
    list.forEach((item) => {
      if (!item || !item.id) return;
      let match = item.id.match(regex);
      if (!match) {
        match = item.id.match(fallbackRegex);
      }
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    const paddedNum = String(nextNum).padStart(7, "0");
    return `${prefix}${paddedNum}`;
  }
  sanitizeSupabasePayload(obj, tableName) {
    if (!obj || typeof obj !== "object") return obj;
    const sanitized = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const val = obj[key];
      if (val === void 0) {
        continue;
      }
      if (tableName === "consumables" && key === "supplier") {
        continue;
      }
      if (tableName === "purchase_settlements" && key === "bankTransactionId") {
        continue;
      }
      if (typeof val === "string" && (key === "userId" || key === "salespersonId" || key === "requesterId" || key === "accepterId" || key === "completerId" || key === "inbounderId" || key === "createdById" || key === "updatedById" || key.toLowerCase().includes("user"))) {
        const userExists = this.users.some((u) => u.id === val);
        sanitized[key] = userExists ? val : this.users[0]?.id || null;
      } else if (key === "consumableId") {
        const consumableExists = typeof val === "string" && val.trim() !== "" && this.consumables.some((c) => c.id === val);
        sanitized[key] = consumableExists ? val : null;
      } else if (typeof val === "string" && val.trim() === "" && (key.endsWith("Id") || key === "contractId" || key === "assetId" || key === "customerId" || key === "siteId" || key === "salespersonId" || key === "vendorId")) {
        sanitized[key] = null;
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
  // 헬퍼 메소드들 - CRUD 시뮬레이션 및 백그라운드 Supabase 업로드
  insertRow(key, row) {
    const list = this[key];
    const newId = row.id || this.generateNextId(key, list, row);
    const nowIso2 = (/* @__PURE__ */ new Date()).toISOString();
    const formattedRow = {
      createdAt: nowIso2,
      updatedAt: nowIso2,
      ...row,
      id: newId
    };
    const newRow = formattedRow;
    list.push(newRow);
    this.set(key, list);
    if (supabase) {
      const tableName = this.mapToSupabaseTable(key);
      const payloadForSupabase = this.sanitizeSupabasePayload(newRow, tableName);
      const promise = supabase.from(tableName).upsert([payloadForSupabase], { onConflict: "id" }).then(({ data, error }) => {
        if (error) {
          console.error(`Supabase upsert failed for ${tableName}:`, error);
          const msg = error.message || String(error);
          if (msg.includes("Could not find the table") || error.code === "PGRST204" || error.code === "42P01") {
            console.warn(`[Graceful Isolation] \uC6D0\uACA9 Supabase DB\uC5D0 ${tableName} \uD14C\uC774\uBE14\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB85C\uCEEC \uC800\uC7A5\uC744 \uC644\uACB0\uD569\uB2C8\uB2E4.`);
            return null;
          }
          if (msg.includes("column") || msg.includes("Could not find") || error.code === "PGRST200" || error.code === "42703") {
            const fallbackPayload = { ...payloadForSupabase };
            delete fallbackPayload.defectsJson;
            delete fallbackPayload.inboundNo;
            delete fallbackPayload.maintenanceScore;
            delete fallbackPayload.supplier;
            delete fallbackPayload.bankTransactionId;
            return supabase.from(tableName).upsert([fallbackPayload], { onConflict: "id" }).then(({ data: d2, error: e2 }) => {
              if (e2) console.warn(`Supabase fallback upsert failed for ${tableName}:`, e2);
              return d2;
            });
          }
          return null;
        }
        return data;
      });
      this.pendingWrites.push(promise);
    }
    return newRow;
  }
  updateRow(key, id, updates) {
    const list = this[key];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const nowIso2 = (/* @__PURE__ */ new Date()).toISOString();
    const updatedPayload = {
      ...updates,
      updatedAt: nowIso2
    };
    const updated = { ...list[index], ...updatedPayload };
    list[index] = updated;
    this.set(key, list);
    if (supabase) {
      const tableName = this.mapToSupabaseTable(key);
      let payloadForSupabase = this.sanitizeSupabasePayload(updatedPayload, tableName);
      for (const updateKey in updates) {
        if (updates[updateKey] === void 0 || updates[updateKey] === null) {
          payloadForSupabase[updateKey] = null;
        }
      }
      if (tableName === "consumable_purchases") {
        const targetConsumableId = "consumableId" in payloadForSupabase ? payloadForSupabase.consumableId : list[index]?.consumableId;
        const isValid = typeof targetConsumableId === "string" && targetConsumableId.trim() !== "" && this.consumables.some((c) => c.id === targetConsumableId);
        if (!isValid) {
          payloadForSupabase = {
            ...payloadForSupabase,
            consumableId: null
          };
        }
      }
      const promise = supabase.from(tableName).update(payloadForSupabase).eq("id", id).then(({ data, error }) => {
        if (error) {
          console.error(`Supabase update failed for ${tableName}:`, error);
          const msg = error.message || String(error);
          if (msg.includes("Could not find the table") || error.code === "PGRST204" || error.code === "42P01") {
            console.warn(`[Graceful Isolation] \uC6D0\uACA9 Supabase DB\uC5D0 ${tableName} \uD14C\uC774\uBE14\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB85C\uCEEC \uC800\uC7A5\uC744 \uC644\uACB0\uD569\uB2C8\uB2E4.`);
            return null;
          }
          throw error;
        }
        return data;
      });
      this.pendingWrites.push(promise);
    }
    return updated;
  }
  deleteRow(key, id) {
    if (key === "users" && (id === "u-1" || id === "sys-admin")) {
      console.warn("Cannot delete system administrator account.");
      return false;
    }
    const list = this[key];
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) return false;
    this.set(key, filtered);
    if (supabase) {
      const tableName = this.mapToSupabaseTable(key);
      const promise = supabase.from(tableName).delete().eq("id", id).then(({ error }) => {
        if (error) {
          console.error(`Supabase delete failed for ${tableName}:`, error);
          const msg = error.message || String(error);
          if (msg.includes("Could not find the table") || error.code === "PGRST204" || error.code === "42P01") {
            console.warn(`[Graceful Isolation] \uC6D0\uACA9 Supabase DB\uC5D0 ${tableName} \uD14C\uC774\uBE14\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB85C\uCEEC \uC800\uC7A5\uC744 \uC644\uACB0\uD569\uB2C8\uB2E4.`);
            return null;
          }
          throw new Error(`[Supabase DB \uC0AD\uC81C \uC2E4\uD328] ${tableName} (ID: ${id})

\uC0AC\uC720: ${msg}`);
        }
      });
      this.pendingWrites.push(promise);
    }
    return true;
  }
  // Bulk upload all tables to Supabase
  async uploadAllTables() {
    if (!supabase) return;
    const tables = ALL_DB_KEYS;
    await Promise.all(tables.map(async (key) => {
      const data = this[key];
      const tableName = this.mapToSupabaseTable(key);
      const sanitizedData = Array.isArray(data) ? data.map((item) => this.sanitizeSupabasePayload(item, tableName)) : [];
      const { error } = await supabase.from(tableName).upsert(sanitizedData, { onConflict: "id" });
      if (error) console.error(`Bulk upsert error for ${tableName}:`, error);
    }));
  }
  // Clear all data from Supabase tables
  async clearAllTables() {
    const tables = ALL_DB_KEYS;
    tables.forEach((key) => {
      this.set(key, []);
    });
    if (!supabase) return;
    await Promise.all(tables.map(async (key) => {
      const tableName = this.mapToSupabaseTable(key);
      const { error } = await supabase.from(tableName).delete().neq("id", "");
      if (error) console.error(`Clear table error for ${tableName}:`, error);
    }));
  }
  // 조직도 및 구성원 일괄 저장 (Batch) - 기존 데이터를 전부 덮어씌움
  async saveOrganizationBatch(departments, users) {
    this.set("departments", departments);
    this.set("users", users);
    if (supabase) {
      const promise = (async () => {
        const currentDepts = await supabase.from("departments").select("id");
        if (currentDepts.data) {
          const deptsToDelete = currentDepts.data.map((d) => d.id).filter((id) => !departments.some((d) => d.id === id));
          if (deptsToDelete.length > 0) {
            const { error: delErr } = await supabase.from("departments").delete().in("id", deptsToDelete);
            if (delErr) {
              console.error("Supabase delete departments failed:", delErr);
              throw delErr;
            }
          }
        }
        if (departments.length > 0) {
          const nowIso2 = (/* @__PURE__ */ new Date()).toISOString();
          const sanitizedDepts = departments.map((d) => ({
            ...d,
            createdAt: d.createdAt || nowIso2,
            updatedAt: nowIso2
          }));
          const { error: deptErr } = await supabase.from("departments").upsert(sanitizedDepts, { onConflict: "id" });
          if (deptErr) {
            console.error("Supabase batch upsert departments failed:", deptErr);
            throw deptErr;
          }
        }
        const currentUsers = await supabase.from("users").select("id");
        if (currentUsers.data) {
          const usersToDelete = currentUsers.data.map((u) => u.id).filter((id) => id !== "u-1" && id !== "sys-admin" && !users.some((u) => u.id === id));
          if (usersToDelete.length > 0) {
            const { error: delErr } = await supabase.from("users").delete().in("id", usersToDelete);
            if (delErr) {
              console.error("Supabase delete users failed:", delErr);
              throw delErr;
            }
          }
        }
        if (users.length > 0) {
          const nowIso2 = (/* @__PURE__ */ new Date()).toISOString();
          const sanitizedUsers = users.map((u) => ({
            ...u,
            createdAt: u.createdAt || nowIso2,
            updatedAt: nowIso2
          }));
          const { error: userErr } = await supabase.from("users").upsert(sanitizedUsers, { onConflict: "id" });
          if (userErr) {
            console.error("Supabase batch upsert users failed:", userErr);
            throw userErr;
          }
        }
      })();
      this.pendingWrites.push(promise);
      await promise;
    }
  }
};
var db = new LocalDB();

// src/services/migrationEngine.ts
var XLSX = __toESM(require("xlsx"), 1);

// src/data/presetProductSpecs.ts
var PRESET_PRODUCT_SPECS = {
  "S1012AC+": {
    "id": "PROD-0000035",
    "modelName": "S1012AC+",
    "feet": 32,
    "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 450 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1012AC+/5.%EC%9D%B8%EC%A6%9D%EC%84%9CS1012AC+%EC%9D%B8%EC%A6%9D%EC%84%9C(%ED%86%B5%ED%95%A9)(2025%EB%85%844%EC%9B%9415%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1012AC+/4.%EC%A0%9C%EC%9B%90%ED%91%9CS1012AC+.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1012AC+/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10 M",
    "platformHeight": "8 M",
    "weight": "2,750 Kg",
    "capacityPreExt": "450 kg",
    "machineDimensions": "2.48 x 1.15 x 2.36 M",
    "platformDimensions": "2.27 x 1.12 M",
    "gradeability": "25 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "337 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S1614AC+": {
    "id": "PROD-0000038",
    "modelName": "S1614AC+",
    "feet": 53,
    "spec": "\uBC30\uD130\uB9AC, 15.7 M, \uC801\uC7AC 363 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1614AC+/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(S1614AC+)2025%EB%85%843%EC%9B%9413%EC%9D%BC.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1614AC+/4.%EC%A0%9C%EC%9B%90%ED%91%9C(S1614AC+).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1614AC+/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.7 M",
    "platformHeight": "13.7 M",
    "weight": "3,500 Kg",
    "capacityPreExt": "363 kg",
    "machineDimensions": "2.84 x 1.39 x 2.62 M",
    "platformDimensions": "2.64 x 1.12 M",
    "gradeability": "25 %",
    "speed": "5.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "250 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S1212AC+": {
    "id": "PROD-0000039",
    "modelName": "S1212AC+",
    "feet": 40,
    "spec": "\uBC30\uD130\uB9AC, 12 M, \uC801\uC7AC 408 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1212AC+/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(S1212AC+)25%EB%85%844%EC%9B%9415%EC%9D%BC.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1212AC+/4.%EC%A0%9C%EC%9B%90%ED%91%9C(S1212AC+).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1212AC+/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "12 M",
    "platformHeight": "10 M",
    "weight": "3,060 Kg",
    "capacityPreExt": "408 kg",
    "machineDimensions": "2.48 x 1.15 x 2.49 M",
    "platformDimensions": "2.27 x 1.12 M",
    "gradeability": "25 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "295 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S0812E": {
    "id": "PROD-0000041",
    "modelName": "S0812E",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 450 kg",
    "manufacturer": "LGMG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S0812E/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(S0812E)23%EB%85%8412%EC%9B%9414%EC%9D%BC.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S0812E/4.%EC%A0%9C%EC%9B%90%ED%91%9C(S0812E).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S0812E/7.LGMG%20%EC%8B%9C%EC%A0%80%20%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10 M",
    "platformHeight": "8 M",
    "weight": "2,300 Kg",
    "capacityPreExt": "450 kg",
    "machineDimensions": "2.49 x 1.18 x 2.36 M",
    "platformDimensions": "2.26 x 1.12 M",
    "gradeability": "25 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "340 kg",
    "capacityPostExtDeck": "110 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S1012E": {
    "id": "PROD-0000042",
    "modelName": "S1012E",
    "feet": 32,
    "spec": "\uBC30\uD130\uB9AC, 12.0 M, \uC801\uC7AC 320 kg",
    "manufacturer": "LGMG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1012E/4.%EC%9D%B8%EC%A6%9D%EC%84%9C(2023%EB%85%8411%EC%9B%9414%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1012E/4.%EC%A0%9C%EC%9B%90%ED%91%9C(S1012E).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1012E/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "12.0 M",
    "platformHeight": "10.0 M",
    "weight": "2,600 Kg",
    "capacityPreExt": "320 kg",
    "machineDimensions": "x 1.18 x 2.49 M",
    "platformDimensions": "1.18 x 2.26 M",
    "gradeability": "25 %",
    "speed": "3.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "200 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT1012AC": {
    "id": "PROD-0000043",
    "modelName": "JCPT1012AC",
    "feet": 32,
    "spec": "\uBC30\uD130\uB9AC, 10.0 M, \uC801\uC7AC 450 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1012AC/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(2021%EB%85%847%EC%9B%9429%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1012AC/4.%EC%A0%9C%EC%9B%90%ED%91%9C(JCPT1012AC).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1012AC/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95JCPT.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10.0 M",
    "platformHeight": "8.0 M",
    "weight": "2,710 Kg",
    "capacityPreExt": "450 kg",
    "machineDimensions": "2.48 x 1.15 x 2.36 M",
    "platformDimensions": "1.15 x 2.27 M",
    "gradeability": "25 %",
    "speed": "5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "337 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "ES2646": {
    "id": "PROD-0000044",
    "modelName": "ES2646",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 9.92 M, \uC801\uC7AC 545 kg",
    "manufacturer": "JLG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/ES2646/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(2022%EB%85%846%EC%9B%9430%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/ES2646/4.%EC%A0%9C%EC%9B%90%ED%91%9C(ES2646).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/ES2646/6.%EC%9E%A5%EB%B9%84%EC%9E%91%EB%8F%99%EB%B2%95%207.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "9.92 M",
    "platformHeight": "7.92 M",
    "weight": "2,401 Kg",
    "capacityPreExt": "545 kg",
    "machineDimensions": "2.28 x 1.17 x 2.4 M",
    "platformDimensions": "1.1 x 2.1 M",
    "gradeability": "30 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "425 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT1212AC": {
    "id": "PROD-0000045",
    "modelName": "JCPT1212AC",
    "feet": 40,
    "spec": "\uBC30\uD130\uB9AC, 12.0 M, \uC801\uC7AC 320 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1212AC/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(2021%EB%85%847%EC%9B%9429%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1212AC/4.%EC%A0%9C%EC%9B%90%ED%91%9C(JCPT1212AC).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1212AC/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95JCPT.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "12.0 M",
    "platformHeight": "10.0 M",
    "weight": "3,060 Kg",
    "capacityPreExt": "320 kg",
    "machineDimensions": "2.48 x 1.15 x 2.49 M",
    "platformDimensions": "2.27 x 1.12 M",
    "gradeability": "25 %",
    "speed": "3.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "207 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS4046": {
    "id": "PROD-0000047",
    "modelName": "GS4046",
    "feet": 40,
    "spec": "\uBC30\uD130\uB9AC, 13.7 M, \uC801\uC7AC 350 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-4046/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9CGS-4046(2021%EB%85%847%EC%9B%948%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-4046/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-4046.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-4046/7.GENIE%20%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95GS-4046.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "13.7 M",
    "platformHeight": "11.9 M",
    "weight": "3,184 Kg",
    "capacityPreExt": "350 kg",
    "machineDimensions": "2.48 x 1.17 x 2.57 M",
    "platformDimensions": "2.26 x 1.16 M",
    "gradeability": "25 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "237 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT1614ACZ": {
    "id": "PROD-0000046",
    "modelName": "JCPT1614ACZ",
    "feet": 53,
    "spec": "\uBC30\uD130\uB9AC, 15.7 M, \uC801\uC7AC 350 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1614ACZ/5.%EC%9D%B8%EC%A6%9D%EC%84%9C(JCPT1614ACZ).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1614ACZ/4.%EC%A0%9C%EC%9B%90%ED%91%9C(JCPT1614ACZ).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1614ACZ/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.7 M",
    "platformHeight": "13.7 M",
    "weight": "3,470 Kg",
    "capacityPreExt": "350 kg",
    "machineDimensions": "2.84 x 1.39 x 2.62 M",
    "platformDimensions": "2.64 x 1.12 M",
    "gradeability": "25 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "237 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "16.0 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "ES1330": {
    "id": "PROD-0000050",
    "modelName": "ES1330",
    "feet": 19,
    "spec": "19ft \uACE0\uC18C\uC791\uC5C5\uB300",
    "manufacturer": "JLG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/ES1330/5.ES1330L%20%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(2020%EB%85%8401%EC%9B%9417%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/ES1330/4.%EC%A0%9C%EC%9B%90%ED%91%9CES1330L.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/ES1330/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95_ES1330L.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "Z-45/25J": {
    "id": "PROD-0000037",
    "modelName": "Z-45/25J",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 15.9 M, \uC801\uC7AC 227 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/Z-45/25J/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C_Z-4525J(2009%EB%85%849%EC%9B%9414%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/Z-45/25J/4.%EC%A0%9C%EC%9B%90%ED%91%9C_Z-4525J.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/Z-45/25J/7.%EC%9E%91%EC%97%85%EB%B0%98%EA%B2%BD%20%EB%B0%8F%20%EC%A0%81%EC%9E%AC%EC%A4%91%EB%9F%89%ED%91%9C_Z-4525J.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.9 M",
    "platformHeight": "13.9 M",
    "weight": "7,400 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "6.83 x 1.79 x 2.0 M",
    "platformDimensions": "1.83 x 0.76 M",
    "gradeability": "30 %",
    "speed": "4.8 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "227 kg",
    "capacityPostExtDeck": "-",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S1412AC+": {
    "id": "PROD-0000034",
    "modelName": "S1412AC+",
    "feet": 46,
    "spec": "\uBC30\uD130\uB9AC, 13.8 M, \uC801\uC7AC 408 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1412AC+/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(HS1401).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1412AC+/4.%EC%A0%9C%EC%9B%90%ED%91%9C(S1412AC+).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1412AC+/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "13.8 M",
    "platformHeight": "11.8 M",
    "weight": "3,250 Kg",
    "capacityPreExt": "408 kg",
    "machineDimensions": "M",
    "platformDimensions": "2.27 x 1.12 M",
    "gradeability": "25 %",
    "speed": "6.0 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "295 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GTBZ16AE": {
    "id": "PROD-0000051",
    "modelName": "GTBZ16AE",
    "feet": 19,
    "spec": "19ft \uACE0\uC18C\uC791\uC5C5\uB300",
    "manufacturer": "SINOBOOM",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS4655": {
    "id": "PROD-0000048",
    "modelName": "GS4655",
    "feet": 46,
    "spec": "\uBC30\uD130\uB9AC, 15.95 M, \uC801\uC7AC 349 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4655/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9CGS-4655(2020%EB%85%846%EC%9B%9418%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4655/4.%EC%A0%9C%EC%9B%90%ED%91%9C(GS-4655).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4655/7.GENIE%20%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.95 M",
    "platformHeight": "13.95 M",
    "weight": "3,701 Kg",
    "capacityPreExt": "349 kg",
    "machineDimensions": "3.11 x 1.41 x 2.77 M",
    "platformDimensions": "2.84 x 1.35 M",
    "gradeability": "25 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "213 kg",
    "capacityPostExtDeck": "136 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS5390RT": {
    "id": "PROD-0000049",
    "modelName": "GS5390RT",
    "feet": 19,
    "spec": "\uB514\uC824, 18 M, \uC801\uC7AC 680 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-5390RT/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-5390(2010%EB%85%849%EC%9B%9429%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-5390RT/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-5390RT.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-5390RT/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95(GS-5390RT).pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uB514\uC824",
    "workingHeight": "18 M",
    "platformHeight": "16.15 M",
    "weight": "7,537 Kg",
    "capacityPreExt": "680 kg",
    "machineDimensions": "4.88 x 2.29 x 3.15 M",
    "platformDimensions": "3.98 x 1.83 M",
    "gradeability": "12 %",
    "speed": "8 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "460 kg",
    "capacityPostExtDeck": "110 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "2632ES": {
    "id": "PROD-0000009",
    "modelName": "2632ES",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "JLG",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT0607DCS": {
    "id": "PROD-0000033",
    "modelName": "JCPT0607DCS",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 5.6 M, \uC801\uC7AC 240 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT0607DCS/5.%EC%9D%B8%EC%A6%9D%EC%84%9CJCPT0607DCS(2016%EB%85%844%EC%9B%9425%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT0607DCS/4.%EC%A0%9C%EC%9B%90%ED%91%9C_JCPT0607DCS.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT0607DCS/7.JCPT0807,0607_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "5.6 M",
    "platformHeight": "3.6 M",
    "weight": "880 Kg",
    "capacityPreExt": "240 kg",
    "machineDimensions": "1.44x 0.76 x 1.90 M",
    "platformDimensions": "1.29x 0.70 M",
    "gradeability": "\xB0 15 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "140 kg",
    "capacityPostExtDeck": "100 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-3246 E-DRIVE": {
    "id": "PROD-0000015",
    "modelName": "GS-3246 E-DRIVE",
    "feet": 38,
    "spec": "11.7M (38ft)",
    "manufacturer": "Genie",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-3246%20E-DRIVE/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-3246(2021%EB%85%842%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-3246%20E-DRIVE/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-3246%20E-Drive.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-3246%20E-DRIVE/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95GS_E-Drive.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "11.7 M",
    "platformHeight": "9.70 M",
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ3215": {
    "id": "PROD-0000003",
    "modelName": "SJ3215",
    "feet": 22,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "6.57 M",
    "platformHeight": "4.57 M",
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-1930": {
    "id": "PROD-0000010",
    "modelName": "GS-1930",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 227 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS1930/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS1930(2021%EB%85%842%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS1930/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-1930.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS1930/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95(GS-1930).pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "7.8 M",
    "platformHeight": "5.8 M",
    "weight": "1226 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "1.83 x 0.77 x 2.16 M",
    "platformDimensions": "1.64 x 0.76 M",
    "gradeability": "25 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "114 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-3246": {
    "id": "PROD-0000014",
    "modelName": "GS-3246",
    "feet": 39,
    "spec": "\uBC30\uD130\uB9AC, 11.8 M, \uC801\uC7AC 205 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS3246/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-3246(2021%EB%85%842%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS3246/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-3246.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS3246/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95GS_E-Drive.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "11.8 M",
    "platformHeight": "9.8 M",
    "weight": "2367 Kg",
    "capacityPreExt": "205 kg",
    "machineDimensions": "2.44 x 1.18 x 2.44 M",
    "platformDimensions": "2.26 x 1.18 M",
    "gradeability": "25 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "113 kg",
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-4047": {
    "id": "PROD-0000016",
    "modelName": "GS-4047",
    "feet": 45,
    "spec": "\uBC30\uD130\uB9AC, 13.7 M, \uC801\uC7AC 350 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4047/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-4047(2013%EB%85%8403%EC%9B%9411%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4047/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-4047.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4047/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95(GS-4047).pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "13.7 M",
    "platformHeight": "11.7 M",
    "weight": "3,260 Kg",
    "capacityPreExt": "350 kg",
    "machineDimensions": "2.48 x 1.19 x 2.54 M",
    "platformDimensions": "2.26 x 1.16 M",
    "gradeability": "25 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "237 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS1930": {
    "id": "PROD-0000018",
    "modelName": "GS1930",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 227 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS1930/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS1930(2021%EB%85%842%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS1930/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-1930.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS1930/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95(GS-1930).pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "7.8 M",
    "platformHeight": "5.8 M",
    "weight": "1226 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "1.83 x 0.77 x 2.16 M",
    "platformDimensions": "1.64 x 0.76 M",
    "gradeability": "25 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "114 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS3246": {
    "id": "PROD-0000020",
    "modelName": "GS3246",
    "feet": 32,
    "spec": "\uBC30\uD130\uB9AC, 11.8 M, \uC801\uC7AC 205 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS3246/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-3246(2021%EB%85%842%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS3246/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-3246.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS3246/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95GS_E-Drive.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "11.8 M",
    "platformHeight": "9.8 M",
    "weight": "2367 Kg",
    "capacityPreExt": "205 kg",
    "machineDimensions": "2.44 x 1.18 x 2.44 M",
    "platformDimensions": "2.26 x 1.18 M",
    "gradeability": "25 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "113 kg",
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "1930ES": {
    "id": "PROD-0000021",
    "modelName": "1930ES",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 7.7 M, \uC801\uC7AC 230 kg",
    "manufacturer": "JLG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1930ES/5.1930ES%20%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(2015%EB%85%8406%EC%9B%9410%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1930ES/4.1930ES%20%EC%A0%9C%EC%9B%90%ED%91%9C.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1930ES/7.1930ES%20%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "7.7 M",
    "platformHeight": "5.7 M",
    "weight": "1,230 Kg",
    "capacityPreExt": "230 kg",
    "machineDimensions": "1.87 x 0.76 x 1.99 M",
    "platformDimensions": "1.87x 0.76 M",
    "gradeability": "\xB0 14 %",
    "speed": "4.8 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "117 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ3226": {
    "id": "PROD-0000011",
    "modelName": "SJ3226",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ4626": {
    "id": "PROD-0000012",
    "modelName": "SJ4626",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "2646ES": {
    "id": "PROD-0000013",
    "modelName": "2646ES",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "JLG",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT1008AC": {
    "id": "PROD-0000025",
    "modelName": "JCPT1008AC",
    "feet": 32,
    "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 230 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1008AC/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9CJCPT1008AC(2021%EB%85%847%EC%9B%9429%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1008AC/4.%20%EC%A0%9C%EC%9B%90%ED%91%9CJCPT1008AC.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1008AC/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95JCPT.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10 M",
    "platformHeight": "8 M",
    "weight": "2,230 Kg",
    "capacityPreExt": "230 kg",
    "machineDimensions": "2.48 x 0.83 x 2.36 M",
    "platformDimensions": "2.27 x 0.81 M",
    "gradeability": "25 %",
    "speed": "5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "117 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS2646": {
    "id": "PROD-0000026",
    "modelName": "GS2646",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 9.92 M, \uC801\uC7AC 454 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS2646/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-2646(2010%EB%85%8412%EC%9B%9429%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS2646/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-2646.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS2646/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95GS_E-Drive.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "9.92 M",
    "platformHeight": "7.92 M",
    "weight": "1,956 Kg",
    "capacityPreExt": "454 kg",
    "machineDimensions": "2.44 x 1.18 x 2.31 M",
    "platformDimensions": "2.26 x 1.18 M",
    "gradeability": "25 %",
    "speed": "3.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "341 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "R1532I": {
    "id": "PROD-0000027",
    "modelName": "R1532I",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 6.6 M, \uC801\uC7AC 275 kg",
    "manufacturer": "JLG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/R1532i/5.%EC%9D%B8%EC%A6%9D%EC%84%9CR1532i(2020%EB%85%8411%EC%9B%9412%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/R1532i/4.%EC%A0%9C%EC%9B%90%ED%91%9C(R1532i).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/R1532i/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "6.6 M",
    "platformHeight": "4.6 M",
    "weight": "1,085 Kg",
    "capacityPreExt": "275 kg",
    "machineDimensions": "1.74 x 0.81 x 1.90 M",
    "platformDimensions": "1.74x 0.81 M",
    "gradeability": "\xB0 14 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "155 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS4047": {
    "id": "PROD-0000028",
    "modelName": "GS4047",
    "feet": 40,
    "spec": "\uBC30\uD130\uB9AC, 13.7 M, \uC801\uC7AC 350 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4047/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS-4047(2013%EB%85%8403%EC%9B%9411%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4047/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-4047.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS4047/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95(GS-4047).pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "13.7 M",
    "platformHeight": "11.7 M",
    "weight": "3,260 Kg",
    "capacityPreExt": "350 kg",
    "machineDimensions": "2.48 x 1.19 x 2.54 M",
    "platformDimensions": "2.26 x 1.16 M",
    "gradeability": "25 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "237 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S0808E": {
    "id": "PROD-0000029",
    "modelName": "S0808E",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 230 kg",
    "manufacturer": "LGMG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S0808E/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(S0808E)2023%EB%85%8412%EC%9B%9414%EC%9D%BC.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S0808E/4.%EC%A0%9C%EC%9B%90%ED%91%9CLGMG(S0808E).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S0808E/7.LGMG%20%EC%8B%9C%EC%A0%80%20%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10 M",
    "platformHeight": "8 M",
    "weight": "2,200 Kg",
    "capacityPreExt": "230 kg",
    "machineDimensions": "2.45 x 0.83 x 2.32 M",
    "platformDimensions": "2.26 x 0.81 M",
    "gradeability": "25 %",
    "speed": "\uBCC0\uB3D9 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "113 kg",
    "capacityPostExtDeck": "117 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "STAR6": {
    "id": "PROD-0000030",
    "modelName": "STAR6",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 5.8 M, \uC801\uC7AC 230 kg",
    "manufacturer": "HAULOTTE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/STAR-6/5.%EC%9D%B8%EC%A6%9D%EC%84%9CSTAR-6(2017%EB%85%849%EC%9B%9421%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/STAR-6/4.%EC%A0%9C%EC%9B%90%ED%91%9CSTAR-6.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/STAR-6/7.STAR6%20%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "5.8 M",
    "platformHeight": "3.8 M",
    "weight": "880 Kg",
    "capacityPreExt": "230 kg",
    "machineDimensions": "1.4 x 0.79 x 1.75 M",
    "platformDimensions": "1.38 x 0.77 M",
    "gradeability": "25 %",
    "speed": "4.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "110 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "1414EPLUS": {
    "id": "PROD-0000031",
    "modelName": "1414EPLUS",
    "feet": 46,
    "spec": "\uBC30\uD130\uB9AC, 15.8 M, \uC801\uC7AC 350 kg",
    "manufacturer": "\uAE30\uC5F0\uB9AC\uD504\uD2B8",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1414E%20Plus/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(1414E%20Plus)2023%EB%85%846%EC%9B%9420%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1414E%20Plus/4.%EC%A0%9C%EC%9B%90%ED%91%9C(1414E%20Plus).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1414E%20Plus/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95_%EC%8B%9C%EB%85%B8%EB%B6%90.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.8 M",
    "platformHeight": "13.8 M",
    "weight": "3,660 Kg",
    "capacityPreExt": "350 kg",
    "machineDimensions": "2.78 x 1.41 x 2.6 M",
    "platformDimensions": "2.64 x 1.3 M",
    "gradeability": "25 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "230 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S1612AC+": {
    "id": "PROD-0000032",
    "modelName": "S1612AC+",
    "feet": 53,
    "spec": "\uBC30\uD130\uB9AC, 15.7 M, \uC801\uC7AC 363 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1612AC+/5.%EC%9D%B8%EC%A6%9D%EC%84%9CS1612AC+(2025%EB%85%844%EC%9B%9415%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1612AC+/4.%EC%A0%9C%EC%9B%90%ED%91%9C.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1612AC+/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-31T09:27:54.700Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.7 M",
    "platformHeight": "13.7 M",
    "weight": "3,520 Kg",
    "capacityPreExt": "363 kg",
    "machineDimensions": "2.84 x 1.25 x 2.62 M",
    "platformDimensions": "2.64 x 1.12 M",
    "gradeability": "25 %",
    "speed": "6 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "227 kg",
    "capacityPostExtDeck": "136 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "OPTIMUM 8": {
    "id": "PROD-0000001",
    "modelName": "OPTIMUM 8",
    "feet": 20,
    "spec": "\uBC30\uD130\uB9AC, 7.77 M, \uC801\uC7AC 230 kg",
    "manufacturer": "HAULOTTE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/OPTIMUM%208/OPTIMUM8%20%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/OPTIMUM%208/OPTIMUM%208%20%EC%A0%9C%EC%9B%90%ED%91%9C.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/OPTIMUM%208/OPTIMUM%20%208%20%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95.pdf",
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "7.77 M",
    "platformHeight": "5.77 M",
    "weight": "1,590 Kg",
    "capacityPreExt": "230 kg",
    "machineDimensions": "1.9 x 0.79 x 1.88 M",
    "platformDimensions": "2.59 x 0.74 M",
    "gradeability": "25 %",
    "speed": "4.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "120 kg",
    "capacityPostExtDeck": "110 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ319": {
    "id": "PROD-0000004",
    "modelName": "SJ319",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS2032": {
    "id": "PROD-0000005",
    "modelName": "GS2032",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "GENIE",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ3220": {
    "id": "PROD-0000006",
    "modelName": "SJ3220",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ4620": {
    "id": "PROD-0000007",
    "modelName": "SJ4620",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "COMPACT8": {
    "id": "PROD-0000008",
    "modelName": "COMPACT8",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "HAULOTTE",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT0807AC": {
    "id": "PROD-0000002",
    "modelName": "JCPT0807AC",
    "feet": 20,
    "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 230 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT0807AC/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C_JCPT0807AC(2021%EB%85%847%EC%9B%9429%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT0807AC/4.%EC%A0%9C%EC%9B%90%ED%91%9C_JCPT0807AC.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT0807AC/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "7.8 M",
    "platformHeight": "6 M",
    "weight": "1,630 Kg",
    "capacityPreExt": "230 kg",
    "machineDimensions": "1.86 x 0.76 x 2.02 M",
    "platformDimensions": "1.67 x 0.74 M",
    "gradeability": "25 %",
    "speed": "4.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "117 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "3246ES": {
    "id": "PROD-0000017",
    "modelName": "3246ES",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "JLG",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SJ4632": {
    "id": "PROD-0000019",
    "modelName": "SJ4632",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "SKYJACK",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SKY-800": {
    "id": "prod-1",
    "modelName": "SKY-800",
    "feet": 8,
    "spec": "\uBC30\uD130\uB9AC\uD615, 8m",
    "manufacturer": "SKY",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-10T08:29:02.594Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GENIE-1000": {
    "id": "prod-2",
    "modelName": "GENIE-1000",
    "feet": 10,
    "spec": "\uB514\uC824\uD615, 10m",
    "manufacturer": "GENIE",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-10T08:29:02.595Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "LIFT-1200": {
    "id": "prod-3",
    "modelName": "LIFT-1200",
    "feet": 12,
    "spec": "\uC804\uB3D9\uD615, 12m",
    "manufacturer": "LIFT",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-10T08:29:02.595Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-1930 E": {
    "id": "PROD-0000036",
    "modelName": "GS-1930 E",
    "feet": 19,
    "spec": "\uBC30\uD130\uB9AC, 7.8 M, \uC801\uC7AC 227 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "7.8 M",
    "platformHeight": "5.8 M",
    "weight": "1,498 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "1.83 x 0.76 x 2.10 M",
    "platformDimensions": "1.63 x 0.76 M",
    "gradeability": "25 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "114 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT1614AC": {
    "id": "PROD-0000024",
    "modelName": "JCPT1614AC",
    "feet": 19,
    "spec": "\uC218\uC9C1\uD615",
    "manufacturer": "DINGLI",
    "safetyCertUrl": null,
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1614AC/4.%EC%A0%9C%EC%9B%90%ED%91%9C(JCPT1614ACZ).pdf",
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": null,
    "platformHeight": null,
    "weight": null,
    "capacityPreExt": "230 kg",
    "machineDimensions": null,
    "platformDimensions": null,
    "gradeability": null,
    "speed": null,
    "asContact": "031-334-5296",
    "capacityPostExtMain": null,
    "capacityPostExtDeck": null,
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JCPT1412AC": {
    "id": "PROD-0000022",
    "modelName": "JCPT1412AC",
    "feet": 45,
    "spec": "\uBC30\uD130\uB9AC, 13.8 M, \uC801\uC7AC 320 kg",
    "manufacturer": "DINGLI",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1412AC/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C_HL1415.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1412AC/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C_HL1404.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JCPT1412AC/7.JCPT_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%20%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "13.8 M",
    "platformHeight": "11.8 M",
    "weight": "2,990 Kg",
    "capacityPreExt": "320 kg",
    "machineDimensions": "2.84 x 1.19 x 2.62 M",
    "platformDimensions": "2.48 x 2.62 M",
    "gradeability": "25 %",
    "speed": "3.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "207 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-3246 E": {
    "id": "PROD-0000040",
    "modelName": "GS-3246 E",
    "feet": 32,
    "spec": "\uBC30\uD130\uB9AC, 11.7 M, \uC801\uC7AC 318 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": null,
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-3246%20E/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS-3246%20E-Drive.pdf",
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "11.7 M",
    "platformHeight": "9.7 M",
    "weight": "2,374 Kg",
    "capacityPreExt": "318 kg",
    "machineDimensions": "2.44 x 1.17 x 2.39 M",
    "platformDimensions": "2.26 x 1.16 M",
    "gradeability": "25 %",
    "speed": "3.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "205 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-1330m": {
    "id": "PROD-0000054",
    "modelName": "GS-1330m",
    "feet": 13,
    "spec": "\uBC30\uD130\uB9AC, 5.7 M, \uC801\uC7AC 227 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-1330m/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C%20GS-1330m(2019%EB%85%843%EC%9B%9419%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-1330m/4.%20%EC%A0%9C%EC%9B%90%ED%91%9C%20GS-1330m.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-1330m/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95(GS-1330).pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:55:54.428Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "5.7 M",
    "platformHeight": "3.9 M",
    "weight": "902 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "1.41 x 0.78 x 1.83 M",
    "platformDimensions": "1.26 x 0.67 M",
    "gradeability": "25 %",
    "speed": "4 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "136 kg",
    "capacityPostExtDeck": "91 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-4069DC": {
    "id": "PROD-0000058",
    "modelName": "GS-4069DC",
    "feet": 40,
    "spec": "\uBC30\uD130\uB9AC, 14.3 M, \uC801\uC7AC 363 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-4069DC/5.%EC%9D%B8%EC%A6%9D%EC%84%9CGS4069DC(2013%EB%85%847%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-4069DC/4.%EC%A0%9C%EC%9B%90%ED%91%9CGS4069DC.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-4069DC/7.GS4069DC%20%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:55:57.407Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "14.3 M",
    "platformHeight": "12.3 M",
    "weight": "4,933 Kg",
    "capacityPreExt": "363 kg",
    "machineDimensions": "3.12 x 1.6 x 2.74 M",
    "platformDimensions": "2.79 x 1.6 M",
    "gradeability": "19 \xB0 %",
    "speed": "7.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "250 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "4069LE": {
    "id": "PROD-0000023",
    "modelName": "4069LE",
    "feet": 40,
    "spec": "\uBC30\uD130\uB9AC, 14 M, \uC801\uC7AC 360 kg",
    "manufacturer": "JLG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/4069LE/5.%EC%95%88%EC%A0%84%EC%A0%90%EA%B2%80%EC%9D%B8%EC%A6%9D%EC%84%9C_J4036.pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/4069LE/4.%EC%A0%9C%EC%9B%90%ED%91%9C_4069LE.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/4069LE/7.4069LE%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95(JLG-4069).pdf",
    "isActive": true,
    "createdAt": "2026-07-25T08:54:45.017Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "14 M",
    "platformHeight": "12 M",
    "weight": "4,790 Kg",
    "capacityPreExt": "360 kg",
    "machineDimensions": "3.15 x 1.75 x 2.84 M",
    "platformDimensions": "2.92x 1.65 M",
    "gradeability": "\xB0 19 %",
    "speed": "4.8 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "247 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-2632 E": {
    "id": "PROD-0000055",
    "modelName": "GS-2632 E",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 227 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": null,
    "specSheetUrl": null,
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-27T07:55:56.003Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10 M",
    "platformHeight": "8 M",
    "weight": "2,145 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "2.44 x 0.82 x 2.31 M",
    "platformDimensions": "2.26 x 0.84 M",
    "gradeability": "25 %",
    "speed": "3.2 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "114 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "GS-2646 E": {
    "id": "PROD-0000056",
    "modelName": "GS-2646 E",
    "feet": 26,
    "spec": "\uBC30\uD130\uB9AC, 10 M, \uC801\uC7AC 454 kg",
    "manufacturer": "GENIE",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-2646%20E/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9CGS-2646%20E-Drive(2021%EB%85%842%EC%9B%949%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-2646%20E/4.%EC%A0%9C%EC%9B%90%ED%91%9C%20GS-2646%20E-Drive.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/GS-2646%20E/7.%EB%B9%84%EC%83%81%20%ED%95%98%EA%B0%95%EB%B2%95GS_E-Drive.pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:55:56.346Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "10 M",
    "platformHeight": "8 M",
    "weight": "1,997 Kg",
    "capacityPreExt": "454 kg",
    "machineDimensions": "2.44 x 1.17 x 2.26 M",
    "platformDimensions": "2.26 x 1.15 M",
    "gradeability": "25 %",
    "speed": "3.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "341 kg",
    "capacityPostExtDeck": "113 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "MS10.4": {
    "id": "PROD-0000074",
    "modelName": "MS10.4",
    "feet": 34,
    "spec": "AC 110~220V, 11.9 M, \uC801\uC7AC 159 kg",
    "manufacturer": "MANLIFT",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/MS10.4/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C_MS-10.4(2009%EB%85%846%EC%9B%943%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/MS10.4/4.%EC%A0%9C%EC%9B%90%ED%91%9C(MS-10.4).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/MS10.4/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95(MS-10.4).pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:56:01.375Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "AC 110~220V",
    "workingHeight": "11.9 M",
    "platformHeight": "10.06 M",
    "weight": "389 Kg",
    "capacityPreExt": "159 kg",
    "machineDimensions": "1.46 x 0.74 x 1.97 M",
    "platformDimensions": "0.68 x 0.66 M",
    "gradeability": "-",
    "speed": "-",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "159 kg",
    "capacityPostExtDeck": "-",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "JLG-E600JP": {
    "id": "PROD-0000067",
    "modelName": "JLG-E600JP",
    "feet": 60,
    "spec": "\uBC30\uD130\uB9AC, 20.1 M, \uC801\uC7AC 227 kg",
    "manufacturer": "JLG",
    "safetyCertUrl": null,
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/JLG-E600JP/4.%EC%9E%A5%EB%B9%84%EC%A0%9C%EC%9B%90%ED%91%9C%20JLG%20E600JP.pdf",
    "emergencyGuideUrl": null,
    "isActive": true,
    "createdAt": "2026-08-27T07:55:59.788Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "20.1 M",
    "platformHeight": "18.3 M",
    "weight": "7,663 Kg",
    "capacityPreExt": "227 kg",
    "machineDimensions": "10.16 x 2.41 x 2.54 M",
    "platformDimensions": "1.83 x 0.76 M",
    "gradeability": "30 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "227 kg",
    "capacityPostExtDeck": "-",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "1532R": {
    "id": "PROD-0000063",
    "modelName": "1532R",
    "feet": 15,
    "spec": "\uBC30\uD130\uB9AC, 6.6 M, \uC801\uC7AC 270 kg",
    "manufacturer": "JLG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1532R/5.%EC%9D%B8%EC%A6%9D%EC%84%9C1532R(2018%EB%85%843%EC%9B%9430%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1532R/4.%EC%A0%9C%EC%9B%90%ED%91%9C1532R.pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/1532R/7.1532R_%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:55:58.890Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "6.6 M",
    "platformHeight": "4.6 M",
    "weight": "1,079 Kg",
    "capacityPreExt": "270 kg",
    "machineDimensions": "1.74 x 0.81 x 1.90 M",
    "platformDimensions": "1.74x 0.81 M",
    "gradeability": "\xB0 14 %",
    "speed": "3 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "150 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "SR1623E": {
    "id": "PROD-0000073",
    "modelName": "SR1623E",
    "feet": 53,
    "spec": "\uBC30\uD130\uB9AC, 17.9 M, \uC801\uC7AC 680 kg",
    "manufacturer": "LGMG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/SR1623E/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9CSR1623E(2024.07.30).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/SR1623E/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9CSR1623E(2024.07.30).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/SR1623E/7.%ED%95%98%EB%B6%80%ED%95%98%EA%B0%95(SR1623E).pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:56:01.196Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "17.9 M",
    "platformHeight": "15.9 M",
    "weight": "8,200 Kg",
    "capacityPreExt": "680 kg",
    "machineDimensions": "4.9 x 2.3 x 3.23 M",
    "platformDimensions": "3.98 x 1.83 M",
    "gradeability": "40 %",
    "speed": "\uBCC0\uB3D9 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "450 kg",
    "capacityPostExtDeck": "230 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "S1413E": {
    "id": "PROD-0000072",
    "modelName": "S1413E",
    "feet": 45,
    "spec": "\uBC30\uD130\uB9AC, 15.8 M, \uC801\uC7AC 320 kg",
    "manufacturer": "LGMG",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1413E/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(S1413E).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1413E/4.%EC%A0%9C%EC%9B%90%ED%91%9C(S1413E).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/S1413E/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95.pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:56:01.032Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "\uBC30\uD130\uB9AC",
    "workingHeight": "15.8 M",
    "platformHeight": "13.8 M",
    "weight": "3,500 Kg",
    "capacityPreExt": "320 kg",
    "machineDimensions": "2.8 x 1.3 x 2.74 M",
    "platformDimensions": "2.64 x 1.12 M",
    "gradeability": "25 %",
    "speed": "4.5 Km/h",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "200 kg",
    "capacityPostExtDeck": "120 kg",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  },
  "MS11.8": {
    "id": "PROD-0000075",
    "modelName": "MS11.8",
    "feet": 38,
    "spec": "AC 110~220V, 13.8 M, \uC801\uC7AC 136 kg",
    "manufacturer": "MANLIFT",
    "safetyCertUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/MS11.8/5.%EC%95%88%EC%A0%84%EC%9D%B8%EC%A6%9D%EC%84%9C(2014%EB%85%844%EC%9B%943%EC%9D%BC).pdf",
    "specSheetUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/MS11.8/4.%EC%A0%9C%EC%9B%90%ED%91%9C(MS-11.8).pdf",
    "emergencyGuideUrl": "https://pub-a2fd3c2ae0cc450b8ebe34baf1b051e1.r2.dev/Eq_doc/MS11.8/7.%EB%B9%84%EC%83%81%ED%95%98%EA%B0%95%EC%9E%91%EB%8F%99%EB%B2%95(MS-11.8).pdf",
    "isActive": true,
    "createdAt": "2026-08-27T07:56:01.549Z",
    "updatedAt": "2026-08-31T09:42:50.483Z",
    "powerSource": "AC 110~220V",
    "workingHeight": "13.8 M",
    "platformHeight": "11.8 M",
    "weight": "458 Kg",
    "capacityPreExt": "136 kg",
    "machineDimensions": "1.53 x 0.74 x 1.97 M",
    "platformDimensions": "0.68 x 0.66 M",
    "gradeability": "-",
    "speed": "-",
    "asContact": "031-334-5296",
    "capacityPostExtMain": "136 kg",
    "capacityPostExtDeck": "-",
    "maxWindSpeed": "12.5 m/s \uC774\uB0B4",
    "maxHeightCapacity": null,
    "safetyCertDate": null
  }
};

// src/services/migrationEngine.ts
var TABLE_COLUMNS = {
  products: [
    "id",
    "modelName",
    "feet",
    "spec",
    "manufacturer",
    "powerSource",
    "workingHeight",
    "platformHeight",
    "weight",
    "capacityPreExt",
    "capacityPostExtMain",
    "capacityPostExtDeck",
    "machineDimensions",
    "platformDimensions",
    "gradeability",
    "speed",
    "asContact",
    "maxWindSpeed",
    "maxHeightCapacity",
    "safetyCertDate",
    "safetyCertUrl",
    "specSheetUrl",
    "emergencyGuideUrl",
    "isActive",
    "createdAt",
    "updatedAt"
  ],
  vendors: [
    "id",
    "name",
    "type",
    "contact",
    "email",
    "address",
    "bankName",
    "accountNumber",
    "accountHolder",
    "memo",
    "isActive",
    "createdAt",
    "updatedAt"
  ],
  customers: [
    "id",
    "name",
    "bizRegNo",
    "representative",
    "repContact",
    "repEmail",
    "address",
    "billingDay",
    "paymentDueDay",
    "paymentTermDays",
    "memo",
    "isActive",
    "createdAt",
    "updatedAt"
  ],
  customer_sites: [
    "id",
    "customerId",
    "name",
    "address",
    "contactName",
    "contact",
    "email",
    "createdAt",
    "updatedAt"
  ],
  customer_contacts: [
    "id",
    "customerId",
    "name",
    "position",
    "phone",
    "email",
    "isPrimary",
    "createdAt",
    "updatedAt"
  ],
  assets: [
    "id",
    "modelName",
    "assetNo",
    "serialNo",
    "manufacturer",
    "manufactureYear",
    "ownerType",
    "status",
    "acquisitionDate",
    "acquisitionPrice",
    "depreciationMonths",
    "residualValueRate",
    "accumDepreciation",
    "bookValue",
    "vendorId",
    "supplier",
    "rentStart",
    "rentEnd",
    "monthlyRentFee",
    "dailyRentFee",
    "actualRentReturnDate",
    "currentCustomerId",
    "currentSiteId",
    "contractStart",
    "contractEnd",
    "cumRentalFee",
    "cumRepairCost",
    "note",
    "memo",
    "createdAt",
    "updatedAt"
  ],
  contracts: [
    "id",
    "contractNo",
    "customerId",
    "salespersonId",
    "contactId",
    "siteId",
    "billingDay",
    "paymentDueDay",
    "lateInterestRate",
    "status",
    "startDate",
    "endDate",
    "successorContractId",
    "predecessorContractId",
    "predecessorContractNo",
    "predecessorCustomerId",
    "predecessorCustomerName",
    "lastBillingDate",
    "lastBilledPeriodStart",
    "lastBilledPeriodEnd",
    "lastBilledYm",
    "billingCount",
    "driveFolderId",
    "createdAt",
    "updatedAt"
  ],
  contract_history: [
    "id",
    "contractId",
    "changeType",
    "changedBy",
    "description",
    "snapshot",
    "createdAt"
  ],
  contract_assets: [
    "id",
    "contractId",
    "assetId",
    "expectedModel",
    "monthlyRentalFee",
    "dailyRentalFee",
    "startDate",
    "endDate",
    "createdAt",
    "updatedAt"
  ],
  external_leases: [
    "id",
    "leaseNo",
    "vendorId",
    "contractId",
    "modelName",
    "assetNo",
    "serialNo",
    "rentStart",
    "rentEnd",
    "monthlyRentFee",
    "dailyRentFee",
    "actualRentReturnDate",
    "memo",
    "createdAt",
    "updatedAt"
  ],
  deliveries: [
    "id",
    "deliveryNo",
    "type",
    "contractId",
    "contractAssetId",
    "customerId",
    "siteId",
    "assetId",
    "assetNo",
    "modelName",
    "dispatchDate",
    "timeSlot",
    "status",
    "transportCompany",
    "transportCost",
    "driverName",
    "driverContact",
    "vehicleNumber",
    "isReturn",
    "returnDate",
    "memo",
    "createdBy",
    "createdAt",
    "updatedAt"
  ],
  outbound_inspections: [
    "id",
    "deliveryId",
    "contractId",
    "assetId",
    "status",
    "inspectorId",
    "checkedItems",
    "photos",
    "notes",
    "approvedAt",
    "approvedBy",
    "createdAt",
    "updatedAt"
  ],
  asset_inout_logs: [
    "id",
    "assetId",
    "assetNo",
    "modelName",
    "type",
    "eventDate",
    "contractId",
    "customerId",
    "siteId",
    "deliveryId",
    "details",
    "performedBy",
    "createdAt",
    "updatedAt"
  ],
  billings: [
    "id",
    "billingNo",
    "customerId",
    "billingYm",
    "billingDate",
    "dueDate",
    "totalAmount",
    "paidAmount",
    "status",
    "note",
    "driveFileId",
    "createdAt",
    "updatedAt"
  ],
  billing_details: [
    "id",
    "billingId",
    "contractAssetId",
    "assetId",
    "itemName",
    "quantity",
    "unitPrice",
    "amount",
    "description",
    "internalDescription",
    "displayName",
    "createdAt",
    "updatedAt"
  ],
  purchase_billings: [
    "id",
    "vendorId",
    "billingYm",
    "totalAmount",
    "paidAmount",
    "status",
    "note",
    "createdAt",
    "updatedAt"
  ],
  purchase_billing_details: [
    "id",
    "purchaseBillId",
    "assetId",
    "contractId",
    "expenseType",
    "itemName",
    "amount",
    "createdAt",
    "updatedAt"
  ],
  receivables: [
    "id",
    "customerId",
    "siteId",
    "contractId",
    "type",
    "amount",
    "paidAmount",
    "status",
    "issueDate",
    "dueDate",
    "description",
    "createdAt",
    "updatedAt"
  ],
  reconciliation_reports: [
    "id",
    "migration_run_at",
    "asset_count_excel",
    "asset_count_db",
    "asset_count_match",
    "billing_total_excel",
    "billing_total_db",
    "billing_total_diff",
    "billing_total_match",
    "details_header_sum",
    "details_detail_sum",
    "details_sum_diff",
    "details_sum_match",
    "lease_total_excel",
    "lease_total_db",
    "lease_total_match",
    "lifecycle_contracts",
    "lifecycle_deliveries",
    "lifecycle_match",
    "orphan_contracts",
    "orphan_assets",
    "orphan_is_clean",
    "all_passed",
    "memo",
    "created_at"
  ]
};
function sanitizeNumber(val) {
  if (typeof val === "number") return isNaN(val) ? 0 : Math.round(val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}
function sanitizeExcelDate(val) {
  if (!val || val === "\uBBF8\uC815" || val === "-" || val === "\uACF5\uB780") return null;
  if (typeof val === "number") {
    const date = new Date(Math.round((val - 25569) * 86400 * 1e3));
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  }
  const str = String(val).trim().replace(/\./g, "-");
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const parts = str.split("-");
    const y = parts[0];
    const m = parts[1].padStart(2, "0");
    const d2 = parts[2].padStart(2, "0");
    return `${y}-${m}-${d2}`;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}
function sanitizeModelName(m) {
  if (!m) return "";
  return String(m).trim().replace(/\s+/g, " ").toUpperCase();
}
function parseClosingDay(dayStr) {
  if (!dayStr) return 30;
  if (typeof dayStr === "number") return Math.min(31, Math.max(1, dayStr));
  const s = String(dayStr).trim();
  if (s.includes("\uB9D0\uC77C") || s.includes("\uB9D0")) return 30;
  const match = s.match(/(\d+)/);
  if (match) {
    const n = parseInt(match[1], 10);
    return isNaN(n) ? 30 : Math.min(31, Math.max(1, n));
  }
  return 30;
}
function parsePaymentDueTerm(rawStr) {
  const DEFAULT = { paymentDueDay: 30, paymentTermDays: null };
  if (!rawStr) return DEFAULT;
  const s = String(rawStr).trim();
  if (!s) return DEFAULT;
  if (s.includes("\uB9D0\uC77C") || s === "\uC775\uC6D4\uB9D0" || s === "\uB9D0") {
    return { paymentDueDay: 30, paymentTermDays: null };
  }
  const numMatch = s.match(/(\d+)/);
  if (!numMatch) return DEFAULT;
  const n = parseInt(numMatch[1], 10);
  if (isNaN(n)) return DEFAULT;
  if (s.includes("\uC775\uC6D4") || s.includes("\uC775\uC775\uC6D4")) {
    return { paymentDueDay: Math.min(31, Math.max(1, n)), paymentTermDays: null };
  }
  if (n <= 31) {
    return { paymentDueDay: n, paymentTermDays: null };
  } else {
    return { paymentDueDay: null, paymentTermDays: n };
  }
}
function calcDueDate(billingDateStr, paymentDueDay, paymentTermDays) {
  if (!billingDateStr) return billingDateStr;
  const billingDate = new Date(billingDateStr);
  if (paymentTermDays != null && paymentTermDays > 0) {
    const due = new Date(billingDate);
    due.setDate(due.getDate() + paymentTermDays);
    return due.toISOString().slice(0, 10);
  }
  const dueDay = paymentDueDay ?? 30;
  const nextMonth = new Date(billingDate.getFullYear(), billingDate.getMonth() + 1, 1);
  const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
  const actualDay = Math.min(dueDay, lastDayOfNextMonth);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(actualDay).padStart(2, "0")}`;
}
function extractSiteNameAndMemo(rawSite) {
  if (!rawSite) return { cleanSiteName: "\uAE30\uBCF8\uD604\uC7A5", dispatchMemo: "" };
  const str = String(rawSite).trim();
  const memoMatch = str.match(/\((.*?)\)/);
  let dispatchMemo = memoMatch ? memoMatch[1] : "";
  let cleanSiteName = str.replace(/\(.*?\)/g, "").trim();
  if (!cleanSiteName) cleanSiteName = str;
  return { cleanSiteName, dispatchMemo };
}
function extractContactPosition(rawName) {
  if (!rawName) return { name: "", position: "\uB2F4\uB2F9\uC790" };
  const str = String(rawName).trim();
  const posList = ["\uB300\uD45C", "\uC774\uC0AC", "\uBCF8\uBD80\uC7A5", "\uBD80\uC7A5", "\uCC28\uC7A5", "\uACFC\uC7A5", "\uB300\uB9AC", "\uC8FC\uC784", "\uC0AC\uC6D0", "\uC18C\uC7A5", "\uBC18\uC7A5", "\uD300\uC7A5", "\uAE30\uC0AC", "\uC2E4\uC7A5"];
  for (const p of posList) {
    if (str.endsWith(p)) {
      const pureName = str.slice(0, -p.length).trim();
      if (pureName.length >= 2) return { name: pureName, position: p };
    }
    const match = str.match(new RegExp(`^(.*?)\\s*(${p})$`));
    if (match) return { name: match[1].trim(), position: match[2] };
  }
  return { name: str, position: "\uB2F4\uB2F9\uC790" };
}
function inferMakerFromModel(m) {
  if (m.startsWith("ES") || m.startsWith("1930ES") || m.startsWith("1230ES") || m.startsWith("ES1330") || m.startsWith("2632ES")) return "JLG";
  if (m.startsWith("GS") || m.startsWith("Z-")) return "Genie";
  if (m.startsWith("SJ")) return "SKYJACK";
  if (m.startsWith("GTJZ") || m.startsWith("GTBZ") || m.startsWith("S08") || m.startsWith("S10") || m.startsWith("S12") || m.startsWith("S14") || m.startsWith("S16") || m.startsWith("1414E")) return "SINOBOOM";
  if (m.startsWith("STAR") || m.startsWith("OPTIMUM")) return "Haulotte";
  if (m.startsWith("JCPT")) return "Dingli";
  return "\uAE30\uD0C0\uC81C\uC870\uC0AC";
}
function inferFeetFromModel(m, heightM = 0) {
  if (heightM > 0) return Math.round(heightM * 3.28084);
  if (m.includes("1930") || m.includes("1330") || m.includes("1432") || m.includes("3215") || m.includes("0608")) return 19;
  if (m.includes("2646") || m.includes("2632") || m.includes("0812") || m.includes("0808") || m.includes("3219")) return 26;
  if (m.includes("3246") || m.includes("1012") || m.includes("1008")) return 32;
  if (m.includes("4047") || m.includes("4046") || m.includes("1212")) return 40;
  if (m.includes("4655") || m.includes("1412") || m.includes("1414")) return 46;
  if (m.includes("1612") || m.includes("1614")) return 53;
  return 19;
}
function parseInitialExcelWorkbook(fileBuffer, users) {
  let wb;
  if (fileBuffer.Sheets) {
    wb = fileBuffer;
  } else {
    wb = XLSX.read(fileBuffer, { type: "array" });
  }
  const nowIso2 = (/* @__PURE__ */ new Date()).toISOString();
  const kimDongwoo = users?.find(
    (u) => u.name?.includes("\uAE40\uB3D9\uC6B0") || u.name?.replace(/\s/g, "").includes("\uAE40\uB3D9\uC6B0")
  );
  const kimGwanju = users?.find(
    (u) => u.name?.includes("\uAE40\uAD00\uC8FC") || u.name?.replace(/\s/g, "").includes("\uAE40\uAD00\uC8FC")
  );
  const MIGRATION_SALESPERSON_ID = kimDongwoo?.id ?? null;
  const MIGRATION_INSPECTOR_ID = kimGwanju?.id ?? "SYS-MIGRATED";
  const productMap = /* @__PURE__ */ new Map();
  const vendorMap = /* @__PURE__ */ new Map();
  const customerMap = /* @__PURE__ */ new Map();
  const siteMap = /* @__PURE__ */ new Map();
  const contactMap = /* @__PURE__ */ new Map();
  Object.values(PRESET_PRODUCT_SPECS).forEach((spec) => {
    productMap.set(spec.modelName, {
      id: spec.id || `PROD-${String(productMap.size + 1).padStart(7, "0")}`,
      modelName: spec.modelName,
      feet: spec.feet || 19,
      spec: spec.spec || `${spec.feet || 19}ft \uACE0\uC18C\uC791\uC5C5\uB300`,
      manufacturer: spec.manufacturer || "\uAE30\uD0C0\uC81C\uC870\uC0AC",
      powerSource: spec.powerSource || "\uBC30\uD130\uB9AC",
      workingHeight: spec.workingHeight || null,
      platformHeight: spec.platformHeight || null,
      weight: spec.weight || null,
      capacityPreExt: spec.capacityPreExt || "230 kg",
      capacityPostExtMain: spec.capacityPostExtMain || null,
      capacityPostExtDeck: spec.capacityPostExtDeck || null,
      machineDimensions: spec.machineDimensions || null,
      platformDimensions: spec.platformDimensions || null,
      gradeability: spec.gradeability || null,
      speed: spec.speed || null,
      asContact: spec.asContact || "031-334-5296",
      maxWindSpeed: spec.maxWindSpeed || "12.5 m/s \uC774\uB0B4",
      maxHeightCapacity: spec.maxHeightCapacity || null,
      safetyCertDate: spec.safetyCertDate || null,
      specSheetUrl: spec.specSheetUrl || null,
      safetyCertUrl: spec.safetyCertUrl || null,
      emergencyGuideUrl: spec.emergencyGuideUrl || null,
      isActive: true,
      createdAt: nowIso2,
      updatedAt: nowIso2
    });
  });
  const wsAsset = wb.Sheets["\uBCF4\uC720\uC790\uC0B0\uD604\uD669"];
  const rawAssetRows = wsAsset ? XLSX.utils.sheet_to_json(wsAsset, { header: 1, defval: null }).slice(4) : [];
  const assetMap = /* @__PURE__ */ new Map();
  let assetSeq = 1;
  rawAssetRows.forEach((r) => {
    if (!r) return;
    const rawModel = r[1];
    const rawAssetNo = r[4];
    if (!rawModel && !rawAssetNo) return;
    const modelName = sanitizeModelName(rawModel) || "ES1330L";
    const assetNo = String(rawAssetNo || `TEMP-${assetSeq}`).trim().toUpperCase();
    const maker = r[7] ? String(r[7]).trim() : inferMakerFromModel(modelName);
    const supplier = r[8] ? String(r[8]).trim() : "";
    const heightM = typeof r[6] === "number" ? r[6] : parseFloat(String(r[6] || "5.8")) || 5.8;
    const feet = inferFeetFromModel(modelName, heightM);
    const acqDate = sanitizeExcelDate(r[9]) || "2025-01-01";
    const acqPrice = sanitizeNumber(r[10]) || 118e5;
    const memo = r[16] ? String(r[16]).trim() : "";
    if (!productMap.has(modelName)) {
      productMap.set(modelName, {
        id: `PROD-${String(productMap.size + 1).padStart(7, "0")}`,
        modelName,
        feet,
        spec: `${heightM}M (${feet}ft)`,
        manufacturer: maker,
        powerSource: "\uBC30\uD130\uB9AC",
        workingHeight: `${heightM} M`,
        platformHeight: `${(heightM - 2).toFixed(2)} M`,
        asContact: "031-334-5296",
        maxWindSpeed: "12.5 m/s \uC774\uB0B4",
        capacityPreExt: "230 kg",
        isActive: true,
        createdAt: nowIso2,
        updatedAt: nowIso2
      });
    }
    if (supplier && !vendorMap.has(supplier)) {
      vendorMap.set(supplier, {
        id: `VEND-${String(vendorMap.size + 1).padStart(7, "0")}`,
        name: supplier,
        type: "OTHER",
        isActive: true,
        createdAt: nowIso2,
        updatedAt: nowIso2
      });
    }
    const assetId = `ASSET-${String(assetSeq++).padStart(7, "0")}`;
    const assetEntity = {
      id: assetId,
      modelName,
      assetNo,
      serialNo: r[3] ? String(r[3]).trim() : "",
      manufacturer: maker,
      manufactureYear: r[5] ? String(r[5]).trim() : "2025\uB144",
      ownerType: "OWNED",
      status: "AVAILABLE",
      acquisitionDate: acqDate,
      acquisitionPrice: acqPrice,
      depreciationMonths: 96,
      residualValueRate: 10,
      accumDepreciation: 0,
      // → 자산 확정 단계에서 덮어씀
      bookValue: acqPrice,
      // → 자산 확정 단계에서 덮어씀
      cumRentalFee: 0,
      cumRepairCost: 0,
      supplier,
      vendorId: supplier && vendorMap.has(supplier) ? vendorMap.get(supplier).id : null,
      currentCustomerId: null,
      currentSiteId: null,
      contractStart: null,
      contractEnd: null,
      memo,
      createdAt: nowIso2,
      updatedAt: nowIso2
    };
    assetMap.set(assetNo, assetEntity);
  });
  const wsCust = wb.Sheets["\uAC70\uB798\uCC98\uC815\uBCF4\uD604\uD669"];
  const rawCustRows = wsCust ? XLSX.utils.sheet_to_json(wsCust, { header: 1, defval: null }).slice(2) : [];
  let custSeq = 1;
  let siteSeq = 1;
  let contactSeq = 1;
  rawCustRows.forEach((r) => {
    if (!r) return;
    const rawCustName = r[1];
    if (!rawCustName) return;
    const custName = normalizeCustomerName(rawCustName);
    let custEntity = customerMap.get(custName);
    if (!custEntity) {
      custEntity = {
        id: `CUST-${String(custSeq++).padStart(7, "0")}`,
        name: custName,
        bizRegNo: r[2] ? String(r[2]).trim() : "",
        representative: r[3] ? String(r[3]).trim() : "",
        repContact: r[7] ? String(r[7]).trim() : "",
        repEmail: r[8] ? String(r[8]).trim() : "",
        address: r[4] ? String(r[4]).trim() : "",
        billingDay: 30,
        paymentDueDay: 15,
        memo: "",
        isActive: true,
        createdAt: nowIso2,
        updatedAt: nowIso2
      };
      customerMap.set(custName, custEntity);
    }
    const rawSite = r[5] ? String(r[5]).trim() : "";
    if (rawSite) {
      const { cleanSiteName } = extractSiteNameAndMemo(rawSite);
      const siteKey = `${custEntity.id}_${cleanSiteName}`;
      if (!siteMap.has(siteKey)) {
        siteMap.set(siteKey, {
          id: `SITE-${String(siteSeq++).padStart(7, "0")}`,
          customerId: custEntity.id,
          name: cleanSiteName,
          address: custEntity.address,
          contactName: r[7] ? String(r[7]).trim() : "",
          contact: r[8] ? String(r[8]).trim() : "",
          email: r[9] ? String(r[9]).trim() : "",
          createdAt: nowIso2,
          updatedAt: nowIso2
        });
      }
    }
    const rawContact = r[7] ? String(r[7]).trim() : "";
    if (rawContact) {
      const { name, position } = extractContactPosition(rawContact);
      const contactKey = `${custEntity.id}_${name}`;
      if (!contactMap.has(contactKey)) {
        contactMap.set(contactKey, {
          id: `CONT-${String(contactSeq++).padStart(7, "0")}`,
          customerId: custEntity.id,
          name,
          position,
          phone: r[8] ? String(r[8]).trim() : "",
          email: r[9] ? String(r[9]).trim() : "",
          isPrimary: true,
          createdAt: nowIso2,
          updatedAt: nowIso2
        });
      }
    }
  });
  const wsClosing = wb.Sheets["\uC5C5\uCCB4\uBCC4\uB9C8\uAC10\uC77C\uC790"];
  const rawClosingRows = wsClosing ? XLSX.utils.sheet_to_json(wsClosing, { header: 1, defval: null }).slice(2) : [];
  rawClosingRows.forEach((r) => {
    if (!r || !r[0]) return;
    const custName = normalizeCustomerName(r[0]);
    const closingDay = parseClosingDay(r[1]);
    const paymentTerm = parsePaymentDueTerm(r[2]);
    const memo = r[3] ? String(r[3]).trim() : "";
    let custEntity = customerMap.get(custName);
    if (!custEntity) {
      custEntity = {
        id: `CUST-${String(custSeq++).padStart(7, "0")}`,
        name: custName,
        bizRegNo: "",
        representative: "",
        repContact: "",
        repEmail: "",
        address: "",
        billingDay: closingDay,
        paymentDueDay: paymentTerm.paymentDueDay,
        paymentTermDays: paymentTerm.paymentTermDays,
        memo,
        isActive: true,
        createdAt: nowIso2,
        updatedAt: nowIso2
      };
      customerMap.set(custName, custEntity);
    } else {
      custEntity.billingDay = closingDay;
      custEntity.paymentDueDay = paymentTerm.paymentDueDay;
      custEntity.paymentTermDays = paymentTerm.paymentTermDays;
      if (memo) {
        custEntity.memo = custEntity.memo ? `${custEntity.memo} | ${memo}` : memo;
      }
    }
  });
  const wsMain = wb.Sheets["202608"];
  const rawMainRows = wsMain ? XLSX.utils.sheet_to_json(wsMain, { header: 1, defval: null }).slice(3) : [];
  const contracts = [];
  const contractAssets = [];
  const externalLeases = [];
  const deliveries = [];
  const outboundInspections = [];
  const assetInOutLogs = [];
  const contractHistories = [];
  const billings = [];
  const billingDetails = [];
  const purchaseBillings = [];
  const purchaseBillingDetails = [];
  const receivables = [];
  let contractSeq = 1;
  let caSeq = 1;
  let leaseSeq = 1;
  let delivSeq = 1;
  let inspSeq = 1;
  let logSeq = 1;
  let histSeq = 1;
  let billSeq = 1;
  let bdSeq = 1;
  let pbSeq = 1;
  let pbdSeq = 1;
  let recvSeq = 1;
  let excelTotalBillingSum = 0;
  const currentMonthBillingGroup = /* @__PURE__ */ new Map();
  const purchaseBillingGroup = /* @__PURE__ */ new Map();
  const contractGroupMap = /* @__PURE__ */ new Map();
  rawMainRows.forEach((r) => {
    if (!r) return;
    const rawCustName = r[0];
    const rawModel = r[2];
    if (!rawCustName && !rawModel) return;
    const custName = normalizeCustomerName(rawCustName) || "\uAE30\uBCF8\uACE0\uAC1D\uC0AC";
    let customer = customerMap.get(custName);
    if (!customer) {
      customer = {
        id: `CUST-${String(custSeq++).padStart(7, "0")}`,
        name: custName,
        bizRegNo: "",
        representative: "",
        repContact: "",
        repEmail: "",
        address: "",
        billingDay: 30,
        paymentDueDay: 15,
        memo: "",
        isActive: true,
        createdAt: nowIso2,
        updatedAt: nowIso2
      };
      customerMap.set(custName, customer);
    }
    const rawSite = r[1] ? String(r[1]).trim() : "";
    const { cleanSiteName, dispatchMemo } = extractSiteNameAndMemo(rawSite);
    const siteKey = `${customer.id}_${cleanSiteName}`;
    let site = siteMap.get(siteKey);
    if (!site) {
      site = {
        id: `SITE-${String(siteSeq++).padStart(7, "0")}`,
        customerId: customer.id,
        name: cleanSiteName,
        address: customer.address || "",
        contactName: "",
        contact: "",
        email: "",
        createdAt: nowIso2,
        updatedAt: nowIso2
      };
      siteMap.set(siteKey, site);
    }
    const targetModel = sanitizeModelName(rawModel) || "ES1330L";
    const heightM = typeof r[3] === "number" ? r[3] : parseFloat(String(r[3] || "5.8")) || 5.8;
    const feet = inferFeetFromModel(targetModel, heightM);
    if (!productMap.has(targetModel)) {
      productMap.set(targetModel, {
        id: `PROD-${String(productMap.size + 1).padStart(7, "0")}`,
        modelName: targetModel,
        feet,
        spec: `${heightM}M (${feet}ft)`,
        manufacturer: inferMakerFromModel(targetModel),
        powerSource: "\uBC30\uD130\uB9AC",
        workingHeight: `${heightM} M`,
        platformHeight: `${(heightM - 2).toFixed(2)} M`,
        asContact: "031-334-5296",
        maxWindSpeed: "12.5 m/s \uC774\uB0B4",
        capacityPreExt: "230 kg",
        isActive: true,
        createdAt: nowIso2,
        updatedAt: nowIso2
      });
    }
    const ownAssetNo = r[13] ? String(r[13]).trim().toUpperCase() : "";
    const leaseAssetNo = r[14] ? String(r[14]).trim().toUpperCase() : "";
    const leaseVendorName = r[15] ? String(r[15]).trim() : "";
    const leasePrice = sanitizeNumber(r[16]);
    const leaseReturnDate = sanitizeExcelDate(r[17]);
    let matchedAsset = null;
    if (ownAssetNo) {
      matchedAsset = assetMap.get(ownAssetNo);
      if (!matchedAsset) {
        const assetId = `ASSET-${String(assetSeq++).padStart(7, "0")}`;
        matchedAsset = {
          id: assetId,
          modelName: targetModel,
          assetNo: ownAssetNo,
          serialNo: "",
          manufacturer: inferMakerFromModel(targetModel),
          manufactureYear: "2025\uB144",
          ownerType: "OWNED",
          status: "AVAILABLE",
          acquisitionDate: "2025-01-01",
          acquisitionPrice: 118e5,
          depreciationMonths: 96,
          residualValueRate: 10,
          accumDepreciation: 0,
          bookValue: 118e5,
          cumRentalFee: 0,
          cumRepairCost: 0,
          supplier: "",
          vendorId: null,
          currentCustomerId: null,
          currentSiteId: null,
          contractStart: null,
          contractEnd: null,
          memo: "202608 \uC2DC\uD2B8 \uAE30\uBC18 \uC790\uB3D9\uB4F1\uB85D",
          createdAt: nowIso2,
          updatedAt: nowIso2
        };
        assetMap.set(ownAssetNo, matchedAsset);
      }
    } else if (leaseAssetNo) {
      matchedAsset = assetMap.get(leaseAssetNo);
      if (!matchedAsset) {
        const assetId = `ASSET-${String(assetSeq++).padStart(7, "0")}`;
        matchedAsset = {
          id: assetId,
          modelName: targetModel,
          assetNo: leaseAssetNo,
          serialNo: "",
          manufacturer: inferMakerFromModel(targetModel),
          manufactureYear: "2025\uB144",
          ownerType: "RENTED",
          status: "AVAILABLE",
          acquisitionDate: "2026-08-01",
          acquisitionPrice: 0,
          depreciationMonths: 0,
          residualValueRate: 0,
          accumDepreciation: 0,
          bookValue: 0,
          cumRentalFee: 0,
          cumRepairCost: 0,
          vendorId: null,
          // 아래 leaseVendor 처리 후 주입
          rentStart: sanitizeExcelDate(r[4]) || "2026-08-01",
          rentEnd: leaseReturnDate,
          monthlyRentFee: leasePrice,
          dailyRentFee: Math.round(leasePrice / 30),
          actualRentReturnDate: leaseReturnDate,
          currentCustomerId: null,
          currentSiteId: null,
          contractStart: null,
          contractEnd: null,
          memo: `\uC784\uCC28(\uC804\uB300) \uC7A5\uBE44: ${leaseVendorName}`,
          createdAt: nowIso2,
          updatedAt: nowIso2
        };
        assetMap.set(leaseAssetNo, matchedAsset);
      }
    }
    if (leaseAssetNo) {
      let leaseVendor = null;
      if (leaseVendorName) {
        leaseVendor = vendorMap.get(leaseVendorName);
        if (!leaseVendor) {
          leaseVendor = {
            id: `VEND-${String(vendorMap.size + 1).padStart(7, "0")}`,
            name: leaseVendorName,
            type: "RENTAL",
            isActive: true,
            createdAt: nowIso2,
            updatedAt: nowIso2
          };
          vendorMap.set(leaseVendorName, leaseVendor);
        }
      }
      const leaseAssetRef = ownAssetNo ? assetMap.get(ownAssetNo) || matchedAsset : assetMap.get(leaseAssetNo) || matchedAsset;
      if (!ownAssetNo && leaseAssetRef && leaseVendor) {
        leaseAssetRef.vendorId = leaseVendor.id;
      }
      const leaseId = `LEASE-2608-${String(leaseSeq++).padStart(4, "0")}`;
      const leaseEntity = {
        id: leaseId,
        leaseNo: `EL2608-${String(leaseSeq - 1).padStart(4, "0")}`,
        vendorId: leaseVendor ? leaseVendor.id : null,
        contractId: null,
        // 계약 그룹핑 완료 후 아래에서 주입 (A-01 fix)
        modelName: targetModel,
        assetNo: leaseAssetNo,
        serialNo: "",
        rentStart: sanitizeExcelDate(r[4]) || "2026-08-01",
        rentEnd: leaseReturnDate,
        monthlyRentFee: leasePrice,
        dailyRentFee: Math.round(leasePrice / 30),
        actualRentReturnDate: leaseReturnDate,
        memo: `\uC784\uCC28\uCC98: ${leaseVendorName}`,
        createdAt: nowIso2,
        updatedAt: nowIso2
      };
      externalLeases.push(leaseEntity);
      if (leasePrice > 0 && leaseVendor) {
        let pGroup = purchaseBillingGroup.get(leaseVendor.id);
        if (!pGroup) {
          pGroup = { vendorId: leaseVendor.id, totalAmount: 0, details: [] };
          purchaseBillingGroup.set(leaseVendor.id, pGroup);
        }
        pGroup.totalAmount += leasePrice;
        pGroup.details.push({
          assetId: leaseAssetRef ? leaseAssetRef.id : null,
          contractId: null,
          expenseType: "RENTAL",
          itemName: `${targetModel} (${leaseAssetNo}) \uC804\uB300 \uC784\uCC28\uB8CC`,
          amount: leasePrice
        });
      }
    }
    const rowStartDate = sanitizeExcelDate(r[4]) || "2026-08-01";
    const rowEndDate = sanitizeExcelDate(r[5]) || "9999-12-31";
    const rowMonthlyFee = sanitizeNumber(r[22]) || (sanitizeNumber(r[25]) > 0 ? sanitizeNumber(r[25]) : 3e5);
    const rowDailyFee = Math.round(rowMonthlyFee / 30);
    const contractStatusStr = r[10] ? String(r[10]).trim() : "";
    const isCompleted = contractStatusStr === "\uC885\uB8CC" || rowEndDate && rowEndDate < "2026-08-01";
    const contractGroupKey = `${customer.id}_${site.id}_${rowStartDate}_${rowEndDate}`;
    let contractId;
    let contractNo;
    if (contractGroupMap.has(contractGroupKey)) {
      const existingContract = contractGroupMap.get(contractGroupKey);
      contractId = existingContract.id;
      contractNo = existingContract.contractNo;
      existingContract._totalMonthlyFee = (existingContract._totalMonthlyFee || 0) + rowMonthlyFee;
    } else {
      contractId = `CONT-260801-${String(contractSeq++).padStart(4, "0")}`;
      contractNo = `C2608-${String(contractSeq - 1).padStart(4, "0")}`;
      const newContract = {
        id: contractId,
        contractNo,
        customerId: customer.id,
        salespersonId: MIGRATION_SALESPERSON_ID,
        // C-01 fix: 김동우 팀장
        contactId: null,
        siteId: site.id,
        billingDay: customer.billingDay || 30,
        paymentDueDay: customer.paymentDueDay || 15,
        lateInterestRate: 0,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        startDate: rowStartDate,
        endDate: rowEndDate,
        lastBillingDate: "2026-08-31",
        lastBilledPeriodStart: "2026-08-01",
        lastBilledPeriodEnd: "2026-08-31",
        lastBilledYm: "2026-08",
        billingCount: 1,
        _totalMonthlyFee: rowMonthlyFee,
        // 내부 집계용 (DB 저장 X)
        createdAt: nowIso2,
        updatedAt: nowIso2
      };
      contracts.push(newContract);
      contractGroupMap.set(contractGroupKey, newContract);
      contractHistories.push({
        id: `CH-${String(histSeq++).padStart(7, "0")}`,
        contractId,
        changeType: "INITIAL_START",
        changedBy: "\uC2DC\uC2A4\uD15C(\uCD08\uAE30DB\uC5C5\uB85C\uB4DC)",
        description: `\uACC4\uC57D \uCD5C\uCD08 \uB4F1\uB85D (${rowStartDate} \uAC1C\uC2DC)`,
        snapshot: {
          contractNo,
          customerId: customer.id,
          customerName: customer.name,
          siteName: site.name,
          startDate: rowStartDate,
          endDate: rowEndDate,
          monthlyFee: rowMonthlyFee
        },
        createdAt: nowIso2
      });
    }
    const caId = `CA-${String(caSeq++).padStart(7, "0")}`;
    contractAssets.push({
      id: caId,
      contractId,
      assetId: matchedAsset ? matchedAsset.id : null,
      expectedModel: targetModel,
      monthlyRentalFee: rowMonthlyFee,
      dailyRentalFee: rowDailyFee,
      startDate: rowStartDate,
      endDate: rowEndDate,
      createdAt: nowIso2,
      updatedAt: nowIso2
    });
    if (leaseAssetNo && !ownAssetNo) {
      const lastLease = externalLeases[externalLeases.length - 1];
      if (lastLease && lastLease.contractId === null) {
        lastLease.contractId = contractId;
      }
    }
    if (matchedAsset) {
      if (!isCompleted) {
        matchedAsset.status = "RENTED";
        matchedAsset.currentCustomerId = customer.id;
        matchedAsset.currentSiteId = site.id;
        matchedAsset.contractStart = rowStartDate;
        matchedAsset.contractEnd = rowEndDate;
      } else {
        if (matchedAsset.status !== "RENTED") {
          matchedAsset.status = matchedAsset.ownerType === "RENTED" ? "RENTED_RETURNED" : "AVAILABLE";
        }
      }
    }
    const transportFee = sanitizeNumber(r[20]);
    if (transportFee > 0) {
      receivables.push({
        id: `RECV-${String(recvSeq++).padStart(7, "0")}`,
        customerId: customer.id,
        siteId: site.id,
        contractId,
        type: "TRANSPORT",
        amount: transportFee,
        paidAmount: 0,
        status: "UNPAID",
        issueDate: rowStartDate,
        dueDate: calcDueDate(rowStartDate, customer.paymentDueDay ?? 30, customer.paymentTermDays ?? null),
        description: `\uC6B4\uBC18\uBE44 \uCCAD\uAD6C (${cleanSiteName})`,
        createdAt: nowIso2,
        updatedAt: nowIso2
      });
    }
    const startYmd = rowStartDate;
    if (startYmd && startYmd < "2026-08-01") {
      const startParts = startYmd.split("-");
      let curYear = parseInt(startParts[0], 10);
      let curMonth = parseInt(startParts[1], 10);
      while (curYear < 2026 || curYear === 2026 && curMonth <= 7) {
        const ymStr = `${curYear}-${String(curMonth).padStart(2, "0")}`;
        const lastDayOfCurMonth = new Date(curYear, curMonth, 0).getDate();
        const billDateStr = `${ymStr}-${String(Math.min(customer.billingDay || 30, lastDayOfCurMonth)).padStart(2, "0")}`;
        let daysInPeriod = lastDayOfCurMonth;
        if (curYear === parseInt(startParts[0], 10) && curMonth === parseInt(startParts[1], 10)) {
          const startDay = parseInt(startParts[2], 10);
          daysInPeriod = Math.max(1, lastDayOfCurMonth - startDay + 1);
        }
        const isFullMonth = daysInPeriod === lastDayOfCurMonth;
        const histBillAmount = isFullMonth ? rowMonthlyFee : Math.round(rowDailyFee * daysInPeriod);
        if (matchedAsset) {
          matchedAsset.cumRentalFee = (matchedAsset.cumRentalFee || 0) + histBillAmount;
        }
        const histBillId = `BILL-HIST-${String(billSeq++).padStart(6, "0")}`;
        const histDueDate = calcDueDate(billDateStr, customer.paymentDueDay ?? 30, customer.paymentTermDays ?? null);
        billings.push({
          id: histBillId,
          billingNo: `BL-HIST-${String(billSeq - 1).padStart(6, "0")}`,
          customerId: customer.id,
          billingYm: ymStr,
          billingDate: billDateStr,
          dueDate: histDueDate,
          totalAmount: histBillAmount,
          paidAmount: histBillAmount,
          status: "PAID",
          createdAt: nowIso2,
          updatedAt: nowIso2
        });
        billingDetails.push({
          id: `BD-${String(bdSeq++).padStart(7, "0")}`,
          billingId: histBillId,
          contractAssetId: caId,
          assetId: matchedAsset?.id,
          itemName: `${targetModel} (${ownAssetNo || leaseAssetNo || "\uAC00\uC0C1"}) \uB80C\uD0C8\uB8CC`,
          quantity: daysInPeriod,
          unitPrice: rowDailyFee,
          amount: histBillAmount,
          description: `${ymStr} \uC815\uAE30 \uB80C\uD0C8\uB8CC (${daysInPeriod}\uC77C \uAC00\uB3D9)`,
          displayName: `${targetModel} \uB80C\uD0C8\uB8CC`,
          createdAt: nowIso2,
          updatedAt: nowIso2
        });
        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      }
    }
    const rowBillingTotal = sanitizeNumber(r[25]);
    const monthRentFee = sanitizeNumber(r[22]);
    const otherFee = sanitizeNumber(r[23]);
    const otherMemo = r[24] ? String(r[24]).trim() : "";
    const days = sanitizeNumber(r[6]) || 30;
    excelTotalBillingSum += rowBillingTotal;
    if (matchedAsset) {
      matchedAsset.cumRentalFee = (matchedAsset.cumRentalFee || 0) + (monthRentFee || rowBillingTotal);
    }
    let custBill = currentMonthBillingGroup.get(customer.id);
    if (!custBill) {
      const billDate = "2026-08-31";
      custBill = {
        customer,
        billingDate: billDate,
        dueDate: calcDueDate(billDate, customer.paymentDueDay ?? 30, customer.paymentTermDays ?? null),
        details: [],
        totalAmount: 0,
        paidAmount: 0
      };
      currentMonthBillingGroup.set(customer.id, custBill);
    }
    if (rowBillingTotal > 0) {
      const rawSum = monthRentFee + otherFee + transportFee;
      if (rawSum > 0 && (otherFee > 0 || transportFee > 0)) {
        const rentPortion = Math.round(rowBillingTotal * (monthRentFee / rawSum));
        const transPortion = Math.round(rowBillingTotal * (transportFee / rawSum));
        const otherPortion = rowBillingTotal - rentPortion - transPortion;
        if (rentPortion > 0) {
          custBill.details.push({
            contractAssetId: caId,
            assetId: matchedAsset?.id,
            itemName: `${targetModel} (${ownAssetNo || leaseAssetNo || "\uAC00\uC0C1"}) \uB80C\uD0C8\uB8CC`,
            itemType: "RENTAL",
            quantity: days,
            unitPrice: Math.round(rentPortion / days),
            amount: rentPortion,
            description: `2026-08 \uB80C\uD0C8\uB8CC (${days}\uC77C)`,
            internalDescription: `\uD604\uC7A5: ${cleanSiteName}`
          });
        }
        if (transPortion > 0) {
          custBill.details.push({
            contractAssetId: caId,
            assetId: matchedAsset?.id,
            itemName: `\uC6B4\uBC18\uBE44 (${cleanSiteName})`,
            itemType: "TRANSPORT",
            quantity: 1,
            unitPrice: transPortion,
            amount: transPortion,
            description: `\uC6B4\uC1A1 \uBC30\uCC28 \uBE44\uC6A9`,
            internalDescription: `\uD604\uC7A5: ${cleanSiteName}`
          });
        }
        if (otherPortion > 0) {
          custBill.details.push({
            contractAssetId: caId,
            assetId: matchedAsset?.id,
            itemName: otherMemo || "\uAE30\uD0C0 \uBD80\uB300\uBE44\uC6A9",
            itemType: "OTHER",
            quantity: 1,
            unitPrice: otherPortion,
            amount: otherPortion,
            description: otherMemo || "\uAE30\uD0C0 \uCCAD\uAD6C\uC561",
            internalDescription: `\uD604\uC7A5: ${cleanSiteName}`
          });
        }
      } else {
        custBill.details.push({
          contractAssetId: caId,
          assetId: matchedAsset?.id,
          itemName: `${targetModel} (${ownAssetNo || leaseAssetNo || "\uAC00\uC0C1"}) \uB80C\uD0C8\uB8CC`,
          itemType: "RENTAL",
          quantity: days,
          unitPrice: Math.round(rowBillingTotal / days),
          amount: rowBillingTotal,
          description: `2026-08 \uB80C\uD0C8\uB8CC (${days}\uC77C)`,
          internalDescription: `\uD604\uC7A5: ${cleanSiteName}`
        });
      }
      custBill.totalAmount += rowBillingTotal;
    }
  });
  currentMonthBillingGroup.forEach((group, custId) => {
    if (group.totalAmount <= 0) return;
    const billingId = `BILL-2608-${String(billSeq++).padStart(4, "0")}`;
    const billingNo = `BL-2608-${String(billSeq - 1).padStart(4, "0")}`;
    billings.push({
      id: billingId,
      billingNo,
      customerId: custId,
      billingYm: "2026-08",
      billingDate: group.billingDate,
      dueDate: group.dueDate,
      totalAmount: group.totalAmount,
      paidAmount: 0,
      status: "UNPAID",
      createdAt: nowIso2,
      updatedAt: nowIso2
    });
    group.details.forEach((d) => {
      billingDetails.push({
        id: `BD-${String(bdSeq++).padStart(7, "0")}`,
        billingId,
        contractAssetId: d.contractAssetId,
        assetId: d.assetId,
        itemName: d.itemName,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        amount: d.amount,
        description: d.description,
        internalDescription: d.internalDescription,
        displayName: d.itemName,
        createdAt: nowIso2,
        updatedAt: nowIso2
      });
    });
  });
  purchaseBillingGroup.forEach((pGroup, key) => {
    const pbId = `PB-2608-${String(pbSeq++).padStart(4, "0")}`;
    purchaseBillings.push({
      id: pbId,
      vendorId: pGroup.vendorId,
      billingYm: "2026-08",
      totalAmount: pGroup.totalAmount,
      paidAmount: 0,
      status: "REQUESTED",
      createdAt: nowIso2,
      updatedAt: nowIso2
    });
    pGroup.details.forEach((d) => {
      purchaseBillingDetails.push({
        id: `PBD-${String(pbdSeq++).padStart(7, "0")}`,
        purchaseBillId: pbId,
        assetId: d.assetId,
        contractId: d.contractId,
        expenseType: d.expenseType,
        itemName: d.itemName,
        amount: d.amount,
        createdAt: nowIso2,
        updatedAt: nowIso2
      });
    });
  });
  const parsedProducts = Array.from(productMap.values());
  const parsedVendors = Array.from(vendorMap.values());
  const parsedCustomers = Array.from(customerMap.values());
  const parsedSites = Array.from(siteMap.values());
  const parsedContacts = Array.from(contactMap.values());
  const DEPRECIATION_BASE_DATE = /* @__PURE__ */ new Date("2026-08-31");
  assetMap.forEach((asset) => {
    if (asset.ownerType !== "OWNED") return;
    const acqPrice = asset.acquisitionPrice || 0;
    const acqDate = asset.acquisitionDate;
    if (!acqDate || acqPrice <= 0) {
      asset.accumDepreciation = 0;
      asset.bookValue = acqPrice;
      return;
    }
    const depnResult = calculateAssetDepreciation(
      {
        acquisitionPrice: acqPrice,
        acquisitionDate: acqDate,
        depreciationMonths: asset.depreciationMonths || 96,
        residualValueRate: asset.residualValueRate ?? 10,
        status: asset.status
      },
      DEPRECIATION_BASE_DATE
    );
    asset.accumDepreciation = depnResult.accumDepreciation;
    asset.bookValue = depnResult.bookValue;
  });
  contracts.forEach((c) => {
    delete c._totalMonthlyFee;
  });
  const parsedAssets = Array.from(assetMap.values());
  const currentMonthBills = billings.filter((b) => b.billingYm === "2026-08");
  const histBills = billings.filter((b) => b.billingYm !== "2026-08");
  const outboundDelivs = deliveries.filter((d) => d.type === "OUTBOUND");
  const inboundDelivs = deliveries.filter((d) => d.type === "INBOUND");
  const stats = {
    productsCount: parsedProducts.length,
    vendorsCount: parsedVendors.length,
    customersCount: parsedCustomers.length,
    sitesCount: parsedSites.length,
    contactsCount: parsedContacts.length,
    assetsCount: parsedAssets.length,
    contractsCount: contracts.length,
    contractAssetsCount: contractAssets.length,
    externalLeasesCount: externalLeases.length,
    outboundDeliveriesCount: outboundDelivs.length,
    inboundDeliveriesCount: inboundDelivs.length,
    outboundInspectionsCount: outboundInspections.length,
    assetInOutLogsCount: assetInOutLogs.length,
    contractHistoriesCount: contractHistories.length,
    historicalBillingsCount: histBills.length,
    currentBillingsCount: currentMonthBills.length,
    totalBillingDetailsCount: billingDetails.length,
    totalHistoricalBillingAmount: histBills.reduce((acc, b) => acc + b.totalAmount, 0),
    currentMonthBillingAmount: currentMonthBills.reduce((acc, b) => acc + b.totalAmount, 0),
    purchaseBillingsCount: purchaseBillings.length,
    totalPurchaseBillingAmount: purchaseBillings.reduce((acc, b) => acc + b.totalAmount, 0),
    receivablesCount: receivables.length,
    totalReceivablesAmount: receivables.reduce((acc, r) => acc + r.totalAmount, 0),
    docLinkedProductsCount: parsedProducts.filter((p) => p.specSheetUrl).length,
    activeRentedAssetsCount: parsedAssets.filter((a) => a.currentCustomerId).length
  };
  return {
    products: parsedProducts,
    vendors: parsedVendors,
    customers: parsedCustomers,
    customerSites: parsedSites,
    customerContacts: parsedContacts,
    assets: parsedAssets,
    contracts,
    contractAssets,
    externalLeases,
    deliveries,
    outboundInspections,
    assetInOutLogs,
    contractHistories,
    billings,
    billingDetails,
    purchaseBillings,
    purchaseBillingDetails,
    receivables,
    stats,
    excelTotalBillingSum
  };
}

// scripts/migrate_run.ts
var SUPABASE_URL = "wywgkikkjgbnlljkkmnz.supabase.co";
var SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU";
function fetchUsers() {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: "/rest/v1/users?select=*",
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON,
        "Authorization": `Bearer ${SUPABASE_ANON}`
      }
    };
    const req = import_https.default.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Fetch users failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}
function postJson(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/${table}`,
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON,
        "Authorization": `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
      }
    };
    const req = import_https.default.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => d += c);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`${table} POST ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
var OVERRIDE_COLUMNS = {
  products: TABLE_COLUMNS.products,
  vendors: [
    "id",
    "name",
    "type",
    "types",
    "bizRegNo",
    "representative",
    "contactName",
    "contact",
    "email",
    "address",
    "bankAccount",
    "isActive",
    "memo",
    "createdAt",
    "updatedAt"
  ],
  customers: [
    "id",
    "name",
    "bizRegNo",
    "representative",
    "repContact",
    "repEmail",
    "address",
    "defaultBillingDay",
    "isClosed",
    "createdAt",
    "updatedAt"
  ],
  customer_sites: [
    "id",
    "customerId",
    "name",
    "address",
    "contactName",
    "contact",
    "email",
    "createdAt",
    "updatedAt"
  ],
  customer_contacts: [
    "id",
    "customerId",
    "name",
    "position",
    "contact",
    "email",
    "createdAt",
    "updatedAt"
  ],
  assets: [
    "id",
    "modelName",
    "assetNo",
    "serialNo",
    "manufacturer",
    "manufactureYear",
    "ownerType",
    "status",
    "acquisitionDate",
    "acquisitionPrice",
    "depreciationMonths",
    "residualValueRate",
    "accumDepreciation",
    "bookValue",
    "renter",
    "supplier",
    "rentStart",
    "rentEnd",
    "monthlyRentFee",
    "dailyRentFee",
    "actualRentReturnDate",
    "currentCustomerId",
    "currentSiteId",
    "contractStart",
    "contractEnd",
    "cumRentalFee",
    "cumRepairCost",
    "note",
    "memo",
    "createdAt",
    "updatedAt"
  ],
  contracts: TABLE_COLUMNS.contracts,
  contract_history: [
    "id",
    "contractId",
    "changeType",
    "changeDate",
    "prevEndDate",
    "newEndDate",
    "description",
    "createdAt"
  ],
  contract_assets: TABLE_COLUMNS.contract_assets,
  external_leases: [
    "id",
    "vendorId",
    "contractId",
    "contractAssetId",
    "assetDescription",
    "monthlyRentFee",
    "dailyRentFee",
    "leaseStartDate",
    "leaseEndDate",
    "status",
    "statementFileUrl",
    "memo",
    "createdAt",
    "updatedAt"
  ],
  deliveries: TABLE_COLUMNS.deliveries,
  outbound_inspections: TABLE_COLUMNS.outbound_inspections,
  asset_inout_logs: TABLE_COLUMNS.asset_inout_logs,
  billings: [
    "id",
    "customerId",
    "contractId",
    "billingYm",
    "billingDate",
    "totalAmount",
    "paidAmount",
    "status",
    "createdAt",
    "updatedAt"
  ],
  billing_details: [
    "id",
    "billingId",
    "contractAssetId",
    "assetId",
    "receivableId",
    "itemName",
    "quantity",
    "unitPrice",
    "amount",
    "description",
    "internalDescription",
    "displayName",
    "createdAt",
    "updatedAt"
  ],
  purchase_billings: [
    "id",
    "vendorId",
    "billingYm",
    "totalAmount",
    "paidAmount",
    "status",
    "createdAt",
    "updatedAt"
  ],
  purchase_billing_details: [
    "id",
    "purchaseBillId",
    "assetId",
    "contractId",
    "expenseType",
    "itemName",
    "amount",
    "createdAt",
    "updatedAt"
  ],
  receivables: [
    "id",
    "contractId",
    "customerId",
    "type",
    "totalAmount",
    "billedAmount",
    "internalDescription",
    "displayName",
    "occurredDate",
    "status",
    "createdAt",
    "updatedAt"
  ]
};
async function batchUpsert(table, rows, chunkSize = 200) {
  if (!rows || rows.length === 0) return;
  const cols = OVERRIDE_COLUMNS[table] || TABLE_COLUMNS[table];
  const filtered = rows.map((r) => {
    const o = {};
    for (const k of cols) {
      o[k] = r[k] !== void 0 ? r[k] : null;
    }
    return o;
  });
  const uniqueMap = /* @__PURE__ */ new Map();
  filtered.forEach((r) => uniqueMap.set(r.id, r));
  const uniqueFiltered = Array.from(uniqueMap.values());
  console.log(`[${table}] uploading ${uniqueFiltered.length} rows...`);
  for (let i = 0; i < uniqueFiltered.length; i += chunkSize) {
    const chunk = uniqueFiltered.slice(i, i + chunkSize);
    await postJson(table, chunk);
  }
}
async function runMigration() {
  console.log("Fetching users...");
  const users = await fetchUsers();
  console.log(`Found ${users.length} users.`);
  const excelPath = "D:\\OneDrive\\Desktop\\\uAE30\uC5F0\uB9AC\uD504\uD2B8\uC790\uB8CC_\\\uC790\uB3D9\uC5C5\uB85C\uB4DC\\\uCD08\uAE30DB\uD604\uD6691.xlsx";
  console.log(`Reading Excel file: ${excelPath}`);
  const fileBuffer = import_fs.default.readFileSync(excelPath);
  console.log("Parsing Excel...");
  const parsed = parseInitialExcelWorkbook(fileBuffer, users);
  console.log("--- Parsing Stats ---");
  console.log(JSON.stringify(parsed.stats, null, 2));
  parsed.customers.forEach((c) => {
    c.defaultBillingDay = c.billingDay;
    c.isClosed = c.isActive === false;
  });
  parsed.customerContacts.forEach((c) => {
    c.contact = c.phone;
  });
  parsed.assets.forEach((a) => {
    a.renter = a.vendorId;
  });
  parsed.contractHistories.forEach((c) => {
    if (c.changeType === "INITIAL_START") c.changeType = "REGISTER";
    c.changeDate = c.snapshot?.startDate || c.createdAt;
  });
  parsed.externalLeases.forEach((e) => {
    e.assetDescription = `${e.modelName} (${e.assetNo})`;
    e.leaseStartDate = e.rentStart;
    e.leaseEndDate = e.rentEnd;
    e.status = "ACTIVE";
  });
  parsed.billings.forEach((b) => {
    b.contractId = null;
    b.status = b.status === "REQUESTED" ? "UNPAID" : b.status;
  });
  parsed.billingDetails.forEach((bd) => {
    bd.amount = bd.totalAmount || 0;
    bd.description = bd.note || "";
  });
  parsed.purchaseBillings.forEach((pb) => {
    pb.status = pb.status === "REQUESTED" ? "REQUESTED" : pb.status;
  });
  parsed.purchaseBillingDetails.forEach((pbd) => {
    pbd.purchaseBillId = pbd.purchaseBillingId;
    pbd.amount = pbd.totalAmount || 0;
    pbd.expenseType = "OTHER";
  });
  parsed.receivables.forEach((r) => {
    r.contractId = null;
    r.totalAmount = r.amount || 0;
    r.billedAmount = 0;
    r.internalDescription = r.note || "";
    r.type = "OTHER";
    r.status = "PENDING";
    r.occurredDate = r.occurredDate || "2026-08-31";
  });
  const order = [
    { table: "products", data: parsed.products },
    { table: "vendors", data: parsed.vendors },
    { table: "customers", data: parsed.customers },
    { table: "customer_sites", data: parsed.customerSites },
    { table: "customer_contacts", data: parsed.customerContacts },
    { table: "assets", data: parsed.assets },
    { table: "contracts", data: parsed.contracts },
    { table: "contract_history", data: parsed.contractHistories },
    { table: "contract_assets", data: parsed.contractAssets },
    { table: "external_leases", data: parsed.externalLeases },
    { table: "billings", data: parsed.billings },
    { table: "billing_details", data: parsed.billingDetails },
    { table: "purchase_billings", data: parsed.purchaseBillings },
    { table: "purchase_billing_details", data: parsed.purchaseBillingDetails },
    { table: "receivables", data: parsed.receivables }
  ];
  for (const { table, data } of order) {
    await batchUpsert(table, data);
  }
  console.log("Migration Complete.");
}
runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
