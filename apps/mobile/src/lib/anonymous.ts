import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'

const ANON_ID_KEY = 'settlr_anonymous_id'

export async function getAnonymousId(): Promise<string> {
  try {
    const storedId = await AsyncStorage.getItem(ANON_ID_KEY)
    if (storedId) {
      return storedId
    }
    const newId = Crypto.randomUUID()
    await AsyncStorage.setItem(ANON_ID_KEY, newId)
    return newId
  } catch (error) {
    console.warn('[Anonymous] Failed to get/set anonymous_id:', error)
    // Fallback if AsyncStorage fails
    return Crypto.randomUUID()
  }
}
