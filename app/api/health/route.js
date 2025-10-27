export async function GET(request) {
  try {
    const hasRiotKey = !!process.env.RIOT_API_KEY;
    const riotKeyLength = process.env.RIOT_API_KEY ? process.env.RIOT_API_KEY.length : 0;
    return Response.json({
      success: true,
      environment: process.env.NODE_ENV || 'unknown',
      hasRiotApiKey: hasRiotKey,
      riotKeyLength: riotKeyLength,
      timestamp: new Date().toISOString(),
      message: hasRiotKey ? 'API Key configured correctly' : 'RIOT_API_KEY missing'
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}