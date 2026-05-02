import Constants from 'expo-constants'

export const getBaseUrl = () => {
  if (__DEV__) {
    // Expo Go / dev client gives you the debugger host
    const debuggerHost = Constants.expoConfig?.hostUri
    const localhost = debuggerHost?.split(':')[0]
    return `http://${localhost}:8081`
  }
  // Production: use the URL from app.json extra config or environment
  return (
    Constants.expoConfig?.extra?.apiUrl || 'https://mobile-dev.chinwike.space'
  )
}
