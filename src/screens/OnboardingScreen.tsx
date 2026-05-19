/**
 * OnboardingScreen — Multi-step carousel introducing the Nurse App.
 * Slide through features, then proceed to login.
 */
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fonts, fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { setOnboardingCompleted } from '../utils/onboardingStorage';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinished: () => void;
}

interface Slide {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: 'stethoscope',
    title: 'Welcome, Nurse',
    description:
      'VytalYou Nurse is your dedicated companion for delivering premium at-home medical & longevity services.',
    color: colors.accentTeal,
  },
  {
    id: '2',
    icon: 'clipboard-check-outline',
    title: 'Smart Bookings',
    description:
      'Receive, accept, and manage booking requests in real-time. View client details, location, and required inventory at a glance.',
    color: colors.accentAqua,
  },
  {
    id: '3',
    icon: 'shield-check-outline',
    title: 'Guided Workflow',
    description:
      'Follow structured checklists: Start OTP → Vitals → Consent → Service → End OTP. Every step is tracked for quality assurance.',
    color: colors.accentGreen,
  },
  {
    id: '4',
    icon: 'chart-line',
    title: 'Build Your Profile',
    description:
      'Upload your credentials, complete onboarding, and start serving clients with confidence.',
    color: colors.accentCyan,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinished,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await setOnboardingCompleted(true);
      onFinished();
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted(true);
    onFinished();
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { borderColor: item.color + '40' }]}>
        <View
          style={[
            styles.iconInner,
            { backgroundColor: item.color + '15' },
          ]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={64}
            color={item.color}
          />
        </View>
      </View>
      <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: slides[i].color,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Next / Get Started button */}
      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.nextButton,
          {
            backgroundColor: slides[currentIndex].color,
          },
          pressed && styles.nextPressed,
        ]}>
        <Text style={styles.nextText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
        <MaterialCommunityIcons
          name={
            currentIndex === slides.length - 1
              ? 'arrow-right'
              : 'chevron-right'
          }
          size={20}
          color={colors.backgroundNavy}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundNavy,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium as any,
    color: colors.textSecondary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  iconInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.bold as any,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular as any,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.section,
    paddingVertical: spacing.md + 2,
    borderRadius: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  nextText: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold as any,
    color: colors.backgroundNavy,
  },
});
