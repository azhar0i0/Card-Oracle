import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

type Props = {
    visible: boolean;
    onClose: () => void;
    card: {
        id: string;
        name: string;
        number: string;
        description: string;
        image_url: string | null;
    };
};

export default function RandomCard({ visible, onClose, card }: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <RandomCardContent onClose={onClose} card={card} />
        </Modal>
    );
}

function RandomCardContent({
    onClose,
    card,
}: {
    onClose: () => void;
    card: {
        id: string;
        name: string;
        number: string;
        description: string;
        image_url: string | null;
    };
}) {
    const cardScale = useRef(new Animated.Value(0.8)).current;
    const floatY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Scale in
        Animated.spring(cardScale, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
        }).start();

        // Floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatY, {
                    toValue: -10,
                    duration: 1300,
                    useNativeDriver: true,
                }),
                Animated.timing(floatY, {
                    toValue: 0,
                    duration: 1300,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.overlay,
                { opacity: fadeAnim },
            ]}
        >
            <BlurView
                intensity={90}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.dimLayer} />

            <Pressable
                onPress={() => {
                    Haptics.selectionAsync();
                    onClose();
                }}
                hitSlop={20}
                style={styles.externalClose}
            >
                <Ionicons name="close" size={26} color="rgba(255,255,255,0.65)" />
            </Pressable>

            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        transform: [
                            { scale: cardScale },
                            { translateY: floatY },
                        ],
                    },
                ]}
            >
                <ImageBackground
                    source={{
                        uri: card.image_url ?? 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1200&auto=format&fit=crop',
                    }}
                    style={styles.cardImage}
                    imageStyle={{ borderRadius: 28 }}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
                        style={styles.scrim}
                    >
                        <View style={styles.textContainer}>
                            <Text style={styles.titleText}>{card.name}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.messageText}>{card.description}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </Animated.View>

            <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onClose();
                    }}
                    style={({ pressed }) => [
                        styles.drawAgainBtn,
                        { opacity: pressed ? 0.85 : 1 },
                    ]}
                >
                    <Ionicons name="refresh" size={20} color="#E9B86F" />
                    <Text style={styles.drawAgainText}>Draw Again</Text>
                </Pressable>

                <Text style={styles.subtext}>Trust the process</Text>
            </Animated.View>
        </Animated.View>
    );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    dimLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    externalClose: {
        position: 'absolute',
        top: 50,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        zIndex: 1001,
    },
    cardContainer: {
        width: width * 0.78,
        height: height * 0.52,
        borderRadius: 28,
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 30 },
        shadowOpacity: 0.65,
        shadowRadius: 35,
        elevation: 24,
    },
    cardImage: {
        flex: 1,
    },
    scrim: {
        flex: 1,
        borderRadius: 28,
        justifyContent: 'flex-start',
        padding: 32,
    },
    textContainer: {
        alignItems: 'center',
    },
    titleText: {
        color: '#E9B86F',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 16,
        opacity: 0.95,
    },
    divider: {
        width: 36,
        height: 1,
        backgroundColor: 'rgba(233,184,111,0.4)',
        marginBottom: 22,
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 22,
        lineHeight: 32,
        textAlign: 'center',
        fontWeight: '300',
        fontStyle: 'italic',
    },
    bottomContainer: {
        marginTop: 42,
        alignItems: 'center',
    },
    drawAgainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#E9B86F',
        backgroundColor: 'rgba(233, 184, 111, 0.08)',
    },
    drawAgainText: {
        color: '#E9B86F',
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    subtext: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: 10,
        marginTop: 16,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
