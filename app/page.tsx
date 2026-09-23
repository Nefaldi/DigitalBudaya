
export default function ApiRootPage() {
  const apiInfo = {
    status: 'online',
    service: 'DigiCulture Care Backend REST API',
    version: '3.0.0',
    region: 'Sulawesi Tengah (Sulteng Edition)',
    documentation: '/API_DOCUMENTATION.md',
    endpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'POST /api/auth/logout',
      ],
      reports: [
        'GET /api/reports',
        'POST /api/reports',
        'GET /api/reports/[id]',
        'PATCH /api/reports/[id]',
        'DELETE /api/reports/[id]',
      ],
      upload: ['POST /api/upload (Cloudinary Photo & Audio Upload)'],
      users: [
        'GET /api/users',
        'PATCH /api/users/[id]',
        'DELETE /api/users/[id]',
      ],
      analytics: ['GET /api/analytics'],
    },
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace', background: '#090d16', color: '#34d399', minHeight: '100vh' }}>
      <pre>{JSON.stringify(apiInfo, null, 2)}</pre>
    </main>
  );
}
