import React from 'react'
import { View, StyleSheet } from 'react-native'
import SectionTitle from './SectionTitle'
import BestForChips from './BestForChips'
import ExperienceGrid from './ExperienceGrid'
import ProsConsCard from './ProsConsCard'
import { spacing } from '../../lib/tokens'
import type { ExperienceScore, ProConItem } from '../../lib/placeholders'

interface WhyChooseSectionProps {
  bestFor: string[]
  experienceScores?: ExperienceScore[]
  pros?: ProConItem[]
  cons?: ProConItem[]
}

export function WhyChooseSection({
  bestFor,
  experienceScores,
  pros,
  cons,
}: WhyChooseSectionProps) {
  const hasContent = bestFor.length > 0 || (experienceScores && experienceScores.length > 0) || (pros && pros.length > 0) || (cons && cons.length > 0)
  
  if (!hasContent) return null

  return (
    <View style={styles.container}>
      <SectionTitle title="Why Students Choose This" light size="xl" />
      
      {bestFor.length > 0 && (
        <View style={styles.block}>
          <SectionTitle title="Ideal For" light />
          <BestForChips items={bestFor} />
        </View>
      )}

      {experienceScores && experienceScores.length > 0 && (
        <View style={styles.block}>
          <SectionTitle title="Experience Scores" subtitle="Based on reviews" light />
          <ExperienceGrid scores={experienceScores} />
        </View>
      )}

      {((pros && pros.length > 0) || (cons && cons.length > 0)) && (
        <View style={styles.block}>
          <SectionTitle title="What Students Say" light />
          <ProsConsCard pros={pros ?? []} cons={cons ?? []} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // margins handled by layout
  },
  block: {
    marginTop: spacing.xl,
  },
})
