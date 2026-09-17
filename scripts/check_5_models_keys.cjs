const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const config = {
  accountId: '35014a2514680107d74e1e68d96e6c32',
  bucketName: 'ebro-it-demo',
  accessKeyId: '109db3cb8cf82f919041be9fa3d41250',
  secretAccessKey: 'f80aed8584d0735c7350feb780e2e6665ca0cdf53895d80042fea758b6045c88'
};

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  }
});

async function checkSpecificKeys() {
  const prefixes = [
    'Eq_doc/Z-45',
    'Eq_doc/JCPT1614',
    'Eq_doc/GS-1930',
    'Eq_doc/GS1930',
    'Eq_doc/GS-3246',
    'Eq_doc/GS3246',
    'Eq_doc/ES1330'
  ];

  for (const prefix of prefixes) {
    const cmd = new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: prefix
    });
    const res = await client.send(cmd);
    console.log(`\n📂 [Prefix: ${prefix}] (${res.Contents ? res.Contents.length : 0}개 파일)`);
    if (res.Contents) {
      res.Contents.forEach(c => console.log(`  - Key: ${c.Key} (${c.Size} bytes)`));
    }
  }
}

checkSpecificKeys().catch(console.error);
