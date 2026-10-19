// scripts/seed_it_photos.cjs
// Supabase IT 제품 카탈로그에 4종 사진(전면, 후면, 내부, 기타) 시딩
const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

// 깔끔한 IT 하드웨어 도면/사진 SVG DataURI 생성기
function createSvgDataUrl(title, subtitle, tag, color, symbol) {
  const tagLabels = {
    FRONT: '전면 (Front)',
    REAR: '후면 (Rear)',
    INSIDE: '내부 (Inside)',
    OTHER: '기타 (Other)'
  };
  const label = tagLabels[tag] || tag;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
    <defs>
      <linearGradient id="g_${tag}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <pattern id="grid_${tag}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="420" fill="url(#g_${tag})"/>
    <rect width="600" height="420" fill="url(#grid_${tag})"/>
    <rect x="16" y="16" width="568" height="388" rx="10" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>
    
    <!-- 태그 배지 -->
    <rect x="36" y="36" width="130" height="32" rx="6" fill="${color}"/>
    <text x="101" y="57" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${label}</text>
    
    <!-- 심볼 및 도면 그래픽 -->
    <g transform="translate(300, 200)">
      <circle r="70" fill="none" stroke="${color}" stroke-width="2" opacity="0.3"/>
      <circle r="50" fill="rgba(255,255,255,0.03)" stroke="${color}" stroke-width="1.5" opacity="0.8"/>
      <text y="14" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="40" font-weight="900" text-anchor="middle">${symbol}</text>
    </g>

    <!-- 제품명 및 설명 -->
    <text x="300" y="320" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${title}</text>
    <text x="300" y="350" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="13" text-anchor="middle">${subtitle}</text>
    
    <!-- 하단 워터마크 -->
    <text x="560" y="390" fill="#475569" font-family="monospace" font-size="11" text-anchor="end">EBRO IT HARDWARE SPEC SSOT</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 제품별 4종 사진 구성 (전면, 후면, 내부, 기타)
function generatePhotosForProduct(modelName, category) {
  const photos = [];

  // 1. 전면 (FRONT)
  photos.push({
    id: `photo-${Date.now()}-front`,
    tag: 'FRONT',
    tagLabel: '전면',
    url: createSvgDataUrl(modelName, '전면부 디자인 / 디스플레이 및 입력 인터페이스', 'FRONT', '#2563eb', 'FRONT'),
    caption: `${modelName} 전면부 외관 및 컨트롤러`,
    createdAt: new Date().toISOString()
  });

  // 2. 후면 (REAR)
  photos.push({
    id: `photo-${Date.now()}-rear`,
    tag: 'REAR',
    tagLabel: '후면',
    url: createSvgDataUrl(modelName, '후면 I/O 단자 / 전원 인렛 및 통풍 쿨링 배기구', 'REAR', '#475569', 'REAR'),
    caption: `${modelName} 후면 I/O 포트 및 전원부`,
    createdAt: new Date().toISOString()
  });

  // 3. 내부 (INSIDE)
  photos.push({
    id: `photo-${Date.now()}-inside`,
    tag: 'INSIDE',
    tagLabel: '내부',
    url: createSvgDataUrl(modelName, '메인보드 아키텍처 / RAM SO-DIMM 및 M.2 NVMe 확장 슬롯', 'INSIDE', '#059669', 'BOARD'),
    caption: `${modelName} 내부 메인보드 및 확장 슬롯`,
    createdAt: new Date().toISOString()
  });

  // 4. 기타 (OTHER)
  photos.push({
    id: `photo-${Date.now()}-other`,
    tag: 'OTHER',
    tagLabel: '기타',
    url: createSvgDataUrl(modelName, '측면 인터페이스 / 번들 어댑터 및 악세서리 패키지', 'OTHER', '#7c3aed', 'ACC'),
    caption: `${modelName} 측면 포트 및 번들 악세서리`,
    createdAt: new Date().toISOString()
  });

  return photos;
}

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');
  await client.query('SET search_path TO public, extensions;');

  // 전체 제품 목록 조회
  const res = await client.query('SELECT id, category, "modelName" FROM products;');
  console.log(`Found ${res.rows.length} products to seed photos for...`);

  for (const prod of res.rows) {
    const photos = generatePhotosForProduct(prod.modelName, prod.category);
    await client.query(
      'UPDATE products SET photos = $1, "updatedAt" = $2 WHERE id = $3;',
      [JSON.stringify(photos), new Date().toISOString(), prod.id]
    );
    console.log(`✅ Seeded 4 photos for [${prod.modelName}] (${prod.category})`);
  }

  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('🎉 All product photos successfully updated in Supabase DB!');
  await client.end();
}

run().catch((err) => {
  console.error('Error seeding photos:', err);
  process.exit(1);
});
