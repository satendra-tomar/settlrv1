import { useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, fontSize, spacing } from '../../src/lib/tokens'

export default function SplashScreen() {
  const router = useRouter()

  async function navigate() {
    const onboarded = await AsyncStorage.getItem('onboarded')
    if (onboarded) {
      router.replace('/(tabs)/')
    } else {
      router.replace('/(auth)/onboarding')
    }
  }

  useEffect(() => {
    const timer = setTimeout(navigate, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <TouchableOpacity style={styles.fill} onPress={navigate} activeOpacity={1}>
      <LinearGradient
        colors={[colors.darkTop, colors.darkBottom]}
        style={styles.fill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.center}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>Settlr</Text>
          <Text style={styles.tagline}>Find your perfect coaching & stay</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  wordmark: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
})
