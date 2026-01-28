import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, Text, View } from 'react-native';
import RandomCard from './RandomCard';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const CARD_COUNT = 5;

export default function OracleCard() {
  const [shuffling, setShuffling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    id: string;
    name: string;
    number: string;
    description: string;
    image_url: string | null;
  } | null>(null);

  const deckScale = useRef(new Animated.Value(1)).current;
  const deckOpacity = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef<Array<{ x: Animated.Value; y: Animated.Value; rotate: Animated.Value; opacity: Animated.Value; scale: Animated.Value }>>([]);

  // Initialize card animations
  if (cardAnimations.current.length === 0) {
    for (let i = 0; i < CARD_COUNT; i++) {
      cardAnimations.current.push({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(1),
      });
    }
  }

  const onShuffleFinished = useCallback(async () => {
    // Get total count
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });

    if (countError || !count) {
      console.error('Error getting card count:', countError);
      return;
    }

    // Pick random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch one card at random offset
    const { data, error } = await supabase
      .from('cards')
      .select('id, name, number, description, image_url')
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error('Error fetching card:', error);
      return;
    }

    setSelectedCard(data);

    setTimeout(() => {
      setShowResult(true);
    }, 200);
  }, []);

  const startShuffle = () => {
    if (shuffling) return;

    setShowResult(false);
    setShuffling(true);
    Animated.timing(deckOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Animate all cards with smooth spring animations
    cardAnimations.current.forEach((anim, index) => {
      const isEven = index % 2 === 0;
      const direction = isEven ? -1 : 1;
      const delay = index * 60;

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.spring(anim.x, {
              toValue: direction * (width * 0.3),
              friction: 7,
              tension: 60,
              useNativeDriver: false,
            }),
            Animated.spring(anim.x, {
              toValue: 0,
              friction: 7,
              tension: 60,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.spring(anim.rotate, {
              toValue: direction * 18,
              friction: 8,
              tension: 50,
              useNativeDriver: false,
            }),
            Animated.spring(anim.rotate, {
              toValue: 0,
              friction: 8,
              tension: 50,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.spring(anim.scale, {
              toValue: 1.12,
              friction: 9,
              tension: 45,
              useNativeDriver: false,
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              friction: 9,
              tension: 45,
              useNativeDriver: false,
            }),
          ]),
        ]).start();
      }, delay);
    });

    setTimeout(() => {
      setShuffling(false);
      onShuffleFinished();
      Animated.timing(deckOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, 1900);
  };

  const closeResult = () => {
    setShowResult(false);
    setShuffling(false);
  };

  return (
    <View className="flex-1 items-center justify-center">
      {/* Shuffle cards layer */}
      {cardAnimations.current.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            {
              position: 'absolute',
              width: 240,
              height: 400,
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: '#171717',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              elevation: 10,
              opacity: anim.opacity,
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [-360, 0, 360],
                    outputRange: ['-360deg', '0deg', '360deg'],
                  }),
                },
                { scale: anim.scale },
              ],
            },
          ]}
        >
          {/* Shuffle Cards Layout */}
          <LinearGradient
            colors={['#1e1e1e', '#000']}
            className="flex-1 justify-between p-8"
          >
            <View className="items-center">
              <Text className="text-amber-200/40 tracking-[4px] uppercase text-[10px] font-bold">The Oracle</Text>
              <View className="h-[1px] w-16 bg-amber-200/20 mt-2" />
            </View>

            <View className="items-center">
              <Text className="text-white text-4xl font-light text-center">Conscious Lead</Text>
              <Text className="text-amber-200/60 italic mt-4">Tap to Shuffle</Text>
            </View>

            <Text className="text-gray-500 text-center text-xs italic">By Karina Conscious</Text>
          </LinearGradient>

        </Animated.View>
      ))}

      {/* Main Card */}
      {!shuffling && (
        <Pressable
          onPressIn={() => {
            Animated.timing(deckScale, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: false,
            }).start();
          }}
          onPressOut={() => {
            Animated.timing(deckScale, {
              toValue: 1,
              duration: 100,
              useNativeDriver: false,
            }).start();
          }}
          onPress={startShuffle}
        >
          <Animated.View
            style={{
              opacity: deckOpacity,
              transform: [{ scale: deckScale }],
            }}
          >
            <View className="w-72 h-[420px] rounded-[32px] bg-neutral-900 border border-white/10 overflow-hidden shadow-2xl">
              <LinearGradient
                colors={['#1e1e1e', '#000']}
                className="flex-1 justify-between p-8"
              >
                <View className="items-center">
                  <Text className="text-amber-200/40 tracking-[4px] uppercase text-[10px] font-bold">The Oracle</Text>
                  <View className="h-[1px] w-16 bg-amber-200/20 mt-2" />
                </View>

                <View className="items-center">
                  <Text className="text-white text-4xl font-light text-center">Conscious Lead</Text>
                  <Text className="text-amber-200/60 italic mt-4">Tap to Shuffle</Text>
                </View>

                <Text className="text-gray-500 text-center text-xs italic">By Karina Conscious</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </Pressable>
      )}

      {/* Result popup */}
      {selectedCard && (
        <RandomCard
          visible={showResult}
          card={selectedCard}
          onClose={closeResult}
        />
      )}
    </View>
  );
}