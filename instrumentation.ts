export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 只有明确启用代理时才配置
    if (process.env.ENABLE_PROXY !== 'true') {
      return
    }

    try {
      // 动态导入 undici
      const { setGlobalDispatcher, ProxyAgent, request } = await import('undici')
      
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy
      
      if (proxyUrl) {
        console.log('🔧 检测到代理配置:', proxyUrl)
        
        // 测试代理连接
        try {
          const proxyAgent = new ProxyAgent(proxyUrl)
          console.log('⏳ 测试代理连接到 Google...')
          
          const { statusCode } = await request('https://www.google.com', {
            dispatcher: proxyAgent,
            method: 'HEAD',
            headersTimeout: 5000,
          })
          
          if (statusCode === 200 || statusCode === 301 || statusCode === 302) {
            console.log('✅ 代理连接成功！状态码:', statusCode)
            setGlobalDispatcher(proxyAgent)
          } else {
            console.log('⚠️  代理响应异常，状态码:', statusCode)
            setGlobalDispatcher(proxyAgent)
          }
        } catch (error) {
          console.error('❌ 代理连接失败:', error instanceof Error ? error.message : error)
          console.log('💡 提示: 请确认代理软件正在运行且端口正确')
        }
      } else {
        console.log('⚠️  ENABLE_PROXY=true 但未配置 HTTP_PROXY 或 HTTPS_PROXY')
      }
    } catch (error) {
      console.error('❌ 无法加载 undici 模块:', error)
    }
  }
}
