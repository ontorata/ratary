import 'dotenv/config';
import { getD1Client } from '../src/db/index.js';
import { createMemoryService } from '../src/services/create-memory-service.js';
import { getMcpMemoryScope } from '../src/types/memory-scope.js';

async function main(): Promise<void> {
  const db = getD1Client();
  const service = createMemoryService(db);
  const scope = getMcpMemoryScope();

  console.log('1. Create memory...');
  const created = await service.createMemory(scope, {
    title: 'Login JWT',
    project: 'auth-service',
    content: '# Login JWT\n\nMenggunakan JWT HS256\n\nEndpoint: POST /login',
    summary: 'JWT authentication setup',
    tags: ['auth', 'jwt'],
    favorite: true,
  });
  console.log('   OK id:', created.id);

  console.log('2. Get by ID...');
  const got = await service.getMemoryById(scope, created.id);
  console.log('   OK title:', got.title);

  console.log('3. Search by keyword...');
  const search = await service.searchMemory(scope, {
    q: 'JWT',
    limit: 10,
    offset: 0,
    archived: false,
  });
  console.log('   OK results:', search.total);

  console.log('4. List projects & tags...');
  const projects = await service.listProjects(scope);
  const tags = await service.listTags(scope);
  console.log('   OK projects:', projects, '| tags:', tags);

  console.log('5. Toggle favorite...');
  const fav = await service.toggleFavorite(scope, created.id);
  console.log('   OK favorite:', fav.favorite);

  console.log('6. Export backup...');
  const backup = await service.exportBackup(scope);
  console.log('   OK memories:', backup.memories.length);

  console.log('7. Delete test memory...');
  await service.deleteMemory(scope, created.id);
  console.log('   OK deleted');

  console.log('\nAll integration tests PASSED against Cloudflare D1');
}

main().catch((error) => {
  console.error('\nIntegration test FAILED:', error.message);
  process.exit(1);
});
